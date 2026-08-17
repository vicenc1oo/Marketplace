CREATE TABLE IF NOT EXISTS wallets (
	user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,
  promotion_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_created
	ON wallet_transactions (user_id, created_at DESC);