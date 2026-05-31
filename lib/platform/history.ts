import { getDb } from '@/lib/db';

export type TradeRecord = {
  id: string;
  wallet: string;
  market_id: string;
  market_title: string;
  kind: string;
  side: string | null;
  amount_usdc: number;
  price: number | null;
  tx_hash: string | null;
  created_at: string;
};

function rowToTrade(row: Record<string, unknown>): TradeRecord {
  return {
    id: row.id as string,
    wallet: row.wallet as string,
    market_id: row.market_id as string,
    market_title: row.market_title as string,
    kind: row.kind as string,
    side: (row.side as string | null) ?? null,
    amount_usdc: Number(row.amount_usdc),
    price: row.price != null ? Number(row.price) : null,
    tx_hash: (row.tx_hash as string | null) ?? null,
    created_at: (row.created_at as Date).toISOString()
  };
}

export async function recordTrade(input: {
  wallet: string;
  marketId: string;
  marketTitle: string;
  kind: 'buy' | 'sell' | 'claim' | 'limit_fill' | 'amm_buy';
  side?: 'yes' | 'no';
  amountUsdc: number;
  price?: number;
  txHash?: string;
}): Promise<TradeRecord> {
  const db = getDb();
  const id = crypto.randomUUID();
  const { rows } = await db.query(
    `INSERT INTO trade_history
       (id, wallet, market_id, market_title, kind, side, amount_usdc, price, tx_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      id,
      input.wallet.toLowerCase(),
      input.marketId.toLowerCase(),
      input.marketTitle,
      input.kind,
      input.side ?? null,
      input.amountUsdc,
      input.price ?? null,
      input.txHash ?? null
    ]
  );
  return rowToTrade(rows[0]);
}

export async function listTradeHistory(wallet: string, limit = 100): Promise<TradeRecord[]> {
  const db = getDb();
  const { rows } = await db.query(
    `SELECT * FROM trade_history WHERE wallet = $1 ORDER BY created_at DESC LIMIT $2`,
    [wallet.toLowerCase(), limit]
  );
  return rows.map(rowToTrade);
}
