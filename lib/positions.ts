export type Position = {
  id: string;
  marketId: string;
  marketTitle: string;
  category: 'Football' | 'Basketball' | 'UFC' | 'Tennis' | 'Esports' | 'Crypto';
  side: 'yes' | 'no';
  shares: number;
  entryPrice: number;     // 0..1, implied probability at entry
  currentPrice: number;   // 0..1, live implied prob
  pnl: number;            // USDC, can be negative
  status: 'open' | 'won' | 'lost';
  openedAt: string;
  resolvedAt?: string;
  claimable?: boolean;
};

export const MOCK_POSITIONS: Position[] = [
  {
    id: 'p1',
    marketId: 'mkt_002',
    marketTitle: 'Real Madrid vs Barcelona: Real to win?',
    category: 'Football',
    side: 'yes',
    shares: 420,
    entryPrice: 0.48,
    currentPrice: 0.54,
    pnl:  +25.20,
    status: 'open',
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 'p2',
    marketId: 'mkt_001',
    marketTitle: 'Will Argentina win FIFA World Cup 2026?',
    category: 'Football',
    side: 'yes',
    shares: 250,
    entryPrice: 0.28,
    currentPrice: 0.31,
    pnl:  +7.50,
    status: 'open',
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
  },
  {
    id: 'p3',
    marketId: 'mkt_008',
    marketTitle: 'ETH closes June 2026 above $4,800?',
    category: 'Crypto',
    side: 'no',
    shares: 1_200,
    entryPrice: 0.51,
    currentPrice: 0.43,
    pnl:  +96.00,
    status: 'open',
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString()
  },
  {
    id: 'p4',
    marketId: 'mkt_004',
    marketTitle: 'Topuria retains featherweight title at UFC 312?',
    category: 'UFC',
    side: 'yes',
    shares: 500,
    entryPrice: 0.60,
    currentPrice: 0.66,
    pnl:  +30.00,
    status: 'open',
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: 'p5',
    marketId: 'mkt_x10',
    marketTitle: 'Djokovic def. Sinner: straight sets?',
    category: 'Tennis',
    side: 'yes',
    shares: 300,
    entryPrice: 0.42,
    currentPrice: 1.00,
    pnl:  +174.00,
    status: 'won',
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    claimable: true
  },
  {
    id: 'p6',
    marketId: 'mkt_x11',
    marketTitle: 'Bayern over 2.5 goals vs Dortmund?',
    category: 'Football',
    side: 'no',
    shares: 220,
    entryPrice: 0.52,
    currentPrice: 1.00,
    pnl:  +105.60,
    status: 'won',
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    claimable: true
  },
  {
    id: 'p7',
    marketId: 'mkt_x12',
    marketTitle: 'Sinner wins Australian Open 2026?',
    category: 'Tennis',
    side: 'yes',
    shares: 180,
    entryPrice: 0.55,
    currentPrice: 0.00,
    pnl:  -99.00,
    status: 'lost',
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  }
];

export type ProfileStats = {
  totalPnl: number;
  unrealizedPnl: number;
  winRate: number;       // 0..100
  marketsTraded: number;
  lifetimeVolume: number;
  rank: number;
  tier: 'Oracle' | 'Pro' | 'Rookie';
  streak: number;
};

export const MOCK_STATS: ProfileStats = {
  totalPnl:        +339.30,
  unrealizedPnl:   +158.70,
  winRate:         63.4,
  marketsTraded:   41,
  lifetimeVolume:  18_420,
  rank:            142,
  tier:            'Pro',
  streak:          4
};

// 30-day P&L series, in USDC, for the sparkline
export const MOCK_PNL_SERIES = [
  -12, -8, -15, 6, 22, 31, 28, 44, 38, 51,
  47, 60, 72, 68, 81, 77, 92, 110, 104, 121,
  138, 145, 152, 168, 175, 188, 210, 248, 290, 339
];
