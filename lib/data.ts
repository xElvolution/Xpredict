export type Outcome = { label: string; probability: number; volume: number };

export type Category = 'Football' | 'Basketball' | 'UFC' | 'Tennis' | 'Esports' | 'Crypto';

export type Market = {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  closesAt: string;          // ISO
  volume: number;            // USDC
  liquidity: number;         // USDC
  traders: number;
  outcomes: Outcome[];
  agent: string;             // creator agent handle
  trending?: boolean;
  resolved?: boolean;
};

export type FeedEvent = {
  id: string;
  kind: 'bet' | 'resolve' | 'create' | 'cancel';
  at: string;                // ISO
  who: string;               // address
  text: string;
  amount?: number;
  marketId?: string;
};

export type Agent = {
  handle: string;
  name: string;
  role: 'Curator' | 'Pricing' | 'Resolver' | 'Coach';
  marketsCreated: number;
  accuracy: number;          // %
  volumeRouted: number;
  status: 'active' | 'idle';
};

export type LeaderRow = {
  rank: number;
  player: string;
  address: string;
  pnl: number;
  winRate: number;
  streak: number;
  tier: 'Oracle' | 'Pro' | 'Rookie';
};

/* -------------------------------------------------------- */
/*  Mock data — replace with on-chain reads in production    */
/* -------------------------------------------------------- */

export const MARKETS: Market[] = [
  {
    id: 'mkt_001',
    category: 'Football',
    title: 'Will Argentina win FIFA World Cup 2026?',
    subtitle: 'Resolves on final whistle of the tournament final',
    closesAt: '2026-07-19T20:00:00Z',
    volume: 1_842_500,
    liquidity: 412_000,
    traders: 3214,
    agent: '@curator.argentum',
    trending: true,
    outcomes: [
      { label: 'Yes', probability: 0.31, volume: 571_175 },
      { label: 'No',  probability: 0.69, volume: 1_271_325 }
    ]
  },
  {
    id: 'mkt_002',
    category: 'Football',
    title: 'Real Madrid vs Barcelona: Real to win?',
    subtitle: 'El Clásico, June 1 · 90 min including stoppage',
    closesAt: '2026-06-01T20:00:00Z',
    volume: 421_300,
    liquidity: 88_700,
    traders: 982,
    agent: '@curator.laliga',
    trending: true,
    outcomes: [
      { label: 'Yes', probability: 0.54, volume: 227_502 },
      { label: 'No',  probability: 0.46, volume: 193_798 }
    ]
  },
  {
    id: 'mkt_003',
    category: 'Basketball',
    title: 'Lakers to reach NBA Finals 2026?',
    subtitle: 'Playoff bracket resolves at conference final',
    closesAt: '2026-06-12T02:00:00Z',
    volume: 612_840,
    liquidity: 121_400,
    traders: 1487,
    agent: '@curator.nba',
    outcomes: [
      { label: 'Yes', probability: 0.42, volume: 257_392 },
      { label: 'No',  probability: 0.58, volume: 355_448 }
    ]
  },
  {
    id: 'mkt_004',
    category: 'UFC',
    title: 'Topuria retains featherweight title at UFC 312?',
    subtitle: 'Resolves by official decision or finish',
    closesAt: '2026-06-08T05:00:00Z',
    volume: 184_220,
    liquidity: 42_100,
    traders: 612,
    agent: '@curator.octagon',
    outcomes: [
      { label: 'Yes', probability: 0.66, volume: 121_585 },
      { label: 'No',  probability: 0.34, volume: 62_635 }
    ]
  },
  {
    id: 'mkt_005',
    category: 'Tennis',
    title: 'Alcaraz wins Roland Garros 2026?',
    subtitle: 'French Open men’s singles final',
    closesAt: '2026-06-07T15:00:00Z',
    volume: 248_900,
    liquidity: 56_800,
    traders: 803,
    agent: '@curator.atp',
    outcomes: [
      { label: 'Yes', probability: 0.48, volume: 119_472 },
      { label: 'No',  probability: 0.52, volume: 129_428 }
    ]
  },
  {
    id: 'mkt_006',
    category: 'Esports',
    title: 'T1 wins LoL Mid-Season Invitational 2026?',
    subtitle: 'Best of 5 grand final in Vancouver',
    closesAt: '2026-06-15T22:00:00Z',
    volume: 96_400,
    liquidity: 22_900,
    traders: 441,
    agent: '@curator.rift',
    outcomes: [
      { label: 'Yes', probability: 0.38, volume: 36_632 },
      { label: 'No',  probability: 0.62, volume: 59_768 }
    ]
  },
  {
    id: 'mkt_007',
    category: 'Football',
    title: 'Nigeria qualifies for AFCON 2027 knockout?',
    subtitle: 'Group stage top-2 finish required',
    closesAt: '2026-12-29T18:00:00Z',
    volume: 312_750,
    liquidity: 68_400,
    traders: 1124,
    agent: '@curator.afcon',
    trending: true,
    outcomes: [
      { label: 'Yes', probability: 0.71, volume: 222_052 },
      { label: 'No',  probability: 0.29, volume: 90_698 }
    ]
  },
  {
    id: 'mkt_008',
    category: 'Crypto',
    title: 'ETH closes June 2026 above $4,800?',
    subtitle: 'Settles to Coinbase 23:59 UTC June 30 close',
    closesAt: '2026-06-30T23:59:00Z',
    volume: 894_200,
    liquidity: 188_300,
    traders: 2018,
    agent: '@curator.macro',
    outcomes: [
      { label: 'Yes', probability: 0.57, volume: 509_694 },
      { label: 'No',  probability: 0.43, volume: 384_506 }
    ]
  }
];

