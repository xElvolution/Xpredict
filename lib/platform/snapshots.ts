import { getDb } from '@/lib/db';

export async function upsertSnapshot(wallet: string, valueUsdc: number): Promise<void> {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  await db.query(
    `INSERT INTO portfolio_snapshots (wallet, value_usdc, snapshot_date)
     VALUES ($1, $2, $3)
     ON CONFLICT (wallet, snapshot_date) DO UPDATE SET value_usdc = EXCLUDED.value_usdc`,
    [wallet.toLowerCase(), valueUsdc, today]
  );
}

export async function getSnapshots(wallet: string, days = 30): Promise<{ date: string; value: number }[]> {
  const db = getDb();
  const { rows } = await db.query(
    `SELECT snapshot_date, value_usdc FROM portfolio_snapshots
     WHERE wallet = $1 ORDER BY snapshot_date DESC LIMIT $2`,
    [wallet.toLowerCase(), days]
  );
  return rows
    .map((r: Record<string, unknown>) => ({ date: (r.snapshot_date as Date).toISOString().slice(0, 10), value: Number(r.value_usdc) }))
    .reverse();
}
