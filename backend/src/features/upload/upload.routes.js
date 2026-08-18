const express = require('express');
const multer = require('multer');
const uploadController = require('./upload.controller');
const uploadService = require('./upload.service');
const { requireAuth } = require('../../middleware/auth.middleware');
const { createHttpError } = require('../../utils/response.utils');

uploadService.ensureUploadDirectory();

const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, uploadService.LISTING_UPLOAD_DIR),
    filename: (req, file, callback) => {
        callback(null, uploadService.createStoredFilename(file.mimetype));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: uploadService.MAX_FILE_SIZE, files: 1 },
    fileFilter: (req, file, callback) => {
        if (!uploadService.isSupportedMimeType(file.mimetype)) {
            return callback(createHttpError(400, 'Only JPG, PNG, WebP and GIF images are allowed.'));
        }
        return callback(null, true);
    },
});

function receiveSingleImage(req, res, next) {
    upload.single('file')(req, res, (error) => {
        if (!error) return next();
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return next(createHttpError(413, 'The image must be 5 MB or smaller.'));
        }
        if (error instanceof multer.MulterError) {
            return next(createHttpError(400, error.message));
        }
        return next(error);
    });
}

const router = express.Router();

router.post('/', requireAuth, receiveSingleImage, uploadController.uploadImage);

module.exports = router;
