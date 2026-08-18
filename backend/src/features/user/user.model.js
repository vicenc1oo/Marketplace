const { query } = require('../../config/db');
const listingService = require('../listings/listing.service');

async function findListingsBySeller(sellerId) {
    return listingService.getListingsBySeller(sellerId);
}

function toAuthor(row) {
    const memberSince = row.author_member_since instanceof Date
        ? row.author_member_since.toISOString().slice(0, 10)
        : row.author_member_since;

    return {
        id: row.author_id,
        name: row.author_name,
        username: row.author_username,
        email: row.author_email,
        avatarUrl: row.author_avatar_url,
        bio: row.author_bio,
        location: row.author_location,
        rating: Number(row.author_rating),
        reviewsCount: row.author_reviews_count,
        online: row.author_online,
        memberSince,
    };
}

async function findReviewsForUser(userId) {
    const result = await query(
        `SELECT
             r.id, r.author_id, r.listing_id, r.rating, r.text, r.created_at,
             u.name AS author_name,
             u.username AS author_username,
             u.email AS author_email,
             u.avatar_url AS author_avatar_url,
             u.bio AS author_bio,
             u.location AS author_location,
             u.rating AS author_rating,
             u.reviews_count AS author_reviews_count,
             u.online AS author_online,
             u.member_since AS author_member_since
         FROM reviews r
                  JOIN users u ON u.id = r.author_id
         WHERE r.reviewed_user_id = $1
         ORDER BY r.created_at DESC`,
        [userId],
    );

    return result.rows.map((row) => ({
        id: row.id,
        authorId: row.author_id,
        author: toAuthor(row),
        listingId: row.listing_id,
        rating: row.rating,
        text: row.text,
        createdAt: row.created_at,
    }));
}

module.exports = {
    findListingsBySeller,
    findReviewsForUser,
};
