const chatService = require('./chat.service');
const chatSocket = require('./chat.socket');
const notificationService = require('../notifications/notification.service');
const { sendJson } = require('../../utils/response.utils');

async function deliverMessage(sender, result) {
    chatSocket.broadcastMessage(result.recipientId, result.message);
    chatSocket.broadcastConversation(result.recipientId, result.recipientConversation);
    await notificationService.createNotification(result.recipientId, {
        type: 'message',
        text: `New message from ${sender.name}.`,
        link: `/chat/${result.message.conversationId}`,
    }).catch(() => {});
}

async function getConversations(req, res, next) {
    try {
        return sendJson(res, await chatService.listConversations(req.user.id));
    } catch (error) {
        return next(error);
    }
}

async function getConversation(req, res, next) {
    try {
        return sendJson(res, await chatService.getConversation(req.user.id, req.params.id));
    } catch (error) {
        return next(error);
    }
}

async function startConversation(req, res, next) {
    try {
        const result = await chatService.startConversation(req.user.id, req.body);
        await deliverMessage(req.user, result);
        return sendJson(res, result.conversation, 201);
    } catch (error) {
        return next(error);
    }
}

async function sendMessage(req, res, next) {
    try {
        const result = await chatService.sendMessage(req.user.id, req.params.id, req.body?.text);
        await deliverMessage(req.user, result);
        return sendJson(res, result.message, 201);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getConversations,
    getConversation,
    startConversation,
    sendMessage,
};
