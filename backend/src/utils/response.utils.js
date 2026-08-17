function sendJson(res, data, statusCode = 200) {
    return res.status(statusCode).json(data);
}

function createHttpError(statusCode, message, details) {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (details !== undefined) error.details = details;
    return error;
}

module.exports = {
    sendJson,
    createHttpError,
};
