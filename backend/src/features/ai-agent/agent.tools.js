const { query } = require('../../config/db');
const { createHttpError } = require('../../utils/response.utils');

const toolDefinitions = [
    {
        type: 'function',
        function: {
            name: 'get_my_account_data',
            description: 'Get one section of data belonging to the authenticated user.',
            parameters: {
                type: 'object',
                properties: {
                    section: {
                        type: 'string',
                        enum: [
                            'bids',
                            'listings',
                            'notifications',
                            'profile',
                            'promotions',
                            'wallet',
                        ],
                        description: 'The account data section required to answer the question.',
                    },
                },
                required: ['section'],
                additionalProperties: false,
            },
        },
    },
];

async function getMyProfile(userId) {
    const result = await query(
        `SELECT
             id,
             name,
             username,
             email,
             avatar_url,
             bio,
             location,
             rating,
             reviews_count,
             online,
             member_since
         FROM users
         WHERE id = $1`,
        [userId],
    );

    if (!result.rowCount) {
        throw createHttpError(404, 'User not found.');
    }

    const user = result.rows[0];

    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        location: user.location,
        rating: Number(user.rating),
        reviewsCount: user.reviews_count,
        online: user.online,
        memberSince: user.member_since,
    };
}

async function getMyWallet(userId) {
    const [walletResult, transactionsResult] = await Promise.all([
        query(
            `SELECT balance, updated_at
             FROM wallets
             WHERE user_id = $1`,
            [userId],
        ),
        query(
            `SELECT
                 id,
                 type,
                 amount,
                 description,
                 listing_id,
                 promotion_id,
                 created_at
             FROM wallet_transactions
             WHERE user_id = $1
             ORDER BY created_at DESC
                 LIMIT 10`,
            [userId],
        ),
    ]);

    const wallet = walletResult.rows[0];

    return {
        balance: wallet ? Number(wallet.balance) : 0,
        unit: 'credits',
        updatedAt: wallet?.updated_at || null,
        recentTransactions: transactionsResult.rows.map((transaction) => ({
            id: transaction.id,
            type: transaction.type,
            amount: Number(transaction.amount),
            description: transaction.description,
            listingId: transaction.listing_id,
            promotionId: transaction.promotion_id,
            createdAt: transaction.created_at,
        })),
    };
}

async function getMyListings(userId) {
    const [countResult, listingsResult] = await Promise.all([
        query(
            `SELECT COUNT(*) AS total
             FROM listings
             WHERE seller_id = $1`,
            [userId],
        ),
        query(
            `SELECT
                 l.id,
                 l.title,
                 l.price,
                 l.currency,
                 c.name AS category,
                 l.condition,
                 l.location,
                 l.type,
                 l.status,
                 l.favorites_count,
                 l.views_count,
                 l.starting_bid,
                 l.current_bid,
                 l.bids_count,
                 l.ends_at,
                 l.created_at,
                 l.updated_at
             FROM listings l
                      JOIN categories c ON c.id = l.category_id
             WHERE l.seller_id = $1
             ORDER BY l.updated_at DESC
                 LIMIT 10`,
            [userId],
        ),
    ]);

    return {
        total: Number(countResult.rows[0].total),
        recentListings: listingsResult.rows.map((listing) => ({
            id: listing.id,
            title: listing.title,
            price: Number(listing.price),
            currency: listing.currency,
            category: listing.category,
            condition: listing.condition,
            location: listing.location,
            type: listing.type,
            status: listing.status,
            favoritesCount: listing.favorites_count,
            viewsCount: listing.views_count,
            startingBid: listing.starting_bid == null
                ? null
                : Number(listing.starting_bid),
            currentBid: listing.current_bid == null
                ? null
                : Number(listing.current_bid),
            bidsCount: listing.bids_count,
            endsAt: listing.ends_at,
            createdAt: listing.created_at,
            updatedAt: listing.updated_at,
        })),
    };
}

async function getMyNotifications(userId) {
    const [countResult, notificationsResult] = await Promise.all([
        query(
            `SELECT
                 COUNT(*) AS total,
                 COUNT(*) FILTER (WHERE read = false) AS unread
             FROM notifications
             WHERE user_id = $1`,
            [userId],
        ),
        query(
            `SELECT id, type, text, read, link, created_at
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
                 LIMIT 10`,
            [userId],
        ),
    ]);

    return {
        total: Number(countResult.rows[0].total),
        unread: Number(countResult.rows[0].unread),
        recentNotifications: notificationsResult.rows.map((notification) => ({
            id: notification.id,
            type: notification.type,
            text: notification.text,
            read: notification.read,
            link: notification.link,
            createdAt: notification.created_at,
        })),
    };
}

