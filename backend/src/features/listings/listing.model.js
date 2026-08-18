const crypto = require('crypto');

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

function placeholderImage(id, title) {
    const label = String(title).slice(0, 45);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#e8ecef"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#52606d" font-family="sans-serif" font-size="30">${label}</text><text x="50%" y="57%" dominant-baseline="middle" text-anchor="middle" fill="#7b8794" font-family="sans-serif" font-size="18">${id}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const categories = [
    { id: 'electronics', name: 'Electronics', icon: 'device' },
    { id: 'home', name: 'Home & Garden', icon: 'home' },
    { id: 'fashion', name: 'Fashion', icon: 'tag' },
    { id: 'bikes', name: 'Bikes', icon: 'bike' },
    { id: 'books', name: 'Books & Media', icon: 'book' },
    { id: 'furniture', name: 'Furniture', icon: 'sofa' },
    { id: 'sports', name: 'Sports', icon: 'ball' },
    { id: 'kids', name: 'Kids', icon: 'toy' },
];

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
        images: extra.images || [placeholderImage(id, title)],
        type: extra.type || 'fixed',
        status: extra.status || 'active',
        favoritesCount: extra.favoritesCount ?? 0,
        viewsCount: extra.viewsCount ?? 0,
        createdAt: daysAgo(daysOld),
        updatedAt: daysAgo(daysOld),
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
    makeListing('l1', 'u2', 'Vintage road bike, 54cm frame', 220, 'bikes', 'good', 'Porto', 1, { favoritesCount: 14, viewsCount: 210 }),
    makeListing('l2', 'u3', 'iPhone 12, 128GB, unlocked', 320, 'electronics', 'like_new', 'Lisbon', 2, { favoritesCount: 31, viewsCount: 540 }),
    makeListing('l3', 'u2', 'Oak dining table + 4 chairs', 180, 'furniture', 'good', 'Porto', 4, { favoritesCount: 9, viewsCount: 130 }),
    makeListing('l4', 'u3', 'Mechanical keyboard, hot-swap', 65, 'electronics', 'like_new', 'Lisbon', 1, {
        type: 'auction', startingBid: 30, currentBid: 48, bidsCount: 6, endsAt: hoursFromNow(28), favoritesCount: 22, viewsCount: 305,
    }),
    makeListing('l5', 'u2', 'Wool winter coat, size M', 45, 'fashion', 'like_new', 'Porto', 3, { favoritesCount: 7, viewsCount: 88 }),
    makeListing('l6', 'u3', 'Camping tent, 2-person', 55, 'sports', 'good', 'Lisbon', 6, { favoritesCount: 5, viewsCount: 76 }),
    makeListing('l7', 'u2', 'Box of sci-fi paperbacks (20)', 25, 'books', 'good', 'Porto', 5, { favoritesCount: 3, viewsCount: 41 }),
    makeListing('l8', 'u3', 'Espresso machine, descaled', 90, 'home', 'good', 'Lisbon', 2, {
        type: 'auction', startingBid: 40, currentBid: 72, bidsCount: 9, endsAt: hoursFromNow(4), favoritesCount: 18, viewsCount: 260,
    }),
    makeListing('l9', 'u2', 'Kids wooden train set', 30, 'kids', 'good', 'Porto', 7, { favoritesCount: 4, viewsCount: 52 }),
    makeListing('l10', 'u3', 'Standing desk, electric', 240, 'furniture', 'like_new', 'Lisbon', 1, { favoritesCount: 27, viewsCount: 410 }),
    makeListing('l11', 'u1', '4K monitor, 27 inch', 150, 'electronics', 'good', 'Lisbon', 8, { favoritesCount: 11, viewsCount: 190 }),
    makeListing('l12', 'u1', 'Acoustic guitar + soft case', 110, 'home', 'good', 'Lisbon', 12, {
        type: 'auction', startingBid: 60, currentBid: 95, bidsCount: 4, endsAt: hoursFromNow(50), favoritesCount: 13, viewsCount: 175,
    }),
    makeListing('l13', 'u1', 'Bookshelf, white, 5 shelves', 40, 'furniture', 'good', 'Lisbon', 30, { status: 'sold', favoritesCount: 6, viewsCount: 120 }),
];

const favoriteIdsByUser = new Map();

function makeId() {
    return typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `l_${crypto.randomBytes(12).toString('hex')}`;
}

function listCategories() {
    return clone(categories);
}

function categoryExists(categoryId) {
    return categories.some((category) => category.id === categoryId);
}

function listAll() {
    return listings.map(clone);
}

function findById(id) {
    const listing = listings.find((item) => item.id === id);
    return listing ? clone(listing) : null;
}

function insert(data) {
    const now = new Date().toISOString();
    const listing = { id: makeId(), ...clone(data), createdAt: now, updatedAt: now };
    listings.unshift(listing);
    return clone(listing);
}

function update(id, patch) {
    const listing = listings.find((item) => item.id === id);
    if (!listing) return null;
    Object.assign(listing, clone(patch), { updatedAt: new Date().toISOString() });
    if (listing.type === 'fixed') {
        delete listing.endsAt;
        delete listing.startingBid;
        delete listing.currentBid;
        delete listing.bidsCount;
    }
    return clone(listing);
}

function remove(id) {
    const index = listings.findIndex((item) => item.id === id);
    if (index === -1) return false;
    listings.splice(index, 1);
    favoriteIdsByUser.forEach((ids) => ids.delete(id));
    return true;
}

function incrementViews(id) {
    const listing = listings.find((item) => item.id === id);
    if (!listing) return null;
    listing.viewsCount += 1;
    return clone(listing);
}

function getFavoriteIds(userId) {
    if (!favoriteIdsByUser.has(userId)) favoriteIdsByUser.set(userId, new Set());
    return favoriteIdsByUser.get(userId);
}

function toggleFavorite(userId, listingId) {
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) return null;
    const ids = getFavoriteIds(userId);
    const saved = !ids.has(listingId);
    if (saved) {
        ids.add(listingId);
        listing.favoritesCount += 1;
    } else {
        ids.delete(listingId);
        listing.favoritesCount = Math.max(0, listing.favoritesCount - 1);
    }
    return { saved, favoritesCount: listing.favoritesCount };
}

function listFavorites(userId) {
    const ids = getFavoriteIds(userId);
    return listings.filter((listing) => ids.has(listing.id)).map(clone);
}

module.exports = {
    listCategories,
    categoryExists,
    listAll,
    findById,
    insert,
    update,
    remove,
    incrementViews,
    toggleFavorite,
    listFavorites,
};
