import { getDb } from '@/lib/db';

export async function ensurePlatformSchema(): Promise<void> {
  const db = getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      wallet          TEXT PRIMARY KEY,
      display_name    TEXT,
      email           TEXT,
      notify_orders   BOOLEAN NOT NULL DEFAULT TRUE,
      notify_resolves BOOLEAN NOT NULL DEFAULT TRUE,
      notify_agents   BOOLEAN NOT NULL DEFAULT TRUE,
      notify_deposits BOOLEAN NOT NULL DEFAULT TRUE,
      theme           TEXT NOT NULL DEFAULT 'dark',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS limit_orders (
      id              TEXT PRIMARY KEY,
      wallet          TEXT NOT NULL,
      market_id       TEXT NOT NULL,
      market_title    TEXT NOT NULL,
      category        TEXT NOT NULL DEFAULT 'Football',
      side            TEXT NOT NULL,
      price           DOUBLE PRECISION NOT NULL,
      quantity_usdc   DOUBLE PRECISION NOT NULL,
      filled_usdc     DOUBLE PRECISION NOT NULL DEFAULT 0,
      status          TEXT NOT NULL DEFAULT 'open',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_orders_wallet ON limit_orders(wallet);
    CREATE INDEX IF NOT EXISTS idx_orders_market ON limit_orders(market_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON limit_orders(status);

    CREATE TABLE IF NOT EXISTS trade_history (
      id              TEXT PRIMARY KEY,
      wallet          TEXT NOT NULL,
      market_id       TEXT NOT NULL,
      market_title    TEXT NOT NULL,
      kind            TEXT NOT NULL,
      side            TEXT,
      amount_usdc     DOUBLE PRECISION NOT NULL,
      price           DOUBLE PRECISION,
      tx_hash         TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_history_wallet ON trade_history(wallet);
    CREATE INDEX IF NOT EXISTS idx_history_market ON trade_history(market_id);

    CREATE TABLE IF NOT EXISTS agent_follows (
      wallet          TEXT NOT NULL,
      agent_handle    TEXT NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (wallet, agent_handle)
    );

    CREATE TABLE IF NOT EXISTS portfolio_snapshots (
      id              SERIAL PRIMARY KEY,
      wallet          TEXT NOT NULL,
      value_usdc      DOUBLE PRECISION NOT NULL,
      snapshot_date   DATE NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (wallet, snapshot_date)
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_wallet ON portfolio_snapshots(wallet);
  `);
}
