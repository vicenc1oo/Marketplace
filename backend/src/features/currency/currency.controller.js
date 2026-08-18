const currencyService = require('./currency.service');
const { sendJson } = require('../../utils/response.utils');

async function getWallet(req, res, next) {
    try {
        const wallet = await currencyService.getWallet(req.user.id);
        return sendJson(res, wallet);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getWallet,
};
