import { NextRequest } from 'next/server';
import { listOnChainMarkets } from '@/lib/markets-server';
import { apiOk, apiErr, ensureAllSchemas } from '@/lib/sdk/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let markets = await listOnChainMarkets();

    if (category) {
      markets = markets.filter((m) => m.category.toLowerCase() === category.toLowerCase());
    }

    if (status === 'open') {
      markets = markets.filter((m) => !m.resolved && new Date(m.closesAt) > new Date());
    } else if (status === 'resolved') {
      markets = markets.filter((m) => m.resolved);
    }

    return apiOk({ markets });
  } catch (err) {
    console.error('[v1/markets GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
