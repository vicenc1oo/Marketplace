const express = require('express');
const analyticsController = require('./analytics.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/dashboard', requireAuth, analyticsController.getDashboardStats);

module.exports = router;
