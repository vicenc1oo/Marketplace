const express = require('express');
const currencyController = require('./currency.controller');

const router = express.Router();

router.get('/wallet', currencyController.getWallet);

module.exports = router;
