import { getDb } from '@/lib/db';

export type LimitOrder = {
  id: string;
  wallet: string;
  market_id: string;
  market_title: string;
  category: string;
  side: 'yes' | 'no';
  price: number;
  quantity_usdc: number;
  filled_usdc: number;
  status: 'open' | 'partial' | 'filled' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type OrderBookLevel = {
  price: number;
  quantity: number;
  orderCount: number;
};

function rowToOrder(row: Record<string, unknown>): LimitOrder {
  return {
    id: row.id as string,
    wallet: row.wallet as string,
    market_id: row.market_id as string,
    market_title: row.market_title as string,
    category: row.category as string,
    side: row.side as 'yes' | 'no',
    price: Number(row.price),
    quantity_usdc: Number(row.quantity_usdc),
    filled_usdc: Number(row.filled_usdc),
    status: row.status as LimitOrder['status'],
    created_at: (row.created_at as Date).toISOString(),
    updated_at: (row.updated_at as Date).toISOString()
  };
}

export async function createLimitOrder(input: {
  wallet: string;
  marketId: string;
  marketTitle: string;
  category: string;
  side: 'yes' | 'no';
  price: number;
  quantityUsdc: number;
}): Promise<LimitOrder> {
  const db = getDb();
  const id = crypto.randomUUID();
  const wallet = input.wallet.toLowerCase();

  const { rows } = await db.query(
    `INSERT INTO limit_orders
       (id, wallet, market_id, market_title, category, side, price, quantity_usdc)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      id,
      wallet,
      input.marketId.toLowerCase(),
      input.marketTitle,
      input.category,
      input.side,
      input.price,
      input.quantityUsdc
    ]
  );

  const order = rowToOrder(rows[0]);
  await tryMatchOrders(input.marketId.toLowerCase(), input.side);
  const refreshed = await getOrder(id);
  return refreshed ?? order;
}

export async function getOrder(id: string): Promise<LimitOrder | null> {
  const db = getDb();
  const { rows } = await db.query('SELECT * FROM limit_orders WHERE id = $1', [id]);
  return rows[0] ? rowToOrder(rows[0]) : null;
}

export async function listOrders(filters: {
  wallet?: string;
  marketId?: string;
  status?: string;
}): Promise<LimitOrder[]> {
  const db = getDb();
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.wallet) {
    params.push(filters.wallet.toLowerCase());
    clauses.push(`wallet = $${params.length}`);
  }
  if (filters.marketId) {
    params.push(filters.marketId.toLowerCase());
    clauses.push(`market_id = $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await db.query(
    `SELECT * FROM limit_orders ${where} ORDER BY created_at DESC LIMIT 200`,
    params
  );
  return rows.map(rowToOrder);
}

export async function cancelOrder(id: string, wallet: string): Promise<LimitOrder | null> {
  const db = getDb();
  const { rows } = await db.query(
    `UPDATE limit_orders SET status = 'cancelled', updated_at = NOW()
     WHERE id = $1 AND wallet = $2 AND status IN ('open', 'partial')
     RETURNING *`,
    [id, wallet.toLowerCase()]
  );
  return rows[0] ? rowToOrder(rows[0]) : null;
}

export async function getOrderBook(
  marketId: string,
  side: 'yes' | 'no'
): Promise<{ bids: OrderBookLevel[]; asks: OrderBookLevel[] }> {
  const db = getDb();
  const mid = marketId.toLowerCase();

  const { rows } = await db.query(
    `SELECT side, price,
            SUM(quantity_usdc - filled_usdc) AS qty,
            COUNT(*) AS cnt
     FROM limit_orders
     WHERE market_id = $1 AND status IN ('open', 'partial') AND side = $2
     GROUP BY side, price
     ORDER BY price DESC`,
    [mid, side]
  );

  const levels: OrderBookLevel[] = rows.map((r: Record<string, unknown>) => ({
    price: Number(r.price),
    quantity: Number(r.qty),
    orderCount: Number(r.cnt)
  }));

  // Bids = buy orders (higher price first). For binary market we treat all as bids on chosen outcome.
  return { bids: levels, asks: [] };
}

/** Simple price-time matching: opposite wallets, same market+side, prices cross. */
async function tryMatchOrders(marketId: string, side: 'yes' | 'no'): Promise<void> {
  const db = getDb();
  const { rows: opens } = await db.query(
    `SELECT * FROM limit_orders
     WHERE market_id = $1 AND side = $2 AND status IN ('open', 'partial')
     ORDER BY price DESC, created_at ASC`,
    [marketId, side]
  );

  if (opens.length < 2) return;

  // Pair highest-price with lowest-price when spread crosses (simplified CLOB)
  const sorted = opens.map(rowToOrder);
  sorted.sort((a: LimitOrder, b: LimitOrder) => b.price - a.price);

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const high = sorted[i];
      const low = sorted[j];
      if (high.wallet === low.wallet) continue;
      if (high.status !== 'open' && high.status !== 'partial') continue;
      if (low.status !== 'open' && low.status !== 'partial') continue;
      if (high.price < low.price) continue;

      const matchPrice = (high.price + low.price) / 2;
      const highRemaining = high.quantity_usdc - high.filled_usdc;
      const lowRemaining = low.quantity_usdc - low.filled_usdc;
      const fillAmount = Math.min(highRemaining, lowRemaining);
      if (fillAmount <= 0) continue;

      await fillOrder(high.id, fillAmount);
      await fillOrder(low.id, fillAmount);

      const { recordTrade } = await import('./history');
      await recordTrade({
        wallet: high.wallet,
        marketId,
        marketTitle: high.market_title,
        kind: 'limit_fill',
        side,
        amountUsdc: fillAmount,
        price: matchPrice
      });
      await recordTrade({
        wallet: low.wallet,
        marketId,
        marketTitle: low.market_title,
        kind: 'limit_fill',
        side,
        amountUsdc: fillAmount,
        price: matchPrice
      });
    }
  }
}

async function fillOrder(id: string, amount: number): Promise<void> {
  const db = getDb();
  await db.query(
    `UPDATE limit_orders SET
       filled_usdc = filled_usdc + $2,
       status = CASE WHEN filled_usdc + $2 >= quantity_usdc THEN 'filled' ELSE 'partial' END,
       updated_at = NOW()
     WHERE id = $1`,
    [id, amount]
  );
}
