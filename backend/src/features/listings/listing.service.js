const listingModel = require('./listing.model');
const authService = require('../auth/auth.service');
const { createHttpError } = require('../../utils/response.utils');

const CONDITIONS = new Set(['new', 'like_new', 'good', 'fair', 'for_parts']);
const TYPES = new Set(['fixed', 'auction']);
const STATUSES = new Set(['active', 'sold', 'inactive']);
const SORTS = new Set(['recent', 'price_asc', 'price_desc', 'popular']);

async function attachSeller(listing) {
    return { ...listing, seller: await authService.findUserById(listing.sellerId) };
}

async function attachSellers(listings) {
    return Promise.all(listings.map(attachSeller));
}

function positiveNumber(value, field) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) {
        throw createHttpError(400, `${field} must be a positive number.`);
    }
    return number;
}

function validateText(value, field, min, max) {
    const text = String(value || '').trim();
    if (text.length < min || text.length > max) {
        throw createHttpError(400, `${field} must be between ${min} and ${max} characters.`);
    }
    return text;
}

function validateImages(value) {
    if (!Array.isArray(value) || value.length < 1 || value.length > 6) {
        throw createHttpError(400, 'Images must contain between 1 and 6 image URLs.');
    }
    const images = value.map((image) => String(image || '').trim());
    if (images.some((image) => !image || image.length > 2000)) {
        throw createHttpError(400, 'Each image must have a valid URL.');
    }
    return images;
}

async function validatePayload(payload, existing = null) {
    const source = { ...(existing || {}), ...(payload || {}) };
    const title = validateText(source.title, 'Title', 1, 80);
    const description = validateText(source.description, 'Description', 20, 5000);
    const location = validateText(source.location, 'Location', 1, 80);
    const category = String(source.category || '').trim();
    const condition = String(source.condition || '').trim();
    const type = String(source.type || '').trim();

    if (!await listingModel.categoryExists(category)) throw createHttpError(400, 'Category is invalid.');
    if (!CONDITIONS.has(condition)) throw createHttpError(400, 'Condition is invalid.');
    if (!TYPES.has(type)) throw createHttpError(400, 'Listing type is invalid.');

    const result = {
        title,
        description,
        category,
        condition,
        location,
        type,
        images: validateImages(source.images),
    };

    if (type === 'auction') {
        result.startingBid = positiveNumber(source.startingBid, 'Starting bid');
        const endsAt = new Date(source.endsAt);
        if (Number.isNaN(endsAt.getTime()) || endsAt <= new Date()) {
            throw createHttpError(400, 'Auction end date must be in the future.');
        }
        result.endsAt = endsAt.toISOString();
        result.currentBid = existing?.type === 'auction'
            ? Number(existing.currentBid ?? result.startingBid)
            : result.startingBid;
        result.bidsCount = Number(existing?.bidsCount || 0);
        result.price = result.startingBid;
    } else {
        result.price = positiveNumber(source.price, 'Price');
    }

    if (source.status != null) {
        const status = String(source.status);
        if (!STATUSES.has(status)) throw createHttpError(400, 'Listing status is invalid.');
        result.status = status;
    }

    return result;
}

function parsePositiveInteger(value, fallback, maximum) {
    if (value == null || value === '') return fallback;
    const number = Number(value);
    if (!Number.isInteger(number) || number < 1 || number > maximum) {
        throw createHttpError(400, `Value must be an integer between 1 and ${maximum}.`);
    }
    return number;
}

async function listListings(query = {}) {
    const page = parsePositiveInteger(query.page, 1, 1000000);
    const limit = parsePositiveInteger(query.limit, 12, 100);
    const sort = String(query.sort || 'recent');
    if (!SORTS.has(sort)) throw createHttpError(400, 'Sort option is invalid.');

    let items = listingModel.listAll().filter((listing) => listing.status === 'active');
    if (query.category) items = items.filter((item) => item.category === query.category);
    if (query.location) items = items.filter((item) => item.location.toLowerCase() === String(query.location).trim().toLowerCase());
    if (query.condition) items = items.filter((item) => item.condition === query.condition);
    if (query.type) items = items.filter((item) => item.type === query.type);

    if (query.minPrice != null && query.minPrice !== '') {
        const minimum = Number(query.minPrice);
        if (!Number.isFinite(minimum) || minimum < 0) throw createHttpError(400, 'Minimum price is invalid.');
        items = items.filter((item) => (item.currentBid ?? item.price) >= minimum);
    }
    if (query.maxPrice != null && query.maxPrice !== '') {
        const maximum = Number(query.maxPrice);
        if (!Number.isFinite(maximum) || maximum < 0) throw createHttpError(400, 'Maximum price is invalid.');
        items = items.filter((item) => (item.currentBid ?? item.price) <= maximum);
    }
    if (query.q) {
        const needle = String(query.q).trim().toLowerCase();
        items = items.filter((item) => item.title.toLowerCase().includes(needle) || item.description.toLowerCase().includes(needle));
    }

    items.sort((a, b) => {
        const firstPrice = a.currentBid ?? a.price;
        const secondPrice = b.currentBid ?? b.price;
        if (sort === 'price_asc') return firstPrice - secondPrice;
        if (sort === 'price_desc') return secondPrice - firstPrice;
        if (sort === 'popular') return b.favoritesCount - a.favoritesCount;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = items.length;
    const paged = items.slice((page - 1) * limit, page * limit);
    return {
        items: await attachSellers(paged),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}

async function getListing(id) {
    const listing = listingModel.incrementViews(String(id));
    if (!listing) throw createHttpError(404, 'Listing not found.');
    return attachSeller(listing);
}

async function getFeatured() {
    const items = listingModel.listAll().filter((item) => item.status === 'active')
        .sort((a, b) => b.favoritesCount - a.favoritesCount).slice(0, 4);
    return attachSellers(items);
}

async function getRecent() {
    const items = listingModel.listAll().filter((item) => item.status === 'active')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
    return attachSellers(items);
}

async function createListing(userId, payload) {
    const data = validatePayload(payload);
    return attachSeller(listingModel.insert({
        ...data, sellerId: userId, status: 'active', currency: 'EUR', favoritesCount: 0, viewsCount: 0,
    }));
}

async function requireOwnedListing(userId, id) {
    const listing = listingModel.findById(String(id));
    if (!listing) throw createHttpError(404, 'Listing not found.');
    if (listing.sellerId !== userId) throw createHttpError(403, 'You can only modify your own listings.');
    return listing;
}

async function updateListing(userId, id, payload) {
    const existing = await requireOwnedListing(userId, id);
    const data = validatePayload(payload, existing);
    return attachSeller(listingModel.update(existing.id, data));
}

async function deleteListing(userId, id) {
    const existing = await requireOwnedListing(userId, id);
    listingModel.remove(existing.id);
    return { ok: true };
}

async function toggleFavorite(userId, id) {
    const result = listingModel.toggleFavorite(userId, String(id));
    if (!result) throw createHttpError(404, 'Listing not found.');
    return result;
}

async function getFavorites(userId) {
    return attachSellers(listingModel.listFavorites(userId));
}

async function getListingsBySeller(sellerId) {
    const items = listingModel.listAll().filter((item) => item.sellerId === sellerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return attachSellers(items);
}

module.exports = {
    listCategories: listingModel.listCategories,
    listListings,
    getListing,
    getFeatured,
    getRecent,
    createListing,
    updateListing,
    deleteListing,
    toggleFavorite,
    getFavorites,
    getListingsBySeller,
};
