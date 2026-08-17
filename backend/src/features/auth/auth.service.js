const crypto = require('crypto');
const { createHttpError } = require('../../utils/response.utils');
const { hashPassword, verifyPassword } = require('../../utils/hash.utils');
const { signToken } = require('../../utils/jwt.utils');

const usersById = new Map();
const usersByEmail = new Map();

let seedPromise = null;

 /* Production users */
const DEFAULT_PASSWORD = 'Password1';
const seedUsers = [
    {
        id: 'u1',
        name: 'You',
        username: 'you',
        email: 'you@example.com',
        avatarUrl: null,
        bio: 'Clearing out the apartment. Quick replies, easy pickup near the centre.',
        location: 'Lisbon',
        rating: 4.8,
        reviewsCount: 23,
        online: true,
        memberSince: '2024-02-10',
    },
    {
        id: 'u2',
        name: 'Marta Silva',
        username: 'marta',
        email: 'marta@example.com',
        avatarUrl: null,
        bio: 'Selling things I no longer use. All items from a smoke-free home.',
        location: 'Porto',
        rating: 4.9,
        reviewsCount: 51,
        online: false,
        memberSince: '2023-06-01',
    },
];

function clone(value) {
    return structuredClone(value);
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

function saveUser(user) {
    usersById.set(user.id, user);
    usersByEmail.set(normalizeEmail(user.email), user);
    return user;
}

async function ensureSeedUsers() {
    if (!seedPromise) {
        seedPromise = Promise.all(
            seedUsers.map(async (seedUser) => {
                const passwordHash = await hashPassword(DEFAULT_PASSWORD);
                saveUser({ ...seedUser, email: normalizeEmail(seedUser.email), passwordHash });
            }),
        );
    }

    await seedPromise;
}

async function login({ email, password }) {
    await ensureSeedUsers();

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
        throw createHttpError(400, 'Email and password are required.');
    }

    const user = usersByEmail.get(normalizedEmail);
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
    await ensureSeedUsers();

    const trimmedName = String(name || '').trim();
    const normalizedEmail = normalizeEmail(email);

    if (trimmedName.length < 2) {
        throw createHttpError(400, 'Name must be at least 2 characters.');
    }

    assertEmail(normalizedEmail);
    assertStrongPassword(password);

    if (usersByEmail.has(normalizedEmail)) {
        throw createHttpError(409, 'An account with this email already exists.');
    }

    const now = new Date();
    const user = saveUser({
        id: makeUserId(),
        name: trimmedName,
        username: makeUsername(trimmedName, normalizedEmail),
        email: normalizedEmail,
        avatarUrl: null,
        bio: '',
        location: '',
        rating: 0,
        reviewsCount: 0,
        online: true,
        memberSince: now.toISOString().slice(0, 10),
        passwordHash: await hashPassword(password),
    });

    return {
        token: createTokenForUser(user),
        user: toPublicUser(user),
    };
}

async function findUserById(userId) {
    await ensureSeedUsers();

    const user = usersById.get(userId);
    return user ? toPublicUser(user) : null;
}

async function forgotPassword(email) {
    await ensureSeedUsers();

    const normalizedEmail = normalizeEmail(email);
    const user = usersByEmail.get(normalizedEmail);

    if (user) {
        user.resetToken = crypto.randomBytes(32).toString('hex');
        user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    }

    return { ok: true };
}

module.exports = {
    DEFAULT_PASSWORD,
    login,
    register,
    findUserById,
    forgotPassword,
};
