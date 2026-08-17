const authService = require('./auth.service');
const { sendJson } = require('../../utils/response.utils');

async function login(req, res, next) {
    try {
        const result = await authService.login(req.body || {});
        return sendJson(res, result);
    } catch (error) {
        return next(error);
    }
}

async function register(req, res, next) {
    try {
        const result = await authService.register(req.body || {});
        return sendJson(res, result, 201);
    } catch (error) {
        return next(error);
    }
}

async function me(req, res, next) {
    try {
        return sendJson(res, req.user);
    } catch (error) {
        return next(error);
    }
}

async function forgotPassword(req, res, next) {
    try {
        const result = await authService.forgotPassword(req.body?.email);
        return sendJson(res, result);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    login,
    register,
    me,
    forgotPassword,
};
