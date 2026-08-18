const analyticsService = require('./analytics.service');
const { sendJson } = require('../../utils/response.utils');

async function getDashboardStats(req, res, next) {
    try {
        const stats = await analyticsService.getDashboardStats(req.user.id);
        return sendJson(res, stats);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getDashboardStats,
};
