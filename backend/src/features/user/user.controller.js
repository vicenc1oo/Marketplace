const userService = require('./user.service');
const { sendJson } = require('../../utils/response.utils');

async function getUser(req, res, next) {
    try {
        const user = await userService.getUser(req.params.id);
        return sendJson(res, user);
    } catch (error) {
        return next(error);
    }
}

async function updateMe(req, res, next) {
    try {
        const user = await userService.updateMe(req.user.id, req.body || {});
        return sendJson(res, user);
    } catch (error) {
        return next(error);
    }
}

async function getUserListings(req, res, next) {
    try {
        const listings = await userService.getUserListings(req.params.id);
        return sendJson(res, listings);
    } catch (error) {
        return next(error);
    }
}

async function getReviews(req, res, next) {
    try {
        const reviews = await userService.getReviews(req.params.id);
        return sendJson(res, reviews);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getUser,
    updateMe,
    getUserListings,
    getReviews,
};