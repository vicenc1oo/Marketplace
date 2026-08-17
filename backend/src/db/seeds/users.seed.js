const { query, pool } = require('../../config/db');
const { hashPassword } = require('../../utils/hash.utils');

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
    {
        id: 'u3',
        name: 'Tomas Reis',
        username: 'tomas',
        email: 'tomas@example.com',
        avatarUrl: null,
        bio: 'Cyclist and tinkerer. Happy to answer questions before you buy.',
        location: 'Lisbon',
        rating: 4.6,
        reviewsCount: 12,
        online: true,
        memberSince: '2024-09-18',
    },
];

async function seedUsersTable() {
    for (const user of seedUsers) {
        const passwordHash = await hashPassword(DEFAULT_PASSWORD);

        await query(
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
				$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
			)
			ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name,
				username = EXCLUDED.username,
				email = EXCLUDED.email,
				password_hash = EXCLUDED.password_hash,
				avatar_url = EXCLUDED.avatar_url,
				bio = EXCLUDED.bio,
				location = EXCLUDED.location,
				rating = EXCLUDED.rating,
				reviews_count = EXCLUDED.reviews_count,
				online = EXCLUDED.online,
				member_since = EXCLUDED.member_since,
				updated_at = NOW()
			`,
            [
                user.id,
                user.name,
                user.username,
                user.email,
                passwordHash,
                user.avatarUrl,
                user.bio,
                user.location,
                user.rating,
                user.reviewsCount,
                user.online,
                user.memberSince,
            ],
        );
        console.log(`Seeded user ${user.email}`);
    }
}

seedUsersTable()
    .then(() => {
        console.log('Users seed completed.');
    })
    .catch((error) => {
        console.error('Users seed failed:', error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());