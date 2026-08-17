const authService = require('../auth/auth.service');
const userModel = require('./user.model');
const { createHttpError } = require('../../utils/response.utils');

const PROFILE_LIMITS = {
    name: 80,
    bio: 200,
    location: 80,
    avatarUrl: 500,
};

function normalizeId(userId) {
    return String(userId || '').trim();
}

async function assertUserExists(userId) {
    const id = normalizeId(userId);
    if (!id) {
        throw createHttpError(400, 'User id is required.');
    }

    const user = await authService.findUserById(id);
    if (!user) {
        throw createHttpError(404, 'User not found.');
    }
    return user;
}

function trimOptional(value) {
    if (value == null) return '';
    return String(value).trim();
}

function sanitizeProfilePatch(payload = {}) {
    const patch = {};

    if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
        const name = trimOptional(payload.name);
        if (name.length < 2) {
            throw createHttpError(400, 'Name must be at least 2 characters.');
        }
        if (name.length > PROFILE_LIMITS.name) {
            throw createHttpError(400, `Name must be ${PROFILE_LIMITS.name} characters or fewer.`);
        }
        patch.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'bio')) {
        const bio = trimOptional(payload.bio);
        if (bio.length > PROFILE_LIMITS.bio) {
            throw createHttpError(400, `Bio must be ${PROFILE_LIMITS.bio} characters or fewer.`);
        }
        patch.bio = bio;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'location')) {
        const location = trimOptional(payload.location);
        if (location.length > PROFILE_LIMITS.location) {
            throw createHttpError(400, `Location must be ${PROFILE_LIMITS.location} characters or fewer.`);
        }
        patch.location = location;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'avatarUrl')) {
        const avatarUrl = payload.avatarUrl == null ? null : trimOptional(payload.avatarUrl);
        if (avatarUrl && avatarUrl.length > PROFILE_LIMITS.avatarUrl) {
            throw createHttpError(400, `Avatar URL must be ${PROFILE_LIMITS.avatarUrl} characters or fewer.`);
        }
        patch.avatarUrl = avatarUrl || null;
    }
    return patch;
}

async function getUser(userId) {
    return assertUserExists(userId);
}

async function updateMe(userId, payload) {
    await assertUserExists(userId);

    const patch = sanitizeProfilePatch(payload);
    if (!Object.keys(patch).length) {
        return authService.findUserById(userId);
    }
    return authService.updateUserProfile(userId, patch);
}

async function getUserListings(userId) {
    const user = await assertUserExists(userId);
    return userModel.findListingsBySeller(user.id, authService.findUserById);
}

async function getReviews(userId) {
    const user = await assertUserExists(userId);
    const users = await authService.listUsers();
    return userModel.buildReviewsForUser(user.id, users);
}

module.exports = {
    getUser,
    updateMe,
    getUserListings,
    getReviews,
};