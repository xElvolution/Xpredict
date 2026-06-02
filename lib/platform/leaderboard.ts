import { getDb } from '@/lib/db';

export type UserRank = {
  wallet: string;
  predictions: number;
  wins: number;
  volume: number;
  pnl: number;
  winRate: number;
};

export type UserSort = 'pnl' | 'winRate' | 'volume' | 'predictions';

/**
 * Aggregated user leaderboard. Derived from trade_history:
 *  - "predictions" = count of buy/amm_buy/limit_fill rows
 *  - "wins" = count of claim rows (a claim implies a winning resolved position)
 *  - "volume" = sum of buy collateral
 *  - "pnl" = sum(claim amounts) - sum(buy collateral)  (rough realised P&L)
 */
export async function getUserLeaderboard(
  sort: UserSort = 'pnl',
  limit = 100
): Promise<UserRank[]> {
  const db = getDb();
  const { rows } = await db.query(
    `
    SELECT
      wallet,
      COUNT(*) FILTER (WHERE kind IN ('buy', 'amm_buy', 'limit_fill')) AS predictions,
      COUNT(*) FILTER (WHERE kind = 'claim')                          AS wins,
      COALESCE(SUM(amount_usdc) FILTER (WHERE kind IN ('buy', 'amm_buy', 'limit_fill')), 0) AS volume,
      COALESCE(SUM(amount_usdc) FILTER (WHERE kind = 'claim'), 0)
        - COALESCE(SUM(amount_usdc) FILTER (WHERE kind IN ('buy', 'amm_buy', 'limit_fill')), 0) AS pnl
    FROM trade_history
    WHERE wallet IS NOT NULL
    GROUP BY wallet
    HAVING COUNT(*) FILTER (WHERE kind IN ('buy', 'amm_buy', 'limit_fill')) > 0
    LIMIT $1
    `,
    [limit]
  );

  const ranked: UserRank[] = rows.map((row) => {
    const predictions = Number(row.predictions);
    const wins = Number(row.wins);
    return {
      wallet: String(row.wallet),
      predictions,
      wins,
      volume: Number(row.volume),
      pnl: Number(row.pnl),
      winRate: predictions > 0 ? wins / predictions : 0
    };
  });

  ranked.sort((a, b) => {
    switch (sort) {
      case 'winRate':     return b.winRate     - a.winRate;
      case 'volume':      return b.volume      - a.volume;
      case 'predictions': return b.predictions - a.predictions;
      case 'pnl':
      default:            return b.pnl         - a.pnl;
    }
  });

  return ranked;
}
