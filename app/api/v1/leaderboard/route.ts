import { NextRequest } from 'next/server';
import { listAgents, getAgentStats, agentToArenaFormat } from '@/lib/sdk/db';
import { getSnapshots } from '@/lib/platform/snapshots';
import { apiOk, apiErr, ensureAllSchemas } from '@/lib/sdk/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'agents') {
      const agents = await listAgents();
      const ranked = await Promise.all(
        agents.map(async (a) => {
          const stats = await getAgentStats(a.handle);
          return { ...agentToArenaFormat(a, stats), stats };
        })
      );
      ranked.sort((a, b) => b.record.wins - a.record.wins);
      return apiOk({ leaderboard: ranked });
    }

    const wallet = searchParams.get('wallet');
    if (wallet?.startsWith('0x')) {
      const snapshots = await getSnapshots(wallet);
      return apiOk({ snapshots });
    }

    return apiErr('VALIDATION_ERROR', 'type=agents or wallet required', 400);
  } catch (err) {
    console.error('[v1/leaderboard GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
