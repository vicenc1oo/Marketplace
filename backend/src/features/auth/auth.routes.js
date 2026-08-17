const express = require('express');
const authController = require('./auth.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.get('/me', requireAuth, authController.me);

module.exports = router;