export const AGENTS: Agent[] = [
  { handle: '@curator.argentum', name: 'Argentum',  role: 'Curator',  marketsCreated: 184, accuracy: 0,    volumeRouted: 4_120_000, status: 'active' },
  { handle: '@pricing.lmsr',     name: 'LMSR Core', role: 'Pricing',  marketsCreated: 0,   accuracy: 0,    volumeRouted: 12_840_000, status: 'active' },
  { handle: '@resolver.chronos', name: 'Chronos',   role: 'Resolver', marketsCreated: 0,   accuracy: 99.4, volumeRouted: 8_340_000, status: 'active' },
  { handle: '@coach.delphi',     name: 'Delphi',    role: 'Coach',    marketsCreated: 0,   accuracy: 73.2, volumeRouted: 0,         status: 'active' }
];

export const FEED: FeedEvent[] = [
  { id: 'f1', kind: 'bet',     at: new Date(Date.now() - 1000 * 12).toISOString(),   who: '0x8af2…1d3e', text: 'YES on Real to beat Barça',         amount: 250,  marketId: 'mkt_002' },
  { id: 'f2', kind: 'create',  at: new Date(Date.now() - 1000 * 38).toISOString(),   who: '@curator.nba',    text: 'New market: Celtics over 112.5 vs Knicks' },
  { id: 'f3', kind: 'bet',     at: new Date(Date.now() - 1000 * 71).toISOString(),   who: '0x2bf1…9c44', text: 'NO on ETH > $4,800 June close',     amount: 1_400, marketId: 'mkt_008' },
  { id: 'f4', kind: 'resolve', at: new Date(Date.now() - 1000 * 142).toISOString(),  who: '@resolver.chronos', text: 'Settled: Djokovic def. Sinner → YES' },
  { id: 'f5', kind: 'bet',     at: new Date(Date.now() - 1000 * 188).toISOString(),  who: '0x91dd…7e02', text: 'YES on Argentina lifts the trophy',  amount: 80,   marketId: 'mkt_001' },
  { id: 'f6', kind: 'bet',     at: new Date(Date.now() - 1000 * 213).toISOString(),  who: '0x44a0…b1ce', text: 'YES on Topuria retains',             amount: 620,  marketId: 'mkt_004' },
  { id: 'f7', kind: 'create',  at: new Date(Date.now() - 1000 * 290).toISOString(),  who: '@curator.argentum', text: 'New market: Messi assists 2+ in next match' },
  { id: 'f8', kind: 'cancel',  at: new Date(Date.now() - 1000 * 412).toISOString(),  who: '@resolver.chronos', text: 'Voided: PSG match postponed by weather' }
];

export const LEADERBOARD: LeaderRow[] = [
  { rank: 1, player: 'odogwu.eth',    address: '0x91dd…7e02', pnl:  84_210, winRate: 71.4, streak: 9, tier: 'Oracle' },
  { rank: 2, player: 'kaizen',        address: '0x44a0…b1ce', pnl:  62_980, winRate: 68.2, streak: 4, tier: 'Oracle' },
  { rank: 3, player: 'midnight.lens', address: '0x2bf1…9c44', pnl:  51_320, winRate: 65.0, streak: 6, tier: 'Pro' },
  { rank: 4, player: 'satoshibae',    address: '0x8af2…1d3e', pnl:  38_440, winRate: 62.1, streak: 2, tier: 'Pro' },
  { rank: 5, player: 'pelican.ai',    address: '0x7011…aa12', pnl:  29_120, winRate: 59.8, streak: 3, tier: 'Pro' },
  { rank: 6, player: 'ferdinand',     address: '0x1c52…f3a8', pnl:  24_810, winRate: 57.6, streak: 1, tier: 'Pro' },
  { rank: 7, player: 'lagos.boy',     address: '0x6e3d…2245', pnl:  19_640, winRate: 54.0, streak: 5, tier: 'Rookie' },
  { rank: 8, player: 'oracle.osa',    address: '0x0b9a…ce70', pnl:  14_280, winRate: 52.3, streak: 2, tier: 'Rookie' }
];

export const HERO_STATS = [
  { label: 'Total volume',     value: '$48.2M', sub: 'last 30 days' },
  { label: 'Open markets',     value: '1,284',  sub: 'across 6 categories' },
  { label: 'Resolution',       value: '99.4%',  sub: 'autonomous accuracy' },
  { label: 'Active predictors',value: '21,907', sub: 'this week' }
];
