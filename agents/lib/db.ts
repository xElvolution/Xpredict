import { Pool } from 'pg';
import { ensureSchema, upsertMarketMeta } from '../../lib/db';

let _db: Pool | null = null;
function getDb() {
  if (!_db) _db = new Pool({ connectionString: process.env.DATABASE_URL });
  return _db;
}

export async function logAgentAction(agent: string, action: string, payload?: object, txHash?: string) {
  const db = getDb();
  await ensureSchema();
  await db.query(
    'INSERT INTO agent_log (agent, action, payload, tx_hash) VALUES ($1, $2, $3, $4)',
    [agent, action, payload ? JSON.stringify(payload) : null, txHash ?? null]
  );
}

export { upsertMarketMeta };
