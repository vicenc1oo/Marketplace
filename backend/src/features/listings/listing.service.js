const listingModel = require('./listing.model');
const authService = require('../auth/auth.service');
const notificationService = require('../notifications/notification.service');
const { createHttpError } = require('../../utils/response.utils');

const CATEGORIES = new Set([
    'Electronics',
    'Home & Garden',
    'Fashion',
    'Bikes',
    'Books & Media',
    'Furniture',
    'Sports',
    'Kids',
]);
const CONDITIONS = new Set(['new', 'like_new', 'good', 'fair', 'for_parts']);
const TYPES = new Set(['fixed', 'auction']);
const STATUSES = new Set(['active', 'sold', 'inactive']);
const SORTS = new Set(['recent', 'price_asc', 'price_desc', 'popular']);

async function attachSeller(listing) {
    return { ...listing, seller: await authService.findUserById(listing.sellerId) };
}

function auctionDetailsChanged(before, after) {
    const fields = [
        'title', 'description', 'category', 'condition', 'location',
        'type', 'status', 'startingBid', 'endsAt',
    ];
    return fields.some((field) => String(before[field] ?? '') !== String(after[field] ?? ''))
        || JSON.stringify(before.images || []) !== JSON.stringify(after.images || []);
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

    // Validação da categoria - verifica se existe no banco
    const categoryExists = await listingModel.categoryExists(category);
    if (!categoryExists) {
        throw createHttpError(400, 'Categoria inválida. Por favor, selecione uma categoria válida.');
    }

    // Validação da condição
    if (!CONDITIONS.has(condition)) {
        throw createHttpError(400, 'Condição inválida. Por favor, selecione uma condição válida.');
    }

    // Validação do tipo
    if (!TYPES.has(type)) {
        throw createHttpError(400, 'Tipo de anúncio inválido.');
    }

    const result = {
        title,
        description,
        category, // Mantém o valor original, o model vai resolver para o ID correto
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

    const filters = {
        category: query.category ? String(query.category).trim() : null,
        location: query.location ? String(query.location).trim() : null,
        condition: query.condition ? String(query.condition).trim() : null,
        type: query.type ? String(query.type).trim() : null,
        q: query.q ? String(query.q).trim() : null,
    };

    if (query.minPrice != null && query.minPrice !== '') {
        const minimum = Number(query.minPrice);
        if (!Number.isFinite(minimum) || minimum < 0) throw createHttpError(400, 'Minimum price is invalid.');
        filters.minPrice = minimum;
    }
    if (query.maxPrice != null && query.maxPrice !== '') {
        const maximum = Number(query.maxPrice);
        if (!Number.isFinite(maximum) || maximum < 0) throw createHttpError(400, 'Maximum price is invalid.');
        filters.maxPrice = maximum;
    }

    const { items, total } = await listingModel.list({ filters, page, limit, sort });
    return {
        items: await attachSellers(items),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}

async function getListing(id) {
    const listing = await listingModel.incrementViews(String(id));
    if (!listing) throw createHttpError(404, 'Listing not found.');
    return attachSeller(listing);
}

async function getFeatured() {
    const items = await listingModel.listBy({
        status: 'active', limit: 4, orderBy: 'l.favorites_count DESC',
    });
    return attachSellers(items);
}

async function getRecent() {
    const items = await listingModel.listBy({ status: 'active', limit: 8 });
    return attachSellers(items);
}

async function createListing(userId, payload) {
    const data = await validatePayload(payload);
    return attachSeller(await listingModel.insert({
        ...data, sellerId: userId, status: 'active', currency: 'EUR', favoritesCount: 0, viewsCount: 0,
    }));
}

async function requireOwnedListing(userId, id) {
    const listing = await listingModel.findById(String(id));
    if (!listing) throw createHttpError(404, 'Listing not found.');
    if (listing.sellerId !== userId) throw createHttpError(403, 'You can only modify your own listings.');
    return listing;
}

async function updateListing(userId, id, payload) {
    const existing = await requireOwnedListing(userId, id);
    const data = await validatePayload(payload, existing);
    return attachSeller(await listingModel.update(existing.id, data));
}

async function deleteListing(userId, id) {
    const existing = await requireOwnedListing(userId, id);
    await listingModel.remove(existing.id);

    // Envia notificação se for um leilão
    if (existing.type === 'auction') {
        await notificationService.createAuctionNotifications(existing.id, {
            excludeUserId: userId,
            type: 'auction',
            text: `Leilão “${existing.title}” foi cancelado pelo vendedor.`,
        }).catch(() => {});
    }

    return { message: 'Anúncio deletado com sucesso', listingId: existing.id };
}

async function toggleFavorite(userId, id) {
    const result = await listingModel.toggleFavorite(userId, String(id));
    if (!result) throw createHttpError(404, 'Listing not found.');
    return result;
}

async function getFavorites(userId) {
    return attachSellers(await listingModel.listBy({ favoriteUserId: userId }));
}

async function getListingsBySeller(sellerId) {
    const items = await listingModel.listBy({ sellerId });
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