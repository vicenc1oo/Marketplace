const crypto = require('crypto');
const { pool, query } = require('../../config/db');
const listingModel = require('../listings/listing.model');
const authService = require('../auth/auth.service');
const notificationService = require('../notifications/notification.service');
const { createHttpError } = require('../../utils/response.utils');

const MINIMUM_INCREMENT = 1;
const MAXIMUM_BID = 9999999999.99;

function makeBidId() {
    return typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `bid_${crypto.randomBytes(12).toString('hex')}`;
}

function toBid(row) {
    return {
        id: row.id,
        listingId: row.listing_id,
        bidderId: row.bidder_id,
        amount: Number(row.amount),
        createdAt: row.created_at,
        bidder: {
            id: row.bidder_id,
            name: row.bidder_name,
            username: row.bidder_username,
            avatarUrl: row.bidder_avatar_url,
            rating: Number(row.bidder_rating),
            reviewsCount: row.bidder_reviews_count,
        },
    };
}

async function findBidWithBidder(bidId) {
    const result = await query(
        `SELECT
       b.id, b.listing_id, b.bidder_id, b.amount, b.created_at,
       u.name AS bidder_name, u.username AS bidder_username,
       u.avatar_url AS bidder_avatar_url, u.rating AS bidder_rating,
       u.reviews_count AS bidder_reviews_count
     FROM bids b
     JOIN users u ON u.id = b.bidder_id
     WHERE b.id = $1`,
        [bidId],
    );
    return result.rows[0] ? toBid(result.rows[0]) : null;
}

async function assertAuctionExists(listingId) {
    const result = await query('SELECT type FROM listings WHERE id = $1', [listingId]);
    if (!result.rowCount) throw createHttpError(404, 'Listing not found.');
    if (result.rows[0].type !== 'auction') throw createHttpError(400, 'Listing is not an auction.');
}

async function getActiveAuctions() {
    const result = await query(
        `SELECT id
     FROM listings
     WHERE type = 'auction' AND status = 'active' AND ends_at > NOW()
     ORDER BY ends_at ASC`,
    );

    return Promise.all(result.rows.map(async ({ id }) => {
        const listing = await listingModel.findById(id);
        return { ...listing, seller: await authService.findUserById(listing.sellerId) };
    }));
}

async function getBids(listingId) {
    await assertAuctionExists(listingId);
    const result = await query(
        `SELECT
       b.id, b.listing_id, b.bidder_id, b.amount, b.created_at,
       u.name AS bidder_name, u.username AS bidder_username,
       u.avatar_url AS bidder_avatar_url, u.rating AS bidder_rating,
       u.reviews_count AS bidder_reviews_count
     FROM bids b
     JOIN users u ON u.id = b.bidder_id
     WHERE b.listing_id = $1
     ORDER BY b.amount DESC, b.created_at ASC`,
        [listingId],
    );
    return result.rows.map(toBid);
}

function normalizeBidAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAXIMUM_BID) {
        throw createHttpError(400, 'Bid amount is invalid.');
    }
    if (Number(amount.toFixed(2)) !== amount) {
        throw createHttpError(400, 'Bid amount can have at most two decimal places.');
    }
    return amount;
}

async function sendBidNotifications({ listing, bidderId, previousBidderId, amount }) {
    // A notification failure must not undo a bid already committed to the database.
    await notificationService.createAuctionNotifications(listing.id, {
        excludeUserId: bidderId,
        type: 'bid',
        text: `New bid of €${amount.toFixed(2)} on “${listing.title}”.`,
        textByUserId: previousBidderId && previousBidderId !== bidderId
            ? { [previousBidderId]: `You were outbid on “${listing.title}”.` }
            : {},
    }).catch(() => {});
}

async function placeBid(userId, listingId, value) {
    const amount = normalizeBidAmount(value);
    const client = await pool.connect();
    let listing;
    let previousBidderId = null;
    let bidsCount;
    const bidId = makeBidId();

    try {
        await client.query('BEGIN');

        // Locking the listing serializes competing bids and prevents stale validation.
        const listingResult = await client.query(
            `SELECT id, seller_id, title, type, status, starting_bid, current_bid, ends_at
       FROM listings
       WHERE id = $1
       FOR UPDATE`,
            [listingId],
        );
        if (!listingResult.rowCount) throw createHttpError(404, 'Listing not found.');
        listing = listingResult.rows[0];

        if (listing.type !== 'auction') throw createHttpError(400, 'Listing is not an auction.');
        if (listing.status !== 'active') throw createHttpError(400, 'Auction is not active.');
        if (!listing.ends_at || new Date(listing.ends_at) <= new Date()) {
            throw createHttpError(400, 'Auction has ended.');
        }
        if (listing.seller_id === userId) {
            throw createHttpError(403, 'You cannot bid on your own auction.');
        }

        const currentAmount = Number(listing.current_bid ?? listing.starting_bid);
        const minimumAmount = currentAmount + MINIMUM_INCREMENT;
        if (amount < minimumAmount) {
            throw createHttpError(409, `Bid must be at least €${minimumAmount.toFixed(2)}.`);
        }

        const previousBidResult = await client.query(
            `SELECT bidder_id
       FROM bids
       WHERE listing_id = $1
       ORDER BY amount DESC, created_at ASC
       LIMIT 1`,
            [listingId],
        );
        previousBidderId = previousBidResult.rows[0]?.bidder_id || null;

        await client.query(
            `INSERT INTO bids (id, listing_id, bidder_id, amount)
       VALUES ($1, $2, $3, $4)`,
            [bidId, listingId, userId, amount],
        );
        const updateResult = await client.query(
            `UPDATE listings
       SET current_bid = $2, bids_count = bids_count + 1, updated_at = NOW()
       WHERE id = $1
       RETURNING bids_count`,
            [listingId, amount],
        );
        bidsCount = updateResult.rows[0].bids_count;

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    const bid = await findBidWithBidder(bidId);
    await sendBidNotifications({ listing, bidderId: userId, previousBidderId, amount });
    return { ...bid, currentBid: amount, bidsCount };
}

async function getMyBids(userId) {
    const result = await query(
        `SELECT DISTINCT ON (listing_id) id, listing_id, bidder_id, amount, created_at
     FROM bids
     WHERE bidder_id = $1
     ORDER BY listing_id, amount DESC, created_at ASC`,
        [userId],
    );

    return Promise.all(result.rows.map(async (row) => {
        const listing = await listingModel.findById(row.listing_id);
        const seller = await authService.findUserById(listing.sellerId);
        const amount = Number(row.amount);
        return {
            id: row.id,
            listingId: row.listing_id,
            bidderId: row.bidder_id,
            amount,
            createdAt: row.created_at,
            listing: { ...listing, seller },
            winning: Number(listing.currentBid) === amount,
        };
    }));
}

module.exports = {
    MINIMUM_INCREMENT,
    getActiveAuctions,
    getBids,
    placeBid,
    getMyBids,
};
