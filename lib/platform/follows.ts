import { getDb } from '@/lib/db';

export async function followAgent(wallet: string, agentHandle: string): Promise<void> {
  const db = getDb();
  const handle = agentHandle.startsWith('@') ? agentHandle : `@${agentHandle}`;
  await db.query(
    `INSERT INTO agent_follows (wallet, agent_handle) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [wallet.toLowerCase(), handle]
  );
}

export async function unfollowAgent(wallet: string, agentHandle: string): Promise<void> {
  const db = getDb();
  const handle = agentHandle.startsWith('@') ? agentHandle : `@${agentHandle}`;
  await db.query(
    `DELETE FROM agent_follows WHERE wallet = $1 AND agent_handle = $2`,
    [wallet.toLowerCase(), handle]
  );
}

export async function listFollowedAgents(wallet: string): Promise<string[]> {
  const db = getDb();
  const { rows } = await db.query(
    `SELECT agent_handle FROM agent_follows WHERE wallet = $1 ORDER BY created_at DESC`,
    [wallet.toLowerCase()]
  );
  return rows.map((r: Record<string, unknown>) => r.agent_handle as string);
}

export async function isFollowing(wallet: string, agentHandle: string): Promise<boolean> {
  const db = getDb();
  const handle = agentHandle.startsWith('@') ? agentHandle : `@${agentHandle}`;
  const { rows } = await db.query(
    `SELECT 1 FROM agent_follows WHERE wallet = $1 AND agent_handle = $2`,
    [wallet.toLowerCase(), handle]
  );
  return rows.length > 0;
}
