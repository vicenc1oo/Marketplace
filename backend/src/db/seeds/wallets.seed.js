const { pool } = require('../../config/db');

const wallets = [
    {
        userId: 'u1',
        balance: 500,
    },
    {
        userId: 'u2',
        balance: 350,
    },
    {
        userId: 'u3',
        balance: 650,
    },
];

async function seedWallets() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const wallet of wallets) {
            await client.query(
                `INSERT INTO wallets (
					user_id,
					balance
				)
				VALUES ($1, $2)
				ON CONFLICT (user_id) DO UPDATE SET
					balance = EXCLUDED.balance,
					updated_at = NOW()`,
                [
                    wallet.userId,
                    wallet.balance,
                ],
            );

            await client.query(
                `INSERT INTO wallet_transactions (
					id,
					user_id,
					type,
					amount,
					description
				)
				VALUES ($1, $2, 'credit', $3, $4)
				ON CONFLICT (id) DO UPDATE SET
					user_id = EXCLUDED.user_id,
					type = EXCLUDED.type,
					amount = EXCLUDED.amount,
					description = EXCLUDED.description`,
                [
                    `seed_welcome_${wallet.userId}`,
                    wallet.userId,
                    wallet.balance,
                    'Demo account starting credits',
                ],
            );

            console.log(
                `Seeded wallet for ${wallet.userId}: ${wallet.balance} credits`,
            );
        }

        await client.query('COMMIT');
        console.log('Wallets seed completed.');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

seedWallets()
    .catch((error) => {
        console.error('Wallets seed failed:', error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());