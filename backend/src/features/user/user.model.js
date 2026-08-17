const MS_PER_DAY = 24 * 60 * 60 * 1000;

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function daysAgo(days) {
    return new Date(Date.now() - days * MS_PER_DAY).toISOString();
}

function hoursFromNow(hours) {
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}


// contains mock listings and generates mock reviews
function makeListing(id, sellerId, title, price, category, condition, location, daysOld, extra = {}) {
    return {
        id,
        title,
        description: extra.description
            || `${title}. Used but in ${condition.replace('_', ' ')} condition. Collection preferred, can post at buyer's cost.`,
        price,
        currency: 'EUR',
        category,
        condition,
        location,
        sellerId,
        images: extra.images || [],
        type: extra.type || 'fixed',
        status: extra.status || 'active',
        favoritesCount: extra.favoritesCount ?? 0,
        viewsCount: extra.viewsCount ?? 0,
        createdAt: daysAgo(daysOld),
        ...(extra.type === 'auction'
            ? {
                endsAt: extra.endsAt,
                startingBid: extra.startingBid,
                currentBid: extra.currentBid,
                bidsCount: extra.bidsCount ?? 0,
            }
            : {}),
    };
}

const listings = [
    makeListing('l1', 'u2', 'Vintage road bike, 54cm frame', 220, 'bikes', 'good', 'Porto', 1, {
        favoritesCount: 14,
        viewsCount: 210,
        description:
            'Steel-frame road bike, recently serviced with new brake pads and cables. Rides smoothly. Small scratches on the top tube.',
    }),
    makeListing('l3', 'u2', 'Oak dining table + 4 chairs', 180, 'furniture', 'good', 'Porto', 4, {
        favoritesCount: 9,
        viewsCount: 130,
    }),
    makeListing('l4', 'u1', 'Mechanical keyboard, hot-swap', 65, 'electronics', 'like_new', 'Lisbon', 1, {
        type: 'auction',
        startingBid: 30,
        currentBid: 48,
        bidsCount: 6,
        endsAt: hoursFromNow(28),
        favoritesCount: 22,
        viewsCount: 305,
    }),
    makeListing('l5', 'u2', 'Wool winter coat, size M', 45, 'fashion', 'like_new', 'Porto', 3, {
        favoritesCount: 7,
        viewsCount: 88,
    }),
    makeListing('l6', 'u1', 'Camping tent, 2-person', 55, 'sports', 'good', 'Lisbon', 6, {
        favoritesCount: 5,
        viewsCount: 76,
    }),
    makeListing('l11', 'u1', '4K monitor, 27 inch', 150, 'electronics', 'good', 'Lisbon', 8, {
        favoritesCount: 11,
        viewsCount: 190,
    }),
    makeListing('l12', 'u1', 'Acoustic guitar + soft case', 110, 'home', 'good', 'Lisbon', 12, {
        type: 'auction',
        startingBid: 60,
        currentBid: 95,
        bidsCount: 4,
        endsAt: hoursFromNow(50),
        favoritesCount: 13,
        viewsCount: 175,
    }),
    makeListing('l13', 'u2', 'Bookshelf, white, 5 shelves', 40, 'furniture', 'good', 'Lisbon', 30, {
        status: 'sold',
        favoritesCount: 6,
        viewsCount: 120,
    }),
];

async function attachSeller(listing, findUserById) {
    return {
        ...clone(listing),
        seller: await findUserById(listing.sellerId),
    };
}

async function findListingsBySeller(sellerId, findUserById) {
    const sellerListings = listings
        .filter((listing) => listing.sellerId === sellerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return Promise.all(sellerListings.map((listing) => attachSeller(listing, findUserById)));
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