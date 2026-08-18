const crypto = require('crypto');
const { pool, query } = require('../../config/db');
const { createHttpError } = require('../../utils/response.utils');

function makeTransactionId() {
    return typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `transaction_${crypto.randomBytes(12).toString('hex')}`;
}

function normalizeAmount(amount) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw createHttpError(400, 'Amount must be a positive number.');
    }
    return numericAmount;
}

function toTransaction(row) {
    return {
        id: row.id,
        type: row.type,
        amount: Number(row.amount),
        description: row.description,
        listingId: row.listing_id,
        promotionId: row.promotion_id,
        createdAt: row.created_at,
    };
}

async function ensureWallet(userId, client = { query }) {
    await client.query(
        `INSERT INTO wallets (user_id, balance)
     VALUES ($1, 0)
     ON CONFLICT (user_id) DO NOTHING`,
        [userId],
    );
}

async function getWallet(userId) {
    await ensureWallet(userId);
    const [walletResult, transactionsResult] = await Promise.all([
        query('SELECT balance FROM wallets WHERE user_id = $1', [userId]),
        query(
            `SELECT id, type, amount, description, listing_id, promotion_id, created_at
       FROM wallet_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
            [userId],
        ),
    ]);

    return {
        balance: Number(walletResult.rows[0].balance),
        transactions: transactionsResult.rows.map(toTransaction),
    };
}

async function changeBalance(userId, type, amount, description, references = {}) {
    const numericAmount = normalizeAmount(amount);
    const normalizedDescription = String(description || '').trim();
    if (!normalizedDescription) {
        throw createHttpError(400, 'Transaction description is required.');
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await ensureWallet(userId, client);
        const walletResult = await client.query(
            'SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE',
            [userId],
        );
        const currentBalance = Number(walletResult.rows[0].balance);
        if (type === 'debit' && currentBalance < numericAmount) {
            throw createHttpError(400, 'Not enough credits.');
        }

        const nextBalance = type === 'credit'
            ? currentBalance + numericAmount
            : currentBalance - numericAmount;
        await client.query(
            'UPDATE wallets SET balance = $2, updated_at = NOW() WHERE user_id = $1',
            [userId, nextBalance],
        );
        await client.query(
            `INSERT INTO wallet_transactions (
         id, user_id, type, amount, description, listing_id, promotion_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                makeTransactionId(), userId, type, numericAmount, normalizedDescription,
                references.listingId || null, references.promotionId || null,
            ],
        );
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    return getWallet(userId);
}

async function creditWallet(userId, amount, description = 'Credit added', references) {
    return changeBalance(userId, 'credit', amount, description, references);
}

async function debitWallet(userId, amount, description = 'Credit spent', references) {
    return changeBalance(userId, 'debit', amount, description, references);
}

module.exports = {
    getWallet,
    creditWallet,
    debitWallet,
};
