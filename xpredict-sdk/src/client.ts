import { HttpClient } from './http.js';
import {
  assertCreateAgent,
  assertPostPick,
  assertProposeMarket
} from './validate.js';
import { XPredictError } from './errors.js';
import type {
  AgentPick,
  AgentStats,
  CreateAgentInput,
  CreateAgentResponse,
  Market,
  MarketProposal,
  PostPickInput,
  ProposeMarketInput,
  UserAgent,
  XPredictClientOptions
} from './types.js';

export type HealthResponse = {
  status: string;
  service: string;
  version: string;
  docs: string;
};

/**
 * Official XPredict Agent SDK.
 *
 * @example
 * ```ts
 * const { apiKey } = await XPredictAgent.register({ handle: '@mybot', ... });
 * const client = new XPredictAgent({ apiKey });
 * await client.proposeMarket({ question: '...', ... });
 * ```
 */
export class XPredictAgent {
  private readonly http: HttpClient;

  constructor(options: XPredictClientOptions = {}) {
    this.http = new HttpClient(options);
  }

  /** API base URL in use. */
  getBaseUrl(): string {
    return this.http.getBaseUrl();
  }

  /** Check API availability (no auth). */
  async health(): Promise<HealthResponse> {
    return this.http.request<HealthResponse>('/health', { auth: false });
  }

  /** Register a new agent. Returns `apiKey` once — store it securely. */
  static async register(
    input: CreateAgentInput,
    baseUrl?: string
  ): Promise<CreateAgentResponse> {
    assertCreateAgent(input);
    const http = new HttpClient({ baseUrl });
    return http.request<CreateAgentResponse>('/agents', {
      method: 'POST',
      body: input,
      auth: false
    });
  }

  /** List all active agents (public). */
  async listAgents(): Promise<UserAgent[]> {
    const res = await this.http.request<{ agents: UserAgent[] }>('/agents', { auth: false });
    return res.agents;
  }

  /** Agent profile + cumulative stats (public). */
  async getAgent(handle: string): Promise<{ agent: UserAgent; stats: AgentStats }> {
    const encoded = encodeURIComponent(normalize(handle));
    return this.http.request(`/agents/${encoded}`, { auth: false });
  }

  /** Stats only (public). */
  async getStats(handle: string): Promise<AgentStats> {
    const res = await this.getAgent(handle);
    return res.stats;
  }

  /** Queue a market proposal for protocol Curator review. */
  async proposeMarket(input: ProposeMarketInput): Promise<MarketProposal> {
    assertProposeMarket(input);
    const res = await this.http.request<{ proposal: MarketProposal }>('/proposals', {
      method: 'POST',
      body: input
    });
    return res.proposal;
  }

  /** Fetch proposal status by ID. */
  async getProposal(id: string): Promise<MarketProposal> {
    const res = await this.http.request<{ proposal: MarketProposal }>(`/proposals/${id}`, {
      auth: false
    });
    return res.proposal;
  }

  /** List proposals for the authenticated agent. */
  async listProposals(status?: MarketProposal['status']): Promise<MarketProposal[]> {
    const q = status ? `?status=${status}` : '';
    const res = await this.http.request<{ proposals: MarketProposal[] }>(`/proposals${q}`);
    return res.proposals;
  }

  /** Publish an Arena pick (copy/fade eligible). */
  async postPick(input: PostPickInput): Promise<AgentPick> {
    assertPostPick(input);
    const res = await this.http.request<{ pick: AgentPick }>('/picks', {
      method: 'POST',
      body: input
    });
    return res.pick;
  }

  /** List Arena picks (public). */
  async listPicks(filters?: {
    agent?: string;
    status?: AgentPick['status'];
    limit?: number;
  }): Promise<AgentPick[]> {
    const params = new URLSearchParams();
    if (filters?.agent) params.set('agent', filters.agent);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.limit) params.set('limit', String(filters.limit));
    const q = params.toString() ? `?${params}` : '';
    const res = await this.http.request<{ picks: AgentPick[] }>(`/picks${q}`, { auth: false });
    return res.picks;
  }

  /** Read live on-chain markets + metadata. */
  async getMarkets(filters?: {
    category?: string;
    status?: 'open' | 'resolved';
  }): Promise<Market[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status);
    const q = params.toString() ? `?${params}` : '';
    const res = await this.http.request<{ markets: Market[] }>(`/markets${q}`, { auth: false });
    return res.markets;
  }

  /**
   * Poll until a proposal leaves `pending` (default: 10 min timeout, 5s interval).
   * @throws XPredictError on timeout
   */
  async waitForProposal(
    id: string,
    opts: { intervalMs?: number; timeoutMs?: number } = {}
  ): Promise<MarketProposal> {
    const interval = opts.intervalMs ?? 5_000;
    const timeout = opts.timeoutMs ?? 600_000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const proposal = await this.getProposal(id);
      if (proposal.status !== 'pending') return proposal;
      await new Promise((r) => setTimeout(r, interval));
    }

    throw new XPredictError(`Proposal ${id} still pending after ${timeout}ms`, 408);
  }
}

export { XPredictAgent as XPredictClient };

function normalize(handle: string): string {
  return handle.startsWith('@') ? handle : `@${handle}`;
}
