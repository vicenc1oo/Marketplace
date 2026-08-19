const biddingService = require('./bidding.service');
const biddingSocket = require('./bidding.socket');
const { sendJson } = require('../../utils/response.utils');

async function getActiveAuctions(req, res, next) {
    try {
        return sendJson(res, await biddingService.getActiveAuctions());
    } catch (error) {
        return next(error);
    }
}

async function getBids(req, res, next) {
    try {
        return sendJson(res, await biddingService.getBids(req.params.id));
    } catch (error) {
        return next(error);
    }
}

async function placeBid(req, res, next) {
    try {
        const bid = await biddingService.placeBid(req.user.id, req.params.id, req.body?.amount);
        biddingSocket.broadcastBid(bid);
        return sendJson(res, bid, 201);
    } catch (error) {
        return next(error);
    }
}

async function getMyBids(req, res, next) {
    try {
        return sendJson(res, await biddingService.getMyBids(req.user.id));
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getActiveAuctions,
    getBids,
    placeBid,
    getMyBids,
};
