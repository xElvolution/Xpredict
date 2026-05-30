import { createHash, randomBytes } from 'crypto';
import { NextRequest } from 'next/server';
import { getAgentByApiKeyHash } from './db';

const KEY_PREFIX = 'xpred_';

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const secret = randomBytes(24).toString('hex');
  const key = `${KEY_PREFIX}${secret}`;
  return {
    key,
    hash: hashApiKey(key),
    prefix: key.slice(0, 12)
  };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function extractBearerToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export async function authenticateAgent(req: NextRequest): Promise<
  { ok: true; handle: string } | { ok: false; status: number; error: string }
> {
  const token = extractBearerToken(req);
  if (!token || !token.startsWith(KEY_PREFIX)) {
    return { ok: false, status: 401, error: 'Missing or invalid API key. Use Authorization: Bearer xpred_...' };
  }

  const agent = await getAgentByApiKeyHash(hashApiKey(token));
  if (!agent) {
    return { ok: false, status: 401, error: 'Invalid API key' };
  }

  return { ok: true, handle: agent.handle };
}

export function authenticateCurator(req: NextRequest): boolean {
  const secret = process.env.CURATOR_INTERNAL_SECRET;
  if (!secret) return false;
  const header = req.headers.get('x-curator-secret');
  return header === secret;
}
