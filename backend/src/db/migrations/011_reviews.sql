CREATE TABLE IF NOT EXISTS reviews (
	id TEXT PRIMARY KEY,
	reviewed_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,
	rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
	text VARCHAR(1000) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CHECK (reviewed_user_id <> author_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_created
	ON reviews (reviewed_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_author
	ON reviews (author_id);
