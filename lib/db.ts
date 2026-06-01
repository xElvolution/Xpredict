import { Pool } from 'pg';

let pool: Pool | null = null;

/**
 * Lazy singleton Postgres pool. Uses DATABASE_URL env var.
 * On the VPS this points at the local Postgres instance running alongside the agents.
 */
export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000
    });
  }
  return pool;
}

/**
 * Run on first import to create schema if it doesn't exist.
 * Idempotent — safe to call repeatedly.
 */
export async function ensureSchema(): Promise<void> {
  const db = getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS market_meta (
      address       TEXT PRIMARY KEY,
      category      TEXT NOT NULL,
      subtitle      TEXT NOT NULL,
      agent_handle  TEXT NOT NULL,
      external_id   TEXT,
      trending      BOOLEAN DEFAULT FALSE,
      hidden        BOOLEAN DEFAULT FALSE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS slips (
      code        TEXT PRIMARY KEY,
      legs        JSONB NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS agent_log (
      id          SERIAL PRIMARY KEY,
      agent       TEXT NOT NULL,
      action      TEXT NOT NULL,
      payload     JSONB,
      tx_hash     TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Idempotent column addition for older schemas
  await db.query(`ALTER TABLE market_meta ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;`).catch(() => {});
}

export type MarketMeta = {
  address: string;
  category: string;
  subtitle: string;
  agent_handle: string;
  external_id: string | null;
  trending: boolean;
  hidden: boolean;
};

export async function getMarketMeta(address: string): Promise<MarketMeta | null> {
  const db = getDb();
  const { rows } = await db.query<MarketMeta>(
    'SELECT * FROM market_meta WHERE address = $1',
    [address.toLowerCase()]
  );
  return rows[0] ?? null;
}

export async function getMarketMetaBatch(addresses: string[]): Promise<Record<string, MarketMeta>> {
  if (addresses.length === 0) return {};
  const db = getDb();
  const { rows } = await db.query<MarketMeta>(
    'SELECT * FROM market_meta WHERE address = ANY($1::text[])',
    [addresses.map((a) => a.toLowerCase())]
  );
  return Object.fromEntries(rows.map((r) => [r.address, r]));
}

export async function upsertMarketMeta(meta: MarketMeta): Promise<void> {
  const db = getDb();
  await db.query(
    `INSERT INTO market_meta (address, category, subtitle, agent_handle, external_id, trending)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (address) DO UPDATE SET
       category     = EXCLUDED.category,
       subtitle     = EXCLUDED.subtitle,
       agent_handle = EXCLUDED.agent_handle,
       external_id  = EXCLUDED.external_id,
       trending     = EXCLUDED.trending`,
    [
      meta.address.toLowerCase(),
      meta.category,
      meta.subtitle,
      meta.agent_handle,
      meta.external_id,
      meta.trending
    ]
  );
}
