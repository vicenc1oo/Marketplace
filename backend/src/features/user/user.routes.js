const express = require('express');
const userController = require('./user.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.put('/me', requireAuth, userController.updateMe);
router.get('/:id', userController.getUser);
router.get('/:id/listings', userController.getUserListings);
router.get('/:id/reviews', userController.getReviews);

module.exports = router;