async function getMyBids(userId) {
    const [
        placedCountResult,
        placedBidsResult,
        receivedCountResult,
        receivedBidsResult,
    ] = await Promise.all([
        query(
            `SELECT COUNT(*) AS total
             FROM bids
             WHERE bidder_id = $1`,
            [userId],
        ),
        query(
            `SELECT
                 b.id,
                 b.amount,
                 b.created_at,
                 l.id AS listing_id,
                 l.title AS listing_title,
                 l.currency,
                 l.current_bid,
                 l.status AS listing_status,
                 l.ends_at
             FROM bids b
                      JOIN listings l ON l.id = b.listing_id
             WHERE b.bidder_id = $1
             ORDER BY b.created_at DESC
                 LIMIT 10`,
            [userId],
        ),
        query(
            `SELECT COUNT(*) AS total
             FROM bids b
                      JOIN listings l ON l.id = b.listing_id
             WHERE l.seller_id = $1`,
            [userId],
        ),
        query(
            `SELECT
                 b.id,
                 b.amount,
                 b.created_at,
                 l.id AS listing_id,
                 l.title AS listing_title,
                 l.currency,
                 u.id AS bidder_id,
                 u.username AS bidder_username
             FROM bids b
                      JOIN listings l ON l.id = b.listing_id
                      JOIN users u ON u.id = b.bidder_id
             WHERE l.seller_id = $1
             ORDER BY b.created_at DESC
                 LIMIT 10`,
            [userId],
        ),
    ]);

    return {
        placedTotal: Number(placedCountResult.rows[0].total),
        recentPlacedBids: placedBidsResult.rows.map((bid) => ({
            id: bid.id,
            amount: Number(bid.amount),
            listingId: bid.listing_id,
            listingTitle: bid.listing_title,
            currency: bid.currency,
            currentBid: bid.current_bid == null
                ? null
                : Number(bid.current_bid),
            listingStatus: bid.listing_status,
            endsAt: bid.ends_at,
            createdAt: bid.created_at,
        })),
        receivedTotal: Number(receivedCountResult.rows[0].total),
        recentReceivedBids: receivedBidsResult.rows.map((bid) => ({
            id: bid.id,
            amount: Number(bid.amount),
            listingId: bid.listing_id,
            listingTitle: bid.listing_title,
            currency: bid.currency,
            bidderId: bid.bidder_id,
            bidderUsername: bid.bidder_username,
            createdAt: bid.created_at,
        })),
    };
}

async function getMyPromotions(userId) {
    const [countResult, promotionsResult] = await Promise.all([
        query(
            `SELECT
                 COUNT(*) AS total,
                 COUNT(*) FILTER (WHERE ends_at > NOW()) AS active
             FROM listing_promotions
             WHERE user_id = $1`,
            [userId],
        ),
        query(
            `SELECT
                 lp.id,
                 lp.listing_id,
                 l.title AS listing_title,
                 lp.package_id,
                 pp.name AS package_name,
                 pp.credits AS package_cost,
                 pp.duration_days,
                 lp.starts_at,
                 lp.ends_at,
                 lp.created_at,
                 (lp.ends_at > NOW()) AS active
             FROM listing_promotions lp
                      JOIN listings l ON l.id = lp.listing_id
                      JOIN promotion_packages pp ON pp.id = lp.package_id
             WHERE lp.user_id = $1
             ORDER BY lp.created_at DESC
                 LIMIT 10`,
            [userId],
        ),
    ]);

    return {
        total: Number(countResult.rows[0].total),
        active: Number(countResult.rows[0].active),
        recentPromotions: promotionsResult.rows.map((promotion) => ({
            id: promotion.id,
            listingId: promotion.listing_id,
            listingTitle: promotion.listing_title,
            packageId: promotion.package_id,
            packageName: promotion.package_name,
            packageCost: promotion.package_cost,
            packageCostUnit: 'credits',
            durationDays: promotion.duration_days,
            startsAt: promotion.starts_at,
            endsAt: promotion.ends_at,
            active: promotion.active,
            createdAt: promotion.created_at,
        })),
    };
}

const sectionHandlers = {
    bids: getMyBids,
    listings: getMyListings,
    notifications: getMyNotifications,
    profile: getMyProfile,
    promotions: getMyPromotions,
    wallet: getMyWallet,
};

async function executeToolCall(userId, toolCall) {
    if (toolCall.function.name !== 'get_my_account_data') {
        throw createHttpError(400, 'Requested AI tool is not available.');
    }

    let args;

    try {
        args = JSON.parse(toolCall.function.arguments || '{}');
    } catch (error) {
        throw createHttpError(400, 'AI tool arguments are invalid.');
    }

    const handler = sectionHandlers[args.section];

    if (!handler) {
        throw createHttpError(400, 'Requested account data section is not available.');
    }

    return handler(userId);
}

module.exports = {
    executeToolCall,
    toolDefinitions,
};