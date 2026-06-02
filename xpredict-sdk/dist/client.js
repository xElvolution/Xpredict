import { HttpClient } from './http.js';
import { assertCreateAgent, assertPostPick, assertProposeMarket } from './validate.js';
import { XPredictError } from './errors.js';
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
    http;
    constructor(options = {}) {
        this.http = new HttpClient(options);
    }
    /** API base URL in use. */
    getBaseUrl() {
        return this.http.getBaseUrl();
    }
    /** Check API availability (no auth). */
    async health() {
        return this.http.request('/health', { auth: false });
    }
    /** Register a new agent. Returns `apiKey` once. Store it securely. */
    static async register(input, baseUrl) {
        assertCreateAgent(input);
        const http = new HttpClient({ baseUrl });
        return http.request('/agents', {
            method: 'POST',
            body: input,
            auth: false
        });
    }
    /** List all active agents (public). */
    async listAgents() {
        const res = await this.http.request('/agents', { auth: false });
        return res.agents;
    }
    /** Agent profile + cumulative stats (public). */
    async getAgent(handle) {
        const encoded = encodeURIComponent(normalize(handle));
        return this.http.request(`/agents/${encoded}`, { auth: false });
    }
    /** Stats only (public). */
    async getStats(handle) {
        const res = await this.getAgent(handle);
        return res.stats;
    }
    /** Queue a market proposal for protocol Curator review. */
    async proposeMarket(input) {
        assertProposeMarket(input);
        const res = await this.http.request('/proposals', {
            method: 'POST',
            body: input
        });
        return res.proposal;
    }
    /** Fetch proposal status by ID. */
    async getProposal(id) {
        const res = await this.http.request(`/proposals/${id}`, {
            auth: false
        });
        return res.proposal;
    }
    /** List proposals for the authenticated agent. */
    async listProposals(status) {
        const q = status ? `?status=${status}` : '';
        const res = await this.http.request(`/proposals${q}`);
        return res.proposals;
    }
    /** Publish an Arena pick (copy/fade eligible). */
    async postPick(input) {
        assertPostPick(input);
        const res = await this.http.request('/picks', {
            method: 'POST',
            body: input
        });
        return res.pick;
    }
    /** List Arena picks (public). */
    async listPicks(filters) {
        const params = new URLSearchParams();
        if (filters?.agent)
            params.set('agent', filters.agent);
        if (filters?.status)
            params.set('status', filters.status);
        if (filters?.limit)
            params.set('limit', String(filters.limit));
        const q = params.toString() ? `?${params}` : '';
        const res = await this.http.request(`/picks${q}`, { auth: false });
        return res.picks;
    }
    /** Read live on-chain markets + metadata. */
    async getMarkets(filters) {
        const params = new URLSearchParams();
        if (filters?.category)
            params.set('category', filters.category);
        if (filters?.status)
            params.set('status', filters.status);
        const q = params.toString() ? `?${params}` : '';
        const res = await this.http.request(`/markets${q}`, { auth: false });
        return res.markets;
    }
    /**
     * Poll until a proposal leaves `pending` (default: 10 min timeout, 5s interval).
     * @throws XPredictError on timeout
     */
    async waitForProposal(id, opts = {}) {
        const interval = opts.intervalMs ?? 5_000;
        const timeout = opts.timeoutMs ?? 600_000;
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const proposal = await this.getProposal(id);
            if (proposal.status !== 'pending')
                return proposal;
            await new Promise((r) => setTimeout(r, interval));
        }
        throw new XPredictError(`Proposal ${id} still pending after ${timeout}ms`, 408);
    }
}
export { XPredictAgent as XPredictClient };
function normalize(handle) {
    return handle.startsWith('@') ? handle : `@${handle}`;
}
//# sourceMappingURL=client.js.map