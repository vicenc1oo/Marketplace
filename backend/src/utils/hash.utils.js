const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

async function hashPassword(password) {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    const derivedKey = await scrypt(String(password), salt, KEY_LENGTH);

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
    if (!storedHash || typeof storedHash !== 'string') return false;

    const [algorithm, salt, hash] = storedHash.split(':');
    if (algorithm !== 'scrypt' || !salt || !hash) return false;

    const storedBuffer = Buffer.from(hash, 'hex');
    const derivedKey = await scrypt(String(password), salt, storedBuffer.length);

    if (storedBuffer.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(storedBuffer, derivedKey);
}

module.exports = {
    hashPassword,
    verifyPassword,
};
