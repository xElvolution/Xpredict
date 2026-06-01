import 'dotenv/config';
import { getDb, ensureSchema } from '../lib/db';

const DUPLICATES = [
  '0xA7C1E4Bc709Ac2cB8CD77b4901F9C8d5a88c90B2', // French Open dupe
  '0x48ECbc37a4E624bAaAafe3aE1fb29498EDD271b9', // UFC Bonfim dupe #2
  '0x44CCf57C1011a8Dd5c3955E3Dc3bEC7975e78172', // Denver Nuggets dupe
  '0x48F3746608E0865Bf30cF7F0D2E481052148D517'  // UFC Bonfim dupe #1
];

async function main() {
  await ensureSchema();
  const db = getDb();

  await db.query(`
    ALTER TABLE market_meta ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;
  `);

  for (const addr of DUPLICATES) {
    const lc = addr.toLowerCase();
    const res = await db.query(
      `UPDATE market_meta SET hidden = TRUE WHERE address = $1 RETURNING address`,
      [lc]
    );
    if (res.rowCount === 0) {
      // Insert a hidden row with minimal meta so the filter still catches it
      await db.query(
        `INSERT INTO market_meta (address, category, subtitle, agent_handle, hidden)
         VALUES ($1, 'Other', '', '@curator.ai', TRUE)
         ON CONFLICT (address) DO UPDATE SET hidden = TRUE`,
        [lc]
      );
    }
    console.log(`hidden: ${addr}`);
  }

  console.log('done');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
