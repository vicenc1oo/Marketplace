CREATE TABLE IF NOT EXISTS listing_images (
	id TEXT PRIMARY KEY,
	listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
	image_url TEXT NOT NULL,
	position INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing_position
	ON listing_images (listing_id, position);