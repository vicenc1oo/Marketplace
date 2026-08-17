const crypto = require('crypto');
const { createHttpError } = require('../../utils/response.utils');
const { hashPassword, verifyPassword } = require('../../utils/hash.utils');
const { signToken } = require('../../utils/jwt.utils');
const { query } = require('../../config/db');

const usersById = new Map();
const usersByEmail = new Map();

let seedPromise = null;


function clone(value) {
    return structuredClone(value);
}

function toUser(row) {
    if (!row) return null;

    return {
        id: row.id,
        name: row.name,
        username: row.username,
        email: row.email,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        location: row.location,
        rating: Number(row.rating),
        reviewsCount: row.reviews_count,
        online: row.online,
        memberSince: row.member_since instanceof Date
            ? row.member_since.toISOString().slice(0, 10)
            : row.member_since,
        passwordHash: row.password_hash,
        resetToken: row.reset_token,
        resetTokenExpiresAt: row.reset_token_expires_at,
    };
}

async function findUserByEmail(email) {
    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [normalizeEmail(email)],
    );

    return toUser(result.rows[0]);
}


function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function assertEmail(email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw createHttpError(400, 'Enter a valid email address.');
    }
}

function assertStrongPassword(password) {
    const value = String(password || '');

    if (value.length < 8 || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
        throw createHttpError(400, 'Password must be at least 8 characters with upper, lower case and a number.');
    }
}

function toPublicUser(user) {
    const {
        passwordHash,
        resetToken,
        resetTokenExpiresAt,
        ...publicUser
    } = user;

    return clone(publicUser);
}

function createTokenForUser(user) {
    return signToken({
        sub: user.id,
        email: user.email,
    });
}

function makeUserId() {
    return typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `u_${crypto.randomBytes(12).toString('hex')}`;
}

function makeUsername(name, email) {
    const base = String(name || email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 24);

    return base || `user_${crypto.randomBytes(4).toString('hex')}`;
}


async function login({ email, password }) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
        throw createHttpError(400, 'Email and password are required.');
    }

    const user = await findUserByEmail(normalizedEmail);
    const passwordMatches = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
        throw createHttpError(401, 'Invalid email or password.');
    }

    return {
        token: createTokenForUser(user),
        user: toPublicUser(user),
    };
}

async function register({ name, email, password }) {
    const trimmedName = String(name || '').trim();
    const normalizedEmail = normalizeEmail(email);

    if (trimmedName.length < 2) {
        throw createHttpError(400, 'Name must be at least 2 characters.');
    }

    assertEmail(normalizedEmail);
    assertStrongPassword(password);

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
        throw createHttpError(409, 'An account with this email already exists.');
    }

    const id = makeUserId();
    const username = makeUsername(trimmedName, normalizedEmail);
    const passwordHash = await hashPassword(password);

    const result = await query(
        `
    INSERT INTO users (
      id,
      name,
      username,
      email,
      password_hash,
      avatar_url,
      bio,
      location,
      rating,
      reviews_count,
      online,
      member_since
    ) VALUES (
      $1, $2, $3, $4, $5, NULL, '', '', 0, 0, true, CURRENT_DATE
    )
    RETURNING *
    `,
        [
            id,
            trimmedName,
            username,
            normalizedEmail,
            passwordHash,
        ],
    );

    const user = toUser(result.rows[0]);

    return {
        token: createTokenForUser(user),
        user: toPublicUser(user),
    };
}

async function findUserById(userId) {
    const result = await query(
        'SELECT * FROM users WHERE id = $1', [userId],
    );

    const user = toUser(result.rows[0]);
    return user ? toPublicUser(user) : null;
}

async function listUsers() {
    const result = await query(
        'SELECT * FROM users ORDER BY name ASC',
    );

    return result.rows.map((row) => toPublicUser(toUser(row)));
}

async function forgotPassword(email) {
    const normalizedEmail = normalizeEmail(email);
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await query(
        `
    UPDATE users
    SET reset_token = $1,
        reset_token_expires_at = $2,
        updated_at = NOW()
    WHERE email = $3
    `,
        [resetToken, resetTokenExpiresAt, normalizedEmail],
    );

    return { ok: true };
}



async function updateUserProfile(userId, patch) {
    const fields = [];
    const values = [];
    let index = 1;

    const columnByField = {
        name: 'name',
        bio: 'bio',
        location: 'location',
        avatarUrl: 'avatar_url',
    };

    Object.entries(patch).forEach(([field, value]) => {
        const column = columnByField[field];
        if (!column) return;

        fields.push(`${column} = $${index}`);
        values.push(value);
        index += 1;
    });

    if (!fields.length) {
        return findUserById(userId);
    }

    values.push(userId);

    const result = await query(
        `
    UPDATE users
    SET ${fields.join(', ')},
      updated_at = NOW()
    WHERE id = $${index}
    RETURNING *
    `,
        values,
    );

    const user = toUser(result.rows[0]);
    return user ? toPublicUser(user) : null;
}



module.exports = {
    login,
    register,
    findUserById,
    listUsers,
    forgotPassword,
    updateUserProfile,
};