const express = require('express');
const analyticsController = require('./analytics.controller');

const router = express.Router();

router.get('/dashboard', analyticsController.getDashboardStats);

module.exports = router;
