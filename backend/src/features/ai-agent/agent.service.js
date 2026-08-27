const crypto = require('node:crypto');
const Groq = require('groq-sdk');
const { env } = require('../../config/env');
const { pool, query } = require('../../config/db');
const { createHttpError } = require('../../utils/response.utils');
const { executeToolCall, toolDefinitions } = require('./agent.tools');

const groq = new Groq({
    apiKey: env.ai.apiKey,
    timeout: env.ai.timeoutMS,
    maxRetries: env.ai.maxRetries,
});

const SYSTEM_PROMPT = `
You are the support assistant for an online marketplace.
Answer clearly and concisely.
Reply in the same language used by the user.
If you do not know something about the platform, say so instead of inventing an answer.
You must use get_my_account_data before answering any question about personal account data.
Use section "profile" for name, username, email, bio, location, rating, reviews count, and membership questions.
Use section "wallet" for balance, credits, wallet, and transaction questions.
Wallet balances and transaction amounts are marketplace credits, not fiat currency.
Never label credits as EUR, USD, BRL, dollars, euros, reais, or another currency.
If a wallet balance is zero or the transaction list is empty, report that result clearly.
Use section "listings" for the user's own listings, items for sale, listing status, prices, views, favorites, and auctions created by the user.
When reporting listing prices, always include the currency returned by the tool.
Do not claim that a listing was sold, promoted, or won unless the tool data explicitly says so.
Use section "notifications" for notifications, alerts, unread notices, and recent account events.
Use section "bids" for bids placed by the user and bids received on the user's own auction listings.
Bid amounts use the currency returned by the tool.
Do not claim that the user won an auction unless that outcome is explicitly present in the data.
Use section "promotions" for promoted listings, promotion packages, active promotions, promotion duration, and promotion costs.
Promotion package costs are marketplace credits, not fiat currency.
The account data tool cannot purchase, activate, or cancel promotions.
The account data tool cannot mark notifications as read.
Never claim to know personal information that was not returned by a tool.
The account data tool is read-only and cannot modify the account.
Never ask the user for passwords, tokens, or other secrets.
`.trim();

function normalizeMessage(value) {
    const message = String(value || '').trim();

    if (!message) {
        throw createHttpError(400, 'Message is required.');
    }

    if (message.length > 2000) {
        throw createHttpError(400, 'Message cannot exceed 2000 characters.');
    }

    return message;
}

