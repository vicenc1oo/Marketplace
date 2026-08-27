const express = require('express');
const agentController = require('./agent.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { aiAgentRateLimit } = require('../../middleware/rateLimit.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', agentController.listConversations);
router.post('/', aiAgentRateLimit, agentController.createConversationStream);
router.get('/:conversationId', agentController.getConversation);
router.post('/:conversationId/messages', aiAgentRateLimit, agentController.sendMessageStream);
router.delete('/:conversationId', agentController.deleteConversation);

module.exports = router;