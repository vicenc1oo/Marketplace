const crypto = require('crypto');
const { pool, query } = require('../../config/db');

const CATEGORY_BY_NAME = {
    // Inglês
    'Electronics': 'electronics',
    'Home & Garden': 'home',
    'Fashion': 'fashion',
    'Bikes': 'bikes',
    'Books & Media': 'books',
    'Furniture': 'furniture',
    'Sports': 'sports',
    'Kids': 'kids',

    // Português
    'Eletrônicos': 'electronics',
    'Casa & Jardim': 'home',
    'Moda': 'fashion',
    'Bicicletas': 'bikes',
    'Livros & Mídia': 'books',
    'Móveis': 'furniture',
    'Esportes': 'sports',
    'Crianças': 'kids',
    'Infantil': 'kids',
};

const LISTING_SELECT = `
   SELECT
       l.*,
       COALESCE(
               json_agg(li.image_url ORDER BY li.position)
               FILTER (WHERE li.id IS NOT NULL),
               '[]'::json
       ) AS images
   FROM listings l
            LEFT JOIN listing_images li ON li.listing_id = l.id
`;

function makeId(prefix) {
    return typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function toListing(row) {
    if (!row) return null;

    const listing = {
        id: row.id,
        title: row.title,
        description: row.description,
        price: Number(row.price),
        currency: row.currency,
        category: row.category_id,
        condition: row.condition,
        location: row.location,
        sellerId: row.seller_id,
        images: row.images || [],
        type: row.type,
        status: row.status,
        favoritesCount: row.favorites_count,
        viewsCount: row.views_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };

    if (row.type === 'auction') {
        listing.endsAt = row.ends_at;
        listing.startingBid = row.starting_bid == null ? null : Number(row.starting_bid);
        listing.currentBid = row.current_bid == null ? null : Number(row.current_bid);
        listing.bidsCount = row.bids_count;
    }

    return listing;
}

function listingGroupAndOrder(orderBy = 'l.created_at DESC') {
    return `GROUP BY l.id ORDER BY ${orderBy}`;
}

function normalizeCategoryId(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return '';

    // Tenta encontrar no mapa de nomes (exato)
    if (CATEGORY_BY_NAME[raw]) {
        return CATEGORY_BY_NAME[raw];
    }

    // Tenta encontrar por correspondência case insensitive
    const lowerRaw = raw.toLowerCase();
    for (const [key, id] of Object.entries(CATEGORY_BY_NAME)) {
        if (key.toLowerCase() === lowerRaw) {
            return id;
        }
    }

    // Se não encontrar, retorna o valor original
    return raw;
}

async function listCategories() {
    const result = await query('SELECT id, name, icon FROM categories ORDER BY name ASC');
    return result.rows;
}

async function categoryExists(categoryId) {
    const normalized = normalizeCategoryId(categoryId);

    // Verifica se a categoria existe por ID ou nome (case insensitive)
    const result = await query(
        `SELECT 1 FROM categories 
         WHERE LOWER(id) = LOWER($1) 
         OR LOWER(name) = LOWER($1)`,
        [normalized]
    );
    return result.rowCount > 0;
}

async function getCategoryId(categoryValue) {
    const normalized = normalizeCategoryId(categoryValue);

    // Busca o ID da categoria por ID ou nome
    const result = await query(
        `SELECT id FROM categories 
         WHERE LOWER(id) = LOWER($1) 
         OR LOWER(name) = LOWER($1)`,
        [normalized]
    );

    return result.rows[0]?.id || null;
}

async function list({ filters = {}, page = 1, limit = 12, sort = 'recent' } = {}) {
    const clauses = ["l.status = 'active'"];
    const values = [];

    function addFilter(sql, value) {
        values.push(value);
        clauses.push(sql.replace('?', `$${values.length}`));
    }

    if (filters.category) {
        // Tenta obter o ID correto da categoria
        const categoryId = await getCategoryId(filters.category) || normalizeCategoryId(filters.category);
        addFilter('l.category_id = ?', categoryId);
    }
    if (filters.location) addFilter('LOWER(l.location) = LOWER(?)', filters.location);
    if (filters.condition) addFilter('l.condition = ?', filters.condition);
    if (filters.type) addFilter('l.type = ?', filters.type);
    if (filters.minPrice != null) addFilter('COALESCE(l.current_bid, l.price) >= ?', filters.minPrice);
    if (filters.maxPrice != null) addFilter('COALESCE(l.current_bid, l.price) <= ?', filters.maxPrice);
    if (filters.q) {
        values.push(filters.q);
        clauses.push(
            `(l.title ILIKE '%' || $${values.length} || '%'
        OR l.description ILIKE '%' || $${values.length} || '%')`,
        );
    }

    const where = `WHERE ${clauses.join(' AND ')}`;
    const countResult = await query(`SELECT COUNT(*)::int AS total FROM listings l ${where}`, values);
    const orderBy = {
        recent: 'l.created_at DESC',
        price_asc: 'COALESCE(l.current_bid, l.price) ASC',
        price_desc: 'COALESCE(l.current_bid, l.price) DESC',
        popular: 'l.favorites_count DESC',
    }[sort];

    const pagedValues = [...values, limit, (page - 1) * limit];
    const result = await query(
        `${LISTING_SELECT}
     ${where}
     ${listingGroupAndOrder(orderBy)}
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        pagedValues,
    );

    return {
        items: result.rows.map(toListing),
        total: countResult.rows[0].total,
    };
}

async function listBy({ sellerId, favoriteUserId, status = null, limit = null, orderBy = 'l.created_at DESC' } = {}) {
    const joins = favoriteUserId
        ? 'JOIN listing_favorites lf ON lf.listing_id = l.id AND lf.user_id = $1'
        : '';
    const values = favoriteUserId ? [favoriteUserId] : [];
    const clauses = [];

    if (sellerId) {
        values.push(sellerId);
        clauses.push(`l.seller_id = $${values.length}`);
    }
    if (status) {
        values.push(status);
        clauses.push(`l.status = $${values.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const limitClause = limit ? `LIMIT ${Number(limit)}` : '';
    const result = await query(
        `${LISTING_SELECT}
     ${joins}
     ${where}
     ${listingGroupAndOrder(orderBy)}
     ${limitClause}`,
        values,
    );
    return result.rows.map(toListing);
}

async function findById(id, client = { query }) {
    const result = await client.query(
        `${LISTING_SELECT} WHERE l.id = $1 GROUP BY l.id`,
        [id],
    );
    return toListing(result.rows[0]);
}

async function replaceImages(client, listingId, images) {
    await client.query('DELETE FROM listing_images WHERE listing_id = $1', [listingId]);
    for (const [position, imageUrl] of images.entries()) {
        await client.query(
            `INSERT INTO listing_images (id, listing_id, image_url, position)
       VALUES ($1, $2, $3, $4)`,
            [makeId('image'), listingId, imageUrl, position],
        );
    }
}

async function insert(data) {
    const client = await pool.connect();
    const id = makeId('listing');
    try {
        await client.query('BEGIN');

        // Obtém o ID correto da categoria
        const categoryId = await getCategoryId(data.category) || data.category;

        await client.query(
            `INSERT INTO listings (
         id, seller_id, title, description, price, currency, category_id,
         condition, location, type, status, favorites_count, views_count,
         starting_bid, current_bid, bids_count, ends_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12, $13,
         $14, $15, $16, $17
       )`,
            [
                id, data.sellerId, data.title, data.description, data.price, data.currency,
                categoryId, data.condition, data.location, data.type, data.status,
                data.favoritesCount, data.viewsCount, data.startingBid ?? null,
                data.currentBid ?? null, data.bidsCount ?? 0, data.endsAt ?? null,
            ],
        );
        await replaceImages(client, id, data.images);
        await client.query('COMMIT');
        return findById(id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function update(id, data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Obtém o ID correto da categoria
        const categoryId = await getCategoryId(data.category) || data.category;

        const result = await client.query(
            `UPDATE listings SET
         title = $2, description = $3, price = $4, category_id = $5,
         condition = $6, location = $7, type = $8, status = $9,
         starting_bid = $10, current_bid = $11, bids_count = $12,
         ends_at = $13, updated_at = NOW()
       WHERE id = $1`,
            [
                id, data.title, data.description, data.price, categoryId,
                data.condition, data.location, data.type, data.status,
                data.type === 'auction' ? data.startingBid : null,
                data.type === 'auction' ? data.currentBid : null,
                data.type === 'auction' ? data.bidsCount : 0,
                data.type === 'auction' ? data.endsAt : null,
            ],
        );
        if (!result.rowCount) {
            await client.query('ROLLBACK');
            return null;
        }
        await replaceImages(client, id, data.images);
        await client.query('COMMIT');
        return findById(id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function remove(id) {
    const result = await query('DELETE FROM listings WHERE id = $1', [id]);
    return result.rowCount > 0;
}

async function incrementViews(id) {
    const result = await query(
        'UPDATE listings SET views_count = views_count + 1 WHERE id = $1 RETURNING id',
        [id],
    );
    return result.rowCount ? findById(id) : null;
}

async function toggleFavorite(userId, listingId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const locked = await client.query('SELECT id FROM listings WHERE id = $1 FOR UPDATE', [listingId]);
        if (!locked.rowCount) {
            await client.query('ROLLBACK');
            return null;
        }

        const removed = await client.query(
            'DELETE FROM listing_favorites WHERE user_id = $1 AND listing_id = $2 RETURNING listing_id',
            [userId, listingId],
        );
        const saved = removed.rowCount === 0;
        if (saved) {
            await client.query(
                'INSERT INTO listing_favorites (user_id, listing_id) VALUES ($1, $2)',
                [userId, listingId],
            );
        }

        const countResult = await client.query(
            'SELECT COUNT(*)::int AS count FROM listing_favorites WHERE listing_id = $1',
            [listingId],
        );
        const favoritesCount = countResult.rows[0].count;
        await client.query(
            'UPDATE listings SET favorites_count = $2, updated_at = NOW() WHERE id = $1',
            [listingId, favoritesCount],
        );
        await client.query('COMMIT');
        return { saved, favoritesCount };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    listCategories,
    categoryExists,
    getCategoryId,
    list,
    listBy,
    findById,
    insert,
    update,
    remove,
    incrementViews,
    toggleFavorite,
};