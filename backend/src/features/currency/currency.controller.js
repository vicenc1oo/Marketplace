const currencyService = require('./currency.service');
const { sendJson } = require('../../utils/response.utils');

function getCurrentUserId(req) {
    return req.user?.id || req.headers['x-user-id'] || currencyService.DEFAULT_USER_ID;
}

async function getWallet(req, res, next) {
    try {
        const wallet = await currencyService.getWallet(getCurrentUserId(req));
        return sendJson(res, wallet);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getWallet,
};
