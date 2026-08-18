const express = require('express');
const notificationController = require('./notification.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);
router.get('/', notificationController.getNotifications);
router.post('/read-all', notificationController.markAllNotificationsRead);
router.post('/:id/read', notificationController.markNotificationRead);

module.exports = router;
