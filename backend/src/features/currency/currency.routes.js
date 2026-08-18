const express = require('express');
const currencyController = require('./currency.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/wallet', requireAuth, currencyController.getWallet);

module.exports = router;