function toConversation(row) {
    return {
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function toMessage(row) {
    return {
        id: row.id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
    };
}

async function createConversation(userId, messageValue) {
    const message = normalizeMessage(messageValue);
    const conversationId = crypto.randomUUID();
    const messageId = crypto.randomUUID();
    const title = message.slice(0, 60);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const conversationResult = await client.query(
            `INSERT INTO ai_conversations (id, user_id, title)
             VALUES ($1, $2, $3)
                 RETURNING id, title, created_at, updated_at`,
            [conversationId, userId, title],
        );

        await client.query(
            `INSERT INTO ai_messages (id, conversation_id, role, content)
             VALUES ($1, $2, 'user', $3)`,
            [messageId, conversationId, message],
        );

        await client.query('COMMIT');

        return toConversation(conversationResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function getConversation(userId, conversationId) {
    const conversationResult = await query(
        `SELECT id, title, created_at, updated_at
         FROM ai_conversations
         WHERE id = $1 AND user_id = $2`,
        [conversationId, userId],
    );

    if (!conversationResult.rowCount) {
        throw createHttpError(404, 'Conversation not found.');
    }

    const messagesResult = await query(
        `SELECT id, role, content, created_at
         FROM ai_messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC, id ASC`,
        [conversationId],
    );

    return {
        ...toConversation(conversationResult.rows[0]),
        messages: messagesResult.rows.map(toMessage),
    };
}

async function addMessage(userId, conversationId, role, messageValue) {
    const message = normalizeMessage(messageValue);

    if (!['user', 'assistant'].includes(role)) {
        throw createHttpError(400, 'Message role is invalid.');
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const conversationResult = await client.query(
            `SELECT id
             FROM ai_conversations
             WHERE id = $1 AND user_id = $2
                 FOR UPDATE`,
            [conversationId, userId],
        );

        if (!conversationResult.rowCount) {
            throw createHttpError(404, 'Conversation not found.');
        }

        const messageResult = await client.query(
            `INSERT INTO ai_messages (id, conversation_id, role, content)
             VALUES ($1, $2, $3, $4)
                 RETURNING id, role, content, created_at`,
            [crypto.randomUUID(), conversationId, role, message],
        );

        await client.query(
            `UPDATE ai_conversations
             SET updated_at = NOW()
             WHERE id = $1`,
            [conversationId],
        );

        await client.query('COMMIT');

        return toMessage(messageResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

function accumulateToolCall(toolCalls, fragment) {
    const index = fragment.index ?? 0;

    if (!toolCalls[index]) {
        toolCalls[index] = {
            id: '',
            type: 'function',
            function: {
                name: '',
                arguments: '',
            },
        };
    }

    const toolCall = toolCalls[index];

    if (fragment.id) {
        toolCall.id = fragment.id;
    }

    if (fragment.function?.name) {
        toolCall.function.name += fragment.function.name;
    }

    if (fragment.function?.arguments) {
        toolCall.function.arguments += fragment.function.arguments;
    }
}

async function consumeReplyStream(stream, onFragment) {
    const toolCalls = [];
    let completeResponse = '';
    let finishReason = null;
    let responseType = null;

    for await (const chunk of stream) {
        const choice = chunk.choices[0];

        if (!choice) {
            continue;
        }

        if (choice.finish_reason) {
            finishReason = choice.finish_reason;
        }

        const toolCallFragments = choice.delta?.tool_calls || [];

        if (toolCallFragments.length) {
            if (responseType === 'text') {
                throw createHttpError(
                    502,
                    'AI assistant returned text before requesting a tool.',
                );
            }

            responseType = 'tool';

            for (const fragment of toolCallFragments) {
                accumulateToolCall(toolCalls, fragment);
            }
        }

        const textFragment = choice.delta?.content || '';

        if (textFragment && responseType !== 'tool') {
            responseType = 'text';
            completeResponse += textFragment;
            onFragment(textFragment);
        }
    }

    return {
        toolCalls,
        completeResponse,
        finishReason,
    };
}

function getCompletedResponse(finishReason, completeResponse, toolCalls) {
    if (!finishReason) {
        throw createHttpError(
            502,
            'AI assistant stream ended unexpectedly.',
        );
    }

    const completedToolCalls = toolCalls.filter(Boolean);

    if (completedToolCalls.length) {
        return { completedToolCalls };
    }

    if (!completeResponse.trim()) {
        throw createHttpError(
            502,
            'AI assistant returned an empty response.',
        );
    }

    return {
        content: completeResponse,
        finishReason,
    };
}

async function appendToolResults(groqMessages, userId, toolCalls) {
    for (const toolCall of toolCalls) {
        const toolResult = await executeToolCall(
            userId,
            toolCall,
        );

        groqMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify(toolResult),
        });
    }
}

async function generateReplyStream(userId, messages, onFragment, signal) {
    if (typeof onFragment !== 'function') {
        throw new TypeError('onFragment must be a function.');
    }

    const groqMessages = [
        {
            role: 'system',
            content: SYSTEM_PROMPT,
        },
        ...messages,
    ];

    for (let iteration = 0; iteration < 3; iteration += 1) {
        const stream = await groq.chat.completions.create({
                model: env.ai.model,
                messages: groqMessages,
                tools: toolDefinitions,
                tool_choice: 'auto',
                stream: true,
                max_completion_tokens: env.ai.maxOutputTokens,
                temperature: 0.2,
            },
            {
                signal,
            });

        const streamResult = await consumeReplyStream(stream, onFragment);

        if (signal?.aborted) {
            throw createHttpError(
                499,
                'AI assistant generation was cancelled.',
            );
        }

        const response = getCompletedResponse(
            streamResult.finishReason,
            streamResult.completeResponse,
            streamResult.toolCalls,
        );

        if (!response.completedToolCalls) {
            return response;
        }

        groqMessages.push({
            role: 'assistant',
            content: null,
            tool_calls: response.completedToolCalls,
        });

        await appendToolResults(
            groqMessages,
            userId,
            response.completedToolCalls,
        );
    }

    throw createHttpError(
        502,
        'AI assistant exceeded the tool call limit.',
    );
}

async function listConversations(userId) {
    const result = await query(
        `SELECT id, title, created_at, updated_at
         FROM ai_conversations
         WHERE user_id = $1
         ORDER BY updated_at DESC, created_at DESC`,
        [userId],
    );

    return result.rows.map(toConversation);
}

async function deleteConversation(userId, conversationId) {
    const result = await query(
        `DELETE FROM ai_conversations
		 WHERE id = $1 AND user_id = $2
		 RETURNING id`,
        [conversationId, userId],
    );

    if (!result.rowCount) {
        throw createHttpError(404, 'Conversation not found.');
    }

    return { ok: true };
}

async function generateConversationReplyStream(
    userId,
    conversationId,
    onFragment,
    signal,
) {
    const conversation = await getConversation(
        userId,
        conversationId,
    );

    const messages = conversation.messages
        .slice(-20)
        .map((message) => ({
            role: message.role,
            content: message.content,
        }));

    let reply;

    try {
        const result = await generateReplyStream(
            userId,
            messages,
            onFragment,
            signal,
        );

        reply = result.content;
    } catch (error) {
        if (signal?.aborted) {
            throw error;
        }
        if (!(error instanceof Groq.APIError)) {
            throw error;
        }

        console.error('Groq streaming request failed:', {
            name: error.name,
            status: error.status,
            message: error.message,
        });

        reply = 'The assistant is temporarily unavailable. Please try again in a few moments.';

        onFragment(reply);
    }

    return addMessage(
        userId,
        conversationId,
        'assistant',
        reply,
    );
}

module.exports = {
    addMessage,
    createConversation,
    deleteConversation,
    generateReplyStream,
    getConversation,
    generateConversationReplyStream,
    listConversations,
};