const crypto = require('crypto');
const { pool, query } = require('../../config/db');
const listingModel = require('../listings/listing.model');
const authService = require('../auth/auth.service');
const { createHttpError } = require('../../utils/response.utils');

const MAX_MESSAGE_LENGTH = 2000;

function makeId(prefix) {
    return typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function validateMessageText(value) {
    const text = String(value || '').trim();
    if (!text || text.length > MAX_MESSAGE_LENGTH) {
        throw createHttpError(400, `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`);
    }
    return text;
}

function toMessage(row) {
    return {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        text: row.text,
        read: row.read,
        createdAt: row.created_at,
    };
}

async function getConversationAccess(userId, conversationId, client = { query }) {
    const result = await client.query(
        `SELECT c.id, c.listing_id, cp.user_id
     FROM conversations c
     JOIN conversation_participants cp ON cp.conversation_id = c.id
     WHERE c.id = $1`,
        [conversationId],
    );
    if (!result.rowCount) throw createHttpError(404, 'Conversation not found.');

    const participantIds = result.rows.map((row) => row.user_id);
    if (!participantIds.includes(userId)) {
        throw createHttpError(403, 'You do not have access to this conversation.');
    }

    return {
        id: result.rows[0].id,
        listingId: result.rows[0].listing_id,
        participantIds,
        otherUserId: participantIds.find((id) => id !== userId),
    };
}

async function attachListing(listingId) {
    if (!listingId) return null;
    const listing = await listingModel.findById(listingId);
    if (!listing) return null;
    return {
        ...listing,
        seller: await authService.findUserById(listing.sellerId),
    };
}

async function buildConversation(userId, conversationId, includeMessages = false) {
    const access = await getConversationAccess(userId, conversationId);
    const [other, listing, lastMessageResult, unreadResult] = await Promise.all([
        authService.findUserById(access.otherUserId),
        attachListing(access.listingId),
        query(
            `SELECT id, conversation_id, sender_id, text, read, created_at
       FROM messages WHERE conversation_id = $1
       ORDER BY created_at DESC LIMIT 1`,
            [conversationId],
        ),
        query(
            `SELECT COUNT(*)::int AS count FROM messages
       WHERE conversation_id = $1 AND sender_id <> $2 AND read = false`,
            [conversationId, userId],
        ),
    ]);

    const conversation = {
        id: conversationId,
        listing,
        other,
        lastMessage: lastMessageResult.rows[0] ? toMessage(lastMessageResult.rows[0]) : null,
        unread: unreadResult.rows[0].count,
    };

    if (includeMessages) {
        const messagesResult = await query(
            `SELECT id, conversation_id, sender_id, text, read, created_at
       FROM messages WHERE conversation_id = $1
       ORDER BY created_at ASC`,
            [conversationId],
        );
        conversation.messages = messagesResult.rows.map(toMessage);
    }

    return conversation;
}

async function listConversations(userId) {
    const result = await query(
        `SELECT c.id
     FROM conversations c
     JOIN conversation_participants cp ON cp.conversation_id = c.id
     WHERE cp.user_id = $1
     ORDER BY c.updated_at DESC`,
        [userId],
    );
    return Promise.all(result.rows.map(({ id }) => buildConversation(userId, id)));
}

async function getConversation(userId, conversationId) {
    await getConversationAccess(userId, conversationId);
    await query(
        `UPDATE messages SET read = true
     WHERE conversation_id = $1 AND sender_id <> $2 AND read = false`,
        [conversationId, userId],
    );
    return buildConversation(userId, conversationId, true);
}

async function findConversation(client, listingId, firstUserId, secondUserId) {
    const result = await client.query(
        `SELECT c.id
     FROM conversations c
     WHERE c.listing_id = $1
       AND EXISTS (
         SELECT 1 FROM conversation_participants cp
         WHERE cp.conversation_id = c.id AND cp.user_id = $2
       )
       AND EXISTS (
         SELECT 1 FROM conversation_participants cp
         WHERE cp.conversation_id = c.id AND cp.user_id = $3
       )
       AND (SELECT COUNT(*) FROM conversation_participants cp
            WHERE cp.conversation_id = c.id) = 2
     LIMIT 1`,
        [listingId, firstUserId, secondUserId],
    );
    return result.rows[0]?.id || null;
}

async function startConversation(userId, payload = {}) {
    const listingId = String(payload.listingId || '').trim();
    const text = validateMessageText(payload.text);
    if (!listingId) throw createHttpError(400, 'Listing id is required.');

    const listingResult = await query(
        'SELECT id, seller_id FROM listings WHERE id = $1',
        [listingId],
    );
    if (!listingResult.rowCount) throw createHttpError(404, 'Listing not found.');
    const sellerId = listingResult.rows[0].seller_id;
    if (sellerId === userId) throw createHttpError(400, 'You cannot message yourself about your own listing.');

    const client = await pool.connect();
    let conversationId;
    let message;
    try {
        await client.query('BEGIN');

        // The advisory lock prevents duplicate conversations from concurrent requests.
        const lockKey = [listingId, userId, sellerId].sort().join(':');
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [lockKey]);
        conversationId = await findConversation(client, listingId, userId, sellerId);

        if (!conversationId) {
            conversationId = makeId('conversation');
            await client.query(
                'INSERT INTO conversations (id, listing_id) VALUES ($1, $2)',
                [conversationId, listingId],
            );
            await client.query(
                `INSERT INTO conversation_participants (conversation_id, user_id)
         VALUES ($1, $2), ($1, $3)`,
                [conversationId, userId, sellerId],
            );
        }

        const messageResult = await client.query(
            `INSERT INTO messages (id, conversation_id, sender_id, text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, conversation_id, sender_id, text, read, created_at`,
            [makeId('message'), conversationId, userId, text],
        );
        message = toMessage(messageResult.rows[0]);
        await client.query(
            'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
            [conversationId],
        );
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    return {
        conversation: await buildConversation(userId, conversationId, true),
        recipientConversation: await buildConversation(sellerId, conversationId),
        message,
        recipientId: sellerId,
    };
}

async function sendMessage(userId, conversationId, value) {
    const text = validateMessageText(value);
    const client = await pool.connect();
    let message;
    let recipientId;

    try {
        await client.query('BEGIN');
        const access = await getConversationAccess(userId, conversationId, client);
        recipientId = access.otherUserId;
        if (!recipientId) throw createHttpError(400, 'Conversation has no recipient.');

        const result = await client.query(
            `INSERT INTO messages (id, conversation_id, sender_id, text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, conversation_id, sender_id, text, read, created_at`,
            [makeId('message'), conversationId, userId, text],
        );
        message = toMessage(result.rows[0]);
        await client.query(
            'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
            [conversationId],
        );
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    return {
        message,
        recipientId,
        recipientConversation: await buildConversation(recipientId, conversationId),
    };
}

module.exports = {
    MAX_MESSAGE_LENGTH,
    listConversations,
    getConversation,
    startConversation,
    sendMessage,
};
