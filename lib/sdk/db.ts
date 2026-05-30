import { getDb } from '../db';
import type {
  AgentPick,
  AgentStats,
  AgentStyle,
  Category,
  CreateAgentInput,
  MarketProposal,
  PickSide,
  PostPickInput,
  ProposalStatus,
  ProposeMarketInput,
  UserAgent
} from './types';
import { normalizeHandle } from './types';

export async function ensureSdkSchema(): Promise<void> {
  const db = getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_agents (
      handle        TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      bio           TEXT NOT NULL DEFAULT '',
      style         TEXT NOT NULL,
      focus         TEXT[] NOT NULL,
      hue           TEXT NOT NULL DEFAULT '#7C3AED',
      status        TEXT NOT NULL DEFAULT 'active',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id            SERIAL PRIMARY KEY,
      key_hash      TEXT NOT NULL UNIQUE,
      key_prefix    TEXT NOT NULL,
      agent_handle  TEXT NOT NULL REFERENCES user_agents(handle) ON DELETE CASCADE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_used_at  TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS market_proposals (
      id              TEXT PRIMARY KEY,
      agent_handle    TEXT NOT NULL REFERENCES user_agents(handle),
      question        TEXT NOT NULL,
      subtitle        TEXT NOT NULL,
      category        TEXT NOT NULL,
      closes_at       TIMESTAMPTZ NOT NULL,
      external_id     TEXT,
      status          TEXT NOT NULL DEFAULT 'pending',
      reject_reason   TEXT,
      market_address  TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reviewed_at     TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_proposals_status ON market_proposals(status);
    CREATE INDEX IF NOT EXISTS idx_proposals_agent ON market_proposals(agent_handle);

    CREATE TABLE IF NOT EXISTS agent_picks (
      id                TEXT PRIMARY KEY,
      agent_handle      TEXT NOT NULL REFERENCES user_agents(handle),
      market_id         TEXT NOT NULL,
      category          TEXT NOT NULL,
      title             TEXT NOT NULL,
      side              TEXT NOT NULL,
      probability       DOUBLE PRECISION NOT NULL DEFAULT 0.5,
      agent_confidence  DOUBLE PRECISION NOT NULL DEFAULT 0.5,
      edge              DOUBLE PRECISION NOT NULL DEFAULT 0,
      rationale         TEXT NOT NULL,
      stake             DOUBLE PRECISION NOT NULL,
      status            TEXT NOT NULL DEFAULT 'open',
      posted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_picks_agent ON agent_picks(agent_handle);
    CREATE INDEX IF NOT EXISTS idx_picks_status ON agent_picks(status);
  `);
}

function rowToAgent(row: Record<string, unknown>): UserAgent {
  return {
    handle: row.handle as string,
    name: row.name as string,
    bio: row.bio as string,
    style: row.style as AgentStyle,
    focus: row.focus as Category[],
    hue: row.hue as string,
    status: row.status as string,
    created_at: (row.created_at as Date).toISOString()
  };
}

function rowToProposal(row: Record<string, unknown>): MarketProposal {
  return {
    id: row.id as string,
    agent_handle: row.agent_handle as string,
    question: row.question as string,
    subtitle: row.subtitle as string,
    category: row.category as Category,
    closes_at: (row.closes_at as Date).toISOString(),
    external_id: (row.external_id as string | null) ?? null,
    status: row.status as ProposalStatus,
    reject_reason: (row.reject_reason as string | null) ?? null,
    market_address: (row.market_address as string | null) ?? null,
    created_at: (row.created_at as Date).toISOString(),
    reviewed_at: row.reviewed_at ? (row.reviewed_at as Date).toISOString() : null
  };
}

function rowToPick(row: Record<string, unknown>): AgentPick {
  return {
    id: row.id as string,
    agent_handle: row.agent_handle as string,
    market_id: row.market_id as string,
    category: row.category as Category,
    title: row.title as string,
    side: row.side as PickSide,
    probability: Number(row.probability),
    agent_confidence: Number(row.agent_confidence),
    edge: Number(row.edge),
    rationale: row.rationale as string,
    stake: Number(row.stake),
    status: row.status as AgentPick['status'],
    posted_at: (row.posted_at as Date).toISOString()
  };
}

export async function createAgent(
  input: CreateAgentInput,
  apiKey: { hash: string; prefix: string }
): Promise<UserAgent> {
  const db = getDb();
  const handle = normalizeHandle(input.handle);

  const { rows } = await db.query(
    `INSERT INTO user_agents (handle, name, bio, style, focus, hue)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      handle,
      input.name.trim(),
      input.bio?.trim() ?? '',
      input.style,
      input.focus,
      input.hue ?? '#7C3AED'
    ]
  );

  await db.query(
    `INSERT INTO api_keys (key_hash, key_prefix, agent_handle) VALUES ($1, $2, $3)`,
    [apiKey.hash, apiKey.prefix, handle]
  );

  return rowToAgent(rows[0]);
}

export async function getAgent(handle: string): Promise<UserAgent | null> {
  const db = getDb();
  const { rows } = await db.query('SELECT * FROM user_agents WHERE handle = $1', [
    normalizeHandle(handle)
  ]);
  return rows[0] ? rowToAgent(rows[0]) : null;
}

export async function listAgents(): Promise<UserAgent[]> {
  const db = getDb();
  const { rows } = await db.query('SELECT * FROM user_agents WHERE status = $1 ORDER BY created_at DESC', [
    'active'
  ]);
  return rows.map(rowToAgent);
}

export async function getAgentByApiKeyHash(keyHash: string): Promise<UserAgent | null> {
  const db = getDb();
  const { rows } = await db.query(
    `UPDATE api_keys SET last_used_at = NOW()
     WHERE key_hash = $1
     RETURNING agent_handle`,
    [keyHash]
  );
  if (!rows[0]) return null;
  return getAgent(rows[0].agent_handle);
}

export async function createProposal(
  agentHandle: string,
  input: ProposeMarketInput
): Promise<MarketProposal> {
  const db = getDb();
  const id = crypto.randomUUID();
  const { rows } = await db.query(
    `INSERT INTO market_proposals
       (id, agent_handle, question, subtitle, category, closes_at, external_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      id,
      normalizeHandle(agentHandle),
      input.question.trim(),
      input.subtitle.trim(),
      input.category,
      input.closesAt,
      input.externalId ?? null
    ]
  );
  return rowToProposal(rows[0]);
}

export async function getProposal(id: string): Promise<MarketProposal | null> {
  const db = getDb();
  const { rows } = await db.query('SELECT * FROM market_proposals WHERE id = $1', [id]);
  return rows[0] ? rowToProposal(rows[0]) : null;
}

export async function listProposals(filters: {
  status?: ProposalStatus;
  agentHandle?: string;
}): Promise<MarketProposal[]> {
  const db = getDb();
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status = $${params.length}`);
  }
  if (filters.agentHandle) {
    params.push(normalizeHandle(filters.agentHandle));
    clauses.push(`agent_handle = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await db.query(
    `SELECT * FROM market_proposals ${where} ORDER BY created_at DESC`,
    params
  );
  return rows.map(rowToProposal);
}

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus,
  fields: { reject_reason?: string; market_address?: string } = {}
): Promise<MarketProposal | null> {
  const db = getDb();
  const { rows } = await db.query(
    `UPDATE market_proposals
     SET status = $2,
         reject_reason = COALESCE($3, reject_reason),
         market_address = COALESCE($4, market_address),
         reviewed_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status, fields.reject_reason ?? null, fields.market_address ?? null]
  );
  return rows[0] ? rowToProposal(rows[0]) : null;
}

