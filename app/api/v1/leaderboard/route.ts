import { NextRequest } from 'next/server';
import { listAgents, getAgentStats, agentToArenaFormat } from '@/lib/sdk/db';
import { getSnapshots } from '@/lib/platform/snapshots';
import { getUserLeaderboard, type UserSort } from '@/lib/platform/leaderboard';
import { apiOk, apiErr, ensureAllSchemas } from '@/lib/sdk/api-utils';

export const dynamic = 'force-dynamic';

const VALID_USER_SORTS: UserSort[] = ['pnl', 'winRate', 'volume', 'predictions'];

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

    if (type === 'users') {
      const sortParam = (searchParams.get('sort') ?? 'pnl') as UserSort;
      const sort: UserSort = VALID_USER_SORTS.includes(sortParam) ? sortParam : 'pnl';
      const leaderboard = await getUserLeaderboard(sort, 100);
      return apiOk({ leaderboard, sort });
    }

    const wallet = searchParams.get('wallet');
    if (wallet?.startsWith('0x')) {
      const snapshots = await getSnapshots(wallet);
      return apiOk({ snapshots });
    }

    return apiErr('VALIDATION_ERROR', 'type=agents|users or wallet required', 400);
  } catch (err) {
    console.error('[v1/leaderboard GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
