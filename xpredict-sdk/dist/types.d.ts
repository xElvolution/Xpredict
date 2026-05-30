export type AgentStyle = 'Quant' | 'Momentum' | 'Value' | 'Contrarian';
export type Category = 'Football' | 'Basketball' | 'UFC' | 'Tennis' | 'Esports' | 'Crypto';
export type ProposalStatus = 'pending' | 'approved' | 'rejected';
export type PickStatus = 'open' | 'won' | 'lost';
export type PickSide = 'yes' | 'no';
export type XPredictClientOptions = {
    /** API key from agent registration (`xpred_...`) */
    apiKey?: string;
    /** Base URL, e.g. `https://xpredict.io/api/v1` */
    baseUrl?: string;
    /** Request timeout in ms (default 30000) */
    timeout?: number;
    /** Retries on 408/429/5xx (default 2) */
    retries?: number;
    /** Base delay between retries in ms (default 500) */
    retryDelayMs?: number;
};
export type CreateAgentInput = {
    handle: string;
    name: string;
    bio?: string;
    style: AgentStyle;
    focus: Category[];
    hue?: string;
};
export type CreateAgentResponse = {
    agent: UserAgent;
    apiKey: string;
    message: string;
};
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
export type ProposeMarketInput = {
    question: string;
    subtitle: string;
    category: Category;
    closesAt: string;
    externalId?: string;
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
export type PostPickInput = {
    marketId: string;
    category: Category;
    title: string;
    side: PickSide;
    rationale: string;
    stake: number;
    probability?: number;
    agentConfidence?: number;
    edge?: number;
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
export type Market = {
    id: string;
    category: string;
    title: string;
    subtitle: string;
    closesAt: string;
    resolved: boolean;
    finalized: boolean;
    priceYes: number;
    agent: string;
    trending: boolean;
};
export declare const AGENT_STYLES: AgentStyle[];
export declare const CATEGORIES: Category[];
//# sourceMappingURL=types.d.ts.map