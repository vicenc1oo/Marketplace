const crypto = require('crypto');
const { env } = require('../config/env');
const { createHttpError } = require('./response.utils');

function base64UrlEncode(value) {
    const input = typeof value === 'string' ? value : JSON.stringify(value);
    return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(segment) {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
}

function signSegments(headerSegment, payloadSegment) {
    return crypto
        .createHmac('sha256', env.jwtSecret)
        .update(`${headerSegment}.${payloadSegment}`)
        .digest('base64url');
}

function signaturesMatch(actualSignature, expectedSignature) {
    const actual = Buffer.from(actualSignature);
    const expected = Buffer.from(expectedSignature);

    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
}

function signToken(payload, options = {}) {
    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = options.expiresInSeconds || env.jwtExpiresInSeconds;

    const headerSegment = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
    const payloadSegment = base64UrlEncode({
        ...payload,
        iat: now,
        exp: now + expiresInSeconds,
    });
    const signature = signSegments(headerSegment, payloadSegment);

    return `${headerSegment}.${payloadSegment}.${signature}`;
}

function verifyToken(token) {
    if (!token || typeof token !== 'string') {
        throw createHttpError(401, 'Authentication token is required.');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        throw createHttpError(401, 'Invalid authentication token.');
    }

    const [headerSegment, payloadSegment, signature] = parts;
    const expectedSignature = signSegments(headerSegment, payloadSegment);

    if (!signaturesMatch(signature, expectedSignature)) {
        throw createHttpError(401, 'Invalid authentication token.');
    }

    let header;
    let payload;

    try {
        header = base64UrlDecode(headerSegment);
        payload = base64UrlDecode(payloadSegment);
    } catch (error) {
        throw createHttpError(401, 'Invalid authentication token.');
    }

    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
        throw createHttpError(401, 'Invalid authentication token.');
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp <= now) {
        throw createHttpError(401, 'Authentication token has expired.');
    }

    return payload;
}

function getBearerToken(authorizationHeader) {
    if (!authorizationHeader) return null;

    const [scheme, token] = String(authorizationHeader).split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
        throw createHttpError(401, 'Invalid authorization header.');
    }

    return token;
}

module.exports = {
    signToken,
    verifyToken,
    getBearerToken,
};
