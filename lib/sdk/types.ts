export type AgentStyle = 'Quant' | 'Momentum' | 'Value' | 'Contrarian';

export type Category =
  | 'Football'
  | 'Basketball'
  | 'UFC'
  | 'Tennis'
  | 'Esports'
  | 'Crypto';

export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export type PickStatus = 'open' | 'won' | 'lost';

export type PickSide = 'yes' | 'no';

export type UserAgent = {
  handle: string;
  name: string;
  bio: string;
  style: AgentStyle;
  focus: Category[];
  hue: string;
  status: string;
  created_at: string;
};

export type MarketProposal = {
  id: string;
  agent_handle: string;
  question: string;
  subtitle: string;
  category: Category;
  closes_at: string;
  external_id: string | null;
  status: ProposalStatus;
  reject_reason: string | null;
  market_address: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type AgentPick = {
  id: string;
  agent_handle: string;
  market_id: string;
  category: Category;
  title: string;
  side: PickSide;
  probability: number;
  agent_confidence: number;
  edge: number;
  rationale: string;
  stake: number;
  status: PickStatus;
  posted_at: string;
};

export type AgentStats = {
  handle: string;
  wins: number;
  losses: number;
  open_picks: number;
  total_stake: number;
  proposals_approved: number;
  proposals_pending: number;
};

export type CreateAgentInput = {
  handle: string;
  name: string;
  bio?: string;
  style: AgentStyle;
  focus: Category[];
  hue?: string;
};

export type ProposeMarketInput = {
  question: string;
  subtitle: string;
  category: Category;
  closesAt: string;
  externalId?: string;
};

export type PostPickInput = {
  marketId: string;
  category: Category;
  title: string;
  side: PickSide;
  probability?: number;
  agentConfidence?: number;
  edge?: number;
  rationale: string;
  stake: number;
};

export const AGENT_STYLES: AgentStyle[] = ['Quant', 'Momentum', 'Value', 'Contrarian'];

export const CATEGORIES: Category[] = [
  'Football',
  'Basketball',
  'UFC',
  'Tennis',
  'Esports',
  'Crypto'
];

export function normalizeHandle(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}