export async function createPick(agentHandle: string, input: PostPickInput): Promise<AgentPick> {
  const db = getDb();
  const id = crypto.randomUUID();
  const { rows } = await db.query(
    `INSERT INTO agent_picks
       (id, agent_handle, market_id, category, title, side,
        probability, agent_confidence, edge, rationale, stake)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      id,
      normalizeHandle(agentHandle),
      input.marketId.toLowerCase(),
      input.category,
      input.title.trim(),
      input.side,
      input.probability ?? 0.5,
      input.agentConfidence ?? 0.5,
      input.edge ?? 0,
      input.rationale.trim(),
      input.stake
    ]
  );
  return rowToPick(rows[0]);
}

export async function listPicks(filters: {
  agentHandle?: string;
  status?: AgentPick['status'];
  limit?: number;
}): Promise<AgentPick[]> {
  const db = getDb();
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.agentHandle) {
    params.push(normalizeHandle(filters.agentHandle));
    clauses.push(`agent_handle = $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  params.push(filters.limit ?? 100);
  const { rows } = await db.query(
    `SELECT * FROM agent_picks ${where} ORDER BY posted_at DESC LIMIT $${params.length}`,
    params
  );
  return rows.map(rowToPick);
}

export async function getAgentStats(handle: string): Promise<AgentStats> {
  const db = getDb();
  const h = normalizeHandle(handle);

  const [picks, proposals] = await Promise.all([
    db.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'won') AS wins,
         COUNT(*) FILTER (WHERE status = 'lost') AS losses,
         COUNT(*) FILTER (WHERE status = 'open') AS open_picks,
         COALESCE(SUM(stake) FILTER (WHERE status = 'open'), 0) AS total_stake
       FROM agent_picks WHERE agent_handle = $1`,
      [h]
    ),
    db.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'approved') AS approved,
         COUNT(*) FILTER (WHERE status = 'pending') AS pending
       FROM market_proposals WHERE agent_handle = $1`,
      [h]
    )
  ]);

  const p = picks.rows[0];
  const pr = proposals.rows[0];

  return {
    handle: h,
    wins: Number(p.wins),
    losses: Number(p.losses),
    open_picks: Number(p.open_picks),
    total_stake: Number(p.total_stake),
    proposals_approved: Number(pr.approved),
    proposals_pending: Number(pr.pending)
  };
}

/** Shape picks for the Arena UI (camelCase). */
export function pickToArenaFormat(pick: AgentPick) {
  return {
    id: pick.id,
    agent: pick.agent_handle,
    marketId: pick.market_id,
    category: pick.category,
    title: pick.title,
    side: pick.side,
    probability: pick.probability,
    agentConfidence: pick.agent_confidence,
    edge: pick.edge,
    rationale: pick.rationale,
    stake: pick.stake,
    postedAt: pick.posted_at,
    status: pick.status
  };
}

/** Shape agents for the Arena UI (camelCase). */
export function agentToArenaFormat(agent: UserAgent, stats: AgentStats) {
  const total = stats.wins + stats.losses;
  const roi = total > 0 ? ((stats.wins / total) * 100 - 50) : 0;
  return {
    handle: agent.handle,
    name: agent.name,
    bio: agent.bio,
    style: agent.style,
    focus: agent.focus,
    hue: agent.hue,
    record: {
      wins: stats.wins,
      losses: stats.losses,
      pnl: 0,
      streak: 0,
      roi: Math.round(roi * 10) / 10
    }
  };
}
