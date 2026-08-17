const authService = require('../features/auth/auth.service');
const { getBearerToken, verifyToken } = require('../utils/jwt.utils');
const { createHttpError } = require('../utils/response.utils');

async function loadUserFromRequest(req) {
    const token = getBearerToken(req.headers.authorization);
    if (!token) return null;

    const payload = verifyToken(token);
    const user = await authService.findUserById(payload.sub);

    if (!user) {
        throw createHttpError(401, 'Authentication user was not found.');
    }

    return user;
}

async function optionalAuth(req, res, next) {
    try {
        const user = await loadUserFromRequest(req);
        if (user) req.user = user;
        return next();
    } catch (error) {
        return next(error);
    }
}

async function requireAuth(req, res, next) {
    try {
        const user = await loadUserFromRequest(req);

        if (!user) {
            throw createHttpError(401, 'Authentication token is required.');
        }

        req.user = user;
        return next();
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    optionalAuth,
    requireAuth,
};
