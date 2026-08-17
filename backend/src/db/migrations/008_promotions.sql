CREATE TABLE IF NOT EXISTS promotion_packages (
	id TEXT PRIMARY KEY,
	name VARCHAR(80) NOT NULL,
	credits INTEGER NOT NULL,
	duration_days INTEGER NOT NULL,
	description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS listing_promotions (
	id TEXT PRIMARY KEY,
	listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	package_id TEXT NOT NULL REFERENCES promotion_packages(id),
	starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	ends_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_promotions_listing
	ON listing_promotions (listing_id);

CREATE INDEX IF NOT EXISTS idx_listing_promotions_active
	ON listing_promotions (listing_id, ends_at);

CREATE INDEX IF NOT EXISTS idx_listing_promotions_user
  ON listing_promotions (user_id, created_at DESC);