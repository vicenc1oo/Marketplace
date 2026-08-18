const listingService = require('./listing.service');
const { sendJson } = require('../../utils/response.utils');

async function getCategories(req, res, next) {
    try {
        return sendJson(res, await listingService.listCategories());
    } catch (error) {
        return next(error);
    }
}

async function listListings(req, res, next) {
    try {
        return sendJson(res, await listingService.listListings(req.query));
    } catch (error) {
        return next(error);
    }
}

async function getListing(req, res, next) {
    try {
        return sendJson(res, await listingService.getListing(req.params.id));
    } catch (error) {
        return next(error);
    }
}

async function getFeatured(req, res, next) {
    try {
        return sendJson(res, await listingService.getFeatured());
    } catch (error) {
        return next(error);
    }
}

async function getRecent(req, res, next) {
    try {
        return sendJson(res, await listingService.getRecent());
    } catch (error) {
        return next(error);
    }
}

async function createListing(req, res, next) {
    try {
        return sendJson(res, await listingService.createListing(req.user.id, req.body), 201);
    } catch (error) {
        return next(error);
    }
}

async function updateListing(req, res, next) {
    try {
        return sendJson(res, await listingService.updateListing(req.user.id, req.params.id, req.body));
    } catch (error) {
        return next(error);
    }
}

async function deleteListing(req, res, next) {
    try {
        return sendJson(res, await listingService.deleteListing(req.user.id, req.params.id));
    } catch (error) {
        return next(error);
    }
}

async function toggleFavorite(req, res, next) {
    try {
        return sendJson(res, await listingService.toggleFavorite(req.user.id, req.params.id));
    } catch (error) {
        return next(error);
    }
}

async function getFavorites(req, res, next) {
    try {
        return sendJson(res, await listingService.getFavorites(req.user.id));
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getCategories,
    listListings,
    getListing,
    getFeatured,
    getRecent,
    createListing,
    updateListing,
    deleteListing,
    toggleFavorite,
    getFavorites,
};
