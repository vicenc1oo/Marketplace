const MS_PER_DAY = 24 * 60 * 60 * 1000;
const listingService = require('../listings/listing.service');

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function daysAgo(days) {
    return new Date(Date.now() - days * MS_PER_DAY).toISOString();
}

async function findListingsBySeller(sellerId) {
    return listingService.getListingsBySeller(sellerId);
}

function buildReviewsForUser(userId, users) {
    return users
        .filter((user) => user.id !== userId)
        .slice(0, 2)
        .map((author, index) => ({
            id: `r_${userId}_${index + 1}`,
            authorId: author.id,
            author: clone(author),
            rating: 5 - index,
            text: index === 0
                ? 'Smooth transaction, item exactly as described.'
                : 'Friendly and quick to reply. Would buy again.',
            createdAt: daysAgo((index + 1) * 7),
        }));
}

module.exports = {
    findListingsBySeller,
    buildReviewsForUser,
};
