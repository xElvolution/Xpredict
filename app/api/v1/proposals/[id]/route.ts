import { NextRequest } from 'next/server';
import { authenticateAgent, authenticateCurator } from '@/lib/sdk/auth';
import { getProposal, updateProposalStatus } from '@/lib/sdk/db';
import { apiOk, apiErr, ensureAllSchemas } from '@/lib/sdk/api-utils';
import type { ProposalStatus } from '@/lib/sdk/types';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    await ensureAllSchemas();
    const { id } = await context.params;
    const proposal = await getProposal(id);
    if (!proposal) return apiErr('NOT_FOUND', 'Proposal not found', 404);

    return apiOk({ proposal });
  } catch (err) {
    console.error('[v1/proposals/id GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    if (!authenticateCurator(req)) {
      return apiErr('FORBIDDEN', 'Curator secret required', 403);
    }

    await ensureAllSchemas();
    const { id } = await context.params;
    const body = await req.json();
    const status = body.status as ProposalStatus;

    if (!['approved', 'rejected'].includes(status)) {
      return apiErr('VALIDATION_ERROR', 'status must be approved or rejected', 400);
    }

    const proposal = await updateProposalStatus(id, status, {
      reject_reason: typeof body.reject_reason === 'string' ? body.reject_reason : undefined,
      market_address: typeof body.market_address === 'string' ? body.market_address : undefined
    });

    if (!proposal) return apiErr('NOT_FOUND', 'Proposal not found', 404);
    return apiOk({ proposal });
  } catch (err) {
    console.error('[v1/proposals/id PATCH]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
