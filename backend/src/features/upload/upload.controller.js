const uploadService = require('./upload.service');
const { createHttpError, sendJson } = require('../../utils/response.utils');

async function uploadImage(req, res, next) {
    try {
        if (!req.file) {
            throw createHttpError(400, 'An image is required in the "file" field.');
        }

        const isValidImage = await uploadService.validateStoredImage(req.file);
        if (!isValidImage) {
            await uploadService.removeStoredFile(req.file);
            throw createHttpError(400, 'The uploaded file content is not a valid image.');
        }

        return sendJson(res, uploadService.toPublicFile(req.file), 201);
    } catch (error) {
        // Remove a partially processed file when validation itself fails.
        if (req.file && error.statusCode !== 400) {
            await uploadService.removeStoredFile(req.file).catch(() => {});
        }
        return next(error);
    }
}

module.exports = { uploadImage };
