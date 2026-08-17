const { env } = require('../config/env');

function notFoundHandler(req, res, next) {
    next(Object.assign(new Error(`Route not found: ${req.method} ${req.originalUrl}`), {
        statusCode: 404,
    }));
}

function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || error.status || 500;
    const isServerError = statusCode >= 500;
    const message = isServerError && env.nodeEnv === 'production'
        ? 'Internal server error'
        : error.message || 'Internal server error';

    const payload = { message };
    if (error.details !== undefined) payload.details = error.details;
    if (env.nodeEnv !== 'production' && error.stack) payload.stack = error.stack;

    return res.status(statusCode).json(payload);
}

module.exports = {
    notFoundHandler,
    errorHandler,
};
