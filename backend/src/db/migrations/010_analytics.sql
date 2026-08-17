CREATE TABLE IF NOT EXISTS analytics_events (
	id TEXT PRIMARY KEY,
	user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
	listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,
	type VARCHAR(60) NOT NULL,
	metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
	ON analytics_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_listing_created
	ON analytics_events (listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
	ON analytics_events (type, created_at DESC);