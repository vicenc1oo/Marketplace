const analyticsService = require('./analytics.service');
const { sendJson } = require('../../utils/response.utils');

function getCurrentUserId(req) {
    return req.user?.id || req.headers['x-user-id'] || analyticsService.DEFAULT_USER_ID;
}

async function getDashboardStats(req, res, next) {
    try {
        const stats = await analyticsService.getDashboardStats(getCurrentUserId(req));
        return sendJson(res, stats);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getDashboardStats,
};
