const express = require('express');
const promotionController = require('./promotion.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/packages', promotionController.getPackages);
router.post('/', requireAuth, promotionController.promoteListing);

module.exports = router;
