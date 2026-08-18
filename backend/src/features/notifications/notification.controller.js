const notificationService = require('./notification.service');
const { sendJson } = require('../../utils/response.utils');

async function getNotifications(req, res, next) {
    try {
        const notifications = await notificationService.listNotifications(req.user.id);
        return sendJson(res, notifications);
    } catch (error) {
        return next(error);
    }
}

async function markNotificationRead(req, res, next) {
    try {
        const result = await notificationService.markNotificationRead(req.user.id, req.params.id);
        return sendJson(res, result);
    } catch (error) {
        return next(error);
    }
}

async function markAllNotificationsRead(req, res, next) {
    try {
        const result = await notificationService.markAllNotificationsRead(req.user.id);
        return sendJson(res, result);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
};
