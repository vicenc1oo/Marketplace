CREATE TABLE IF NOT EXISTS notifications (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	type VARCHAR(40) NOT NULL DEFAULT 'system',
	text TEXT NOT NULL,
	read BOOLEAN NOT NULL DEFAULT false,
	link VARCHAR(500),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
	ON notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
	ON notifications (user_id, read);