const crypto = require('crypto');
const { pool, query } = require('../../config/db');
const { createHttpError } = require('../../utils/response.utils');

function makeId(prefix) {
    return typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function toPackage(row) {
    return {
        id: row.id,
        name: row.name,
        credits: row.credits,
        durationDays: row.duration_days,
        description: row.description,
    };
}

function toPromotion(row) {
    return {
        id: row.id,
        listingId: row.listing_id,
        packageId: row.package_id,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
    };
}

async function listPackages() {
    const result = await query(
        `SELECT id, name, credits, duration_days, description
     FROM promotion_packages
     ORDER BY credits ASC`,
    );
    return result.rows.map(toPackage);
}

async function promoteListing(userId, payload = {}) {
    const listingId = String(payload.listingId || '').trim();
    const packageId = String(payload.packageId || '').trim();

    if (!listingId || !packageId) {
        throw createHttpError(400, 'Listing id and package id are required.');
    }

    const client = await pool.connect();
    try {
        // All writes share one transaction so a failed promotion never spends credits.
        await client.query('BEGIN');

        const packageResult = await client.query(
            `SELECT id, name, credits, duration_days, description
       FROM promotion_packages
       WHERE id = $1`,
            [packageId],
        );
        if (!packageResult.rowCount) {
            throw createHttpError(404, 'Promotion package not found.');
        }
        const promotionPackage = packageResult.rows[0];

        const listingResult = await client.query(
            `SELECT id, seller_id, status
       FROM listings
       WHERE id = $1
       FOR UPDATE`,
            [listingId],
        );
        if (!listingResult.rowCount) {
            throw createHttpError(404, 'Listing not found.');
        }

        const listing = listingResult.rows[0];
        if (listing.seller_id !== userId) {
            throw createHttpError(403, 'You can only promote your own listings.');
        }
        if (listing.status !== 'active') {
            throw createHttpError(400, 'Only active listings can be promoted.');
        }

        await client.query(
            `INSERT INTO wallets (user_id, balance)
       VALUES ($1, 0)
       ON CONFLICT (user_id) DO NOTHING`,
            [userId],
        );
        const walletResult = await client.query(
            'SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE',
            [userId],
        );
        const currentBalance = Number(walletResult.rows[0].balance);
        if (currentBalance < promotionPackage.credits) {
            throw createHttpError(400, 'Not enough credits.');
        }

        const promotionId = makeId('promotion');
        const promotionResult = await client.query(
            `INSERT INTO listing_promotions (
         id, listing_id, user_id, package_id, starts_at, ends_at
       ) VALUES (
         $1, $2, $3, $4, NOW(), NOW() + make_interval(days => $5)
       )
       RETURNING id, listing_id, package_id, starts_at, ends_at`,
            [promotionId, listingId, userId, packageId, promotionPackage.duration_days],
        );

        const nextBalance = currentBalance - promotionPackage.credits;
        await client.query(
            'UPDATE wallets SET balance = $2, updated_at = NOW() WHERE user_id = $1',
            [userId, nextBalance],
        );
        await client.query(
            `INSERT INTO wallet_transactions (
         id, user_id, type, amount, description, listing_id, promotion_id
       ) VALUES ($1, $2, 'debit', $3, $4, $5, $6)`,
            [
                makeId('transaction'),
                userId,
                promotionPackage.credits,
                `Promotion: ${promotionPackage.name}`,
                listingId,
                promotionId,
            ],
        );

        await client.query('COMMIT');
        return {
            ok: true,
            balance: nextBalance,
            promotion: toPromotion(promotionResult.rows[0]),
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    listPackages,
    promoteListing,
};
