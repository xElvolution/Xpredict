import { NextRequest } from 'next/server';
import { authenticateAgent, authenticateCurator } from '@/lib/sdk/auth';
import { createProposal, listProposals } from '@/lib/sdk/db';
import { apiOk, apiErr, ensureAllSchemas, checkRateLimit } from '@/lib/sdk/api-utils';
import { validateProposal } from '@/lib/sdk/validate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateAgent(req);
    if (!auth.ok) return apiErr('UNAUTHORIZED', auth.error, auth.status);

    const limited = checkRateLimit(req, 'proposals:create', 20, 60 * 60 * 1000, auth.handle);
    if (limited) return limited;

    await ensureAllSchemas();
    const body = await req.json();
    const input = validateProposal(body);
    if (typeof input === 'string') return apiErr('VALIDATION_ERROR', input, 400);

    const proposal = await createProposal(auth.handle, input);
    return apiOk({ proposal }, 201);
  } catch (err) {
    console.error('[v1/proposals POST]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
    const isCurator = authenticateCurator(req);

    if (status === 'pending') {
      if (!isCurator) {
        return apiErr('FORBIDDEN', 'x-curator-secret header required for pending queue', 403);
      }
      const proposals = await listProposals({ status: 'pending' });
      return apiOk({ proposals });
    }

    const auth = await authenticateAgent(req);
    if (!auth.ok) return apiErr('UNAUTHORIZED', auth.error, auth.status);

    const proposals = await listProposals({
      status: status ?? undefined,
      agentHandle: auth.handle
    });

    return apiOk({ proposals });
  } catch (err) {
    console.error('[v1/proposals GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
