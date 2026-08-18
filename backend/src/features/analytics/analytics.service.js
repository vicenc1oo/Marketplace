const { query } = require('../../config/db');

async function getDashboardStats(userId) {
    const result = await query(
        `SELECT
       (SELECT COUNT(*)::int
        FROM listings
        WHERE seller_id = $1 AND status = 'active') AS active_listings,
       (SELECT COUNT(*)::int
        FROM listings
        WHERE seller_id = $1 AND status = 'sold') AS sold_items,
       (SELECT COUNT(DISTINCT b.listing_id)::int
        FROM bids b
        JOIN listings l ON l.id = b.listing_id
        WHERE b.bidder_id = $1
          AND l.status = 'active'
          AND (l.ends_at IS NULL OR l.ends_at > NOW())) AS active_bids,
       (SELECT COUNT(*)::int
        FROM messages m
        JOIN conversation_participants cp
          ON cp.conversation_id = m.conversation_id
        WHERE cp.user_id = $1
          AND m.sender_id <> $1
          AND m.read = false) AS unread_messages,
       (SELECT COUNT(*)::int
        FROM listing_favorites
        WHERE user_id = $1) AS saved_listings,
       (SELECT COALESCE(SUM(views_count), 0)::int
        FROM listings
        WHERE seller_id = $1) AS total_views`,
        [userId],
    );
    const row = result.rows[0];
    return {
        activeListings: row.active_listings,
        soldItems: row.sold_items,
        activeBids: row.active_bids,
        unreadMessages: row.unread_messages,
        savedListings: row.saved_listings,
        totalViews: row.total_views,
    };
}

module.exports = { getDashboardStats };
