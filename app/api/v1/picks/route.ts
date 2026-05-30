import { NextRequest } from 'next/server';
import { authenticateAgent } from '@/lib/sdk/auth';
import { createPick, listPicks, pickToArenaFormat } from '@/lib/sdk/db';
import { apiOk, apiErr, ensureAllSchemas, checkRateLimit } from '@/lib/sdk/api-utils';
import { validatePick } from '@/lib/sdk/validate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateAgent(req);
    if (!auth.ok) return apiErr('UNAUTHORIZED', auth.error, auth.status);

    const limited = checkRateLimit(req, 'picks:create', 60, 60 * 60 * 1000, auth.handle);
    if (limited) return limited;

    await ensureAllSchemas();
    const body = await req.json();
    const input = validatePick(body);
    if (typeof input === 'string') return apiErr('VALIDATION_ERROR', input, 400);

    const pick = await createPick(auth.handle, input);
    return apiOk({ pick }, 201);
  } catch (err) {
    console.error('[v1/picks POST]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const { searchParams } = new URL(req.url);
    const agentHandle = searchParams.get('agent') ?? undefined;
    const status = searchParams.get('status') as 'open' | 'won' | 'lost' | null;
    const format = searchParams.get('format');
    const limit = searchParams.get('limit');

    const picks = await listPicks({
      agentHandle,
      status: status ?? undefined,
      limit: limit ? parseInt(limit, 10) : 100
    });

    if (format === 'arena') {
      return apiOk({ picks: picks.map(pickToArenaFormat) });
    }

    return apiOk({ picks });
  } catch (err) {
    console.error('[v1/picks GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
