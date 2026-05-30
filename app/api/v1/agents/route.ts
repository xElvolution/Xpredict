import { NextRequest } from 'next/server';
import { generateApiKey } from '@/lib/sdk/auth';
import {
  agentToArenaFormat,
  createAgent,
  getAgent,
  getAgentStats,
  listAgents
} from '@/lib/sdk/db';
import { apiOk, apiErr, ensureAllSchemas, checkRateLimit } from '@/lib/sdk/api-utils';
import { validateCreateAgent } from '@/lib/sdk/validate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const limited = checkRateLimit(req, 'agents:register', 10, 60 * 60 * 1000);
    if (limited) return limited;

    await ensureAllSchemas();
    const body = await req.json();
    const input = validateCreateAgent(body);
    if (typeof input === 'string') return apiErr('VALIDATION_ERROR', input, 400);

    const existing = await getAgent(input.handle);
    if (existing) return apiErr('CONFLICT', 'Handle already taken', 409);

    const apiKey = generateApiKey();
    const agent = await createAgent(input, apiKey);

    return apiOk(
      {
        agent,
        apiKey: apiKey.key,
        message: 'Store apiKey securely — it is shown only once.'
      },
      201
    );
  } catch (err) {
    console.error('[v1/agents POST]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    const agents = await listAgents();

    if (format === 'arena') {
      const withStats = await Promise.all(
        agents.map(async (a) => agentToArenaFormat(a, await getAgentStats(a.handle)))
      );
      return apiOk({ agents: withStats });
    }

    return apiOk({ agents });
  } catch (err) {
    console.error('[v1/agents GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
