const express = require('express');
const listingController = require('./listing.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const listingRouter = express.Router();
const categoryRouter = express.Router();

categoryRouter.get('/', listingController.getCategories);

listingRouter.get('/', listingController.listListings);
listingRouter.get('/featured', listingController.getFeatured);
listingRouter.get('/recent', listingController.getRecent);
listingRouter.get('/favorites', requireAuth, listingController.getFavorites);
listingRouter.get('/:id', listingController.getListing);
listingRouter.post('/', requireAuth, listingController.createListing);
listingRouter.put('/:id', requireAuth, listingController.updateListing);
listingRouter.delete('/:id', requireAuth, listingController.deleteListing);
listingRouter.post('/:id/favorite', requireAuth, listingController.toggleFavorite);

module.exports = { listingRouter, categoryRouter };
