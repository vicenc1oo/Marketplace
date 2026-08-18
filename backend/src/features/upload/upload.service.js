const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { env } = require('../../config/env');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const UPLOAD_ROOT = path.resolve(__dirname, '../../../uploads');
const LISTING_UPLOAD_DIR = path.join(UPLOAD_ROOT, 'listings');

const EXTENSION_BY_MIME = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

function ensureUploadDirectory() {
    fs.mkdirSync(LISTING_UPLOAD_DIR, { recursive: true });
}

function isSupportedMimeType(mimeType) {
    return Object.hasOwn(EXTENSION_BY_MIME, mimeType);
}

function createStoredFilename(mimeType) {
    const id = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : crypto.randomBytes(16).toString('hex');

    // The extension comes from the accepted MIME type, never from user input.
    return `${id}${EXTENSION_BY_MIME[mimeType]}`;
}

function hasExpectedSignature(buffer, mimeType) {
    if (mimeType === 'image/jpeg') {
        return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    if (mimeType === 'image/png') {
        return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }
    if (mimeType === 'image/gif') {
        const signature = buffer.subarray(0, 6).toString('ascii');
        return signature === 'GIF87a' || signature === 'GIF89a';
    }
    if (mimeType === 'image/webp') {
        return buffer.subarray(0, 4).toString('ascii') === 'RIFF'
            && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    }
    return false;
}

async function validateStoredImage(file) {
    const handle = await fs.promises.open(file.path, 'r');
    try {
        const buffer = Buffer.alloc(12);
        const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
        return bytesRead > 0 && hasExpectedSignature(buffer.subarray(0, bytesRead), file.mimetype);
    } finally {
        await handle.close();
    }
}

async function removeStoredFile(file) {
    if (!file?.path) return;
    await fs.promises.unlink(file.path).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
    });
}

function toPublicFile(file) {
    return {
        url: `${env.apiPrefix}/uploads/listings/${file.filename}`,
        name: file.originalname,
    };
}

module.exports = {
    MAX_FILE_SIZE,
    UPLOAD_ROOT,
    LISTING_UPLOAD_DIR,
    ensureUploadDirectory,
    isSupportedMimeType,
    createStoredFilename,
    validateStoredImage,
    removeStoredFile,
    toPublicFile,
};
