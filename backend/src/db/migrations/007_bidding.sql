CREATE TABLE IF NOT EXISTS bids (
	id TEXT PRIMARY KEY,
	listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
	bidder_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	amount NUMERIC(12, 2) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bids_listing_created
	ON bids (listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bids_bidder_created
	ON bids (bidder_id, created_at DESC);