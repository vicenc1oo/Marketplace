const agentService = require('./agent.service');
const { sendJson } = require('../../utils/response.utils');

function openEventStream(res, statusCode = 200) {
    res.status(statusCode);
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
}

function writeStreamEvent(res, event, data) {
    res.write(
        `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
    );
}

function createAbortSignal(res) {
    const abortController = new AbortController();

    res.once('close', () => {
        if (!res.writableEnded) {
            abortController.abort();
        }
    });

    return abortController.signal;
}

async function createConversationStream(req, res, next) {
    const signal = createAbortSignal(res);

    try {
        const conversation = await agentService.createConversation(
            req.user.id,
            req.body.message,
        );

        openEventStream(res, 201);

        writeStreamEvent(res, 'start', {
            conversation,
        });

        const assistantMessage =
            await agentService.generateConversationReplyStream(
                req.user.id,
                conversation.id,
                (fragment) => {
                    writeStreamEvent(res, 'delta', {
                        content: fragment,
                    });
                },
                signal,
            );

        writeStreamEvent(res, 'done', {
            message: assistantMessage,
        });

        return res.end();
    } catch (error) {
        if (signal.aborted || res.destroyed || res.writableEnded) {
            return;
        }

        if (res.headersSent) {
            writeStreamEvent(res, 'error', {
                message: error.message,
            });

            return res.end();
        }

        return next(error);
    }
}

async function listConversations(req, res, next) {
    try {
        const conversations = await agentService.listConversations(
            req.user.id,
        );

        return sendJson(res, conversations);
    } catch (error) {
        return next(error);
    }
}

async function getConversation(req, res, next) {
    try {
        const conversation = await agentService.getConversation(
            req.user.id,
            req.params.conversationId,
        );

        return sendJson(res, conversation);
    } catch (error) {
        return next(error);
    }
}

async function sendMessageStream(req, res, next) {
    const signal = createAbortSignal(res);

    try {
        const userMessage = await agentService.addMessage(
            req.user.id,
            req.params.conversationId,
            'user',
            req.body.message,
        );

        openEventStream(res);

        writeStreamEvent(res, 'start', {
            conversationId: req.params.conversationId,
            message: userMessage,
        });

        const assistantMessage =
            await agentService.generateConversationReplyStream(
                req.user.id,
                req.params.conversationId,
                (fragment) => {
                    writeStreamEvent(res, 'delta', {
                        content: fragment,
                    });
                },
                signal,
            );

        writeStreamEvent(res, 'done', {
            message: assistantMessage,
        });

        return res.end();
    } catch (error) {
        if (signal.aborted || res.destroyed || res.writableEnded) {
            return;
        }

        if (res.headersSent) {
            writeStreamEvent(res, 'error', {
                message: error.message,
            });

            return res.end();
        }

        return next(error);
    }
}

async function deleteConversation(req, res, next) {
    try {
        const result = await agentService.deleteConversation(
            req.user.id,
            req.params.conversationId,
        );

        return sendJson(res, result);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    deleteConversation,
    getConversation,
    createConversationStream,
    listConversations,
    sendMessageStream,
};