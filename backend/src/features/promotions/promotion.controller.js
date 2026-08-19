const promotionService = require('./promotion.service');
const { sendJson } = require('../../utils/response.utils');

async function getPackages(req, res, next) {
    try {
        return sendJson(res, await promotionService.listPackages());
    } catch (error) {
        return next(error);
    }
}

async function promoteListing(req, res, next) {
    try {
        const result = await promotionService.promoteListing(req.user.id, req.body);
        return sendJson(res, result, 201);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getPackages,
    promoteListing,
};
