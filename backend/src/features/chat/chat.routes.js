const express = require('express');
const chatController = require('./chat.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);
router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.startConversation);
router.get('/conversations/:id', chatController.getConversation);
router.post('/conversations/:id/messages', chatController.sendMessage);

module.exports = router;
