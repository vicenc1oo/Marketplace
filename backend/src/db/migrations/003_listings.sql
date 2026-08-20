CREATE TABLE IF NOT EXISTS categories (
                                          id TEXT PRIMARY KEY,
                                          name VARCHAR(80) NOT NULL,
    icon VARCHAR(40) NOT NULL
    );

-- Inserir categorias padrão
INSERT INTO categories (id, name, icon) VALUES
                                            ('electronics', 'Electronics', 'device'),
                                            ('home', 'Home & Garden', 'home'),
                                            ('fashion', 'Fashion', 'tag'),
                                            ('bikes', 'Bikes', 'bike'),
                                            ('books', 'Books & Media', 'book'),
                                            ('furniture', 'Furniture', 'sofa'),
                                            ('sports', 'Sports', 'ball'),
                                            ('kids', 'Kids', 'toy')
    ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS listings (
                                        id TEXT PRIMARY KEY,
                                        seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'EUR',
    category_id TEXT NOT NULL REFERENCES categories(id),
    condition VARCHAR(40) NOT NULL,
    location VARCHAR(80) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'fixed',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    favorites_count INTEGER NOT NULL DEFAULT 0,
    views_count INTEGER NOT NULL DEFAULT 0,
    starting_bid NUMERIC(12, 2),
    current_bid NUMERIC(12, 2),
    bids_count INTEGER NOT NULL DEFAULT 0,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS listing_favorites (
                                                 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
    );

CREATE INDEX IF NOT EXISTS idx_listing_favorites_listing
    ON listing_favorites (listing_id);

CREATE INDEX IF NOT EXISTS idx_listings_seller
    ON listings (seller_id);

CREATE INDEX IF NOT EXISTS idx_listings_category
    ON listings (category_id);

CREATE INDEX IF NOT EXISTS idx_listings_status_created
    ON listings (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_type
    ON listings (type);

CREATE INDEX IF NOT EXISTS idx_listings_location
    ON listings (location);