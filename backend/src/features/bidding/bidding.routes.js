const express = require('express');
const biddingController = require('./bidding.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/auctions', biddingController.getActiveAuctions);
router.get('/my-bids', requireAuth, biddingController.getMyBids);
router.get('/:id/bids', biddingController.getBids);
router.post('/:id/bids', requireAuth, biddingController.placeBid);

module.exports = router;
