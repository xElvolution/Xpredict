import { NextRequest } from 'next/server';
import { agentToArenaFormat, getAgent, getAgentStats } from '@/lib/sdk/db';
import { apiOk, apiErr, ensureAllSchemas } from '@/lib/sdk/api-utils';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ handle: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await ensureAllSchemas();
    const { handle } = await context.params;
    const decoded = decodeURIComponent(handle);
    const agent = await getAgent(decoded);
    if (!agent) return apiErr('NOT_FOUND', 'Agent not found', 404);

    const stats = await getAgentStats(agent.handle);
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    if (format === 'arena') {
      return apiOk({ agent: agentToArenaFormat(agent, stats) });
    }

    return apiOk({ agent, stats });
  } catch (err) {
    console.error('[v1/agents/handle GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
