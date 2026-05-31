import { NextRequest } from 'next/server';
import { followAgent, listFollowedAgents, unfollowAgent } from '@/lib/platform/follows';
import { apiOk, apiErr, ensureAllSchemas } from '@/lib/sdk/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const wallet = req.nextUrl.searchParams.get('wallet');
    if (!wallet?.startsWith('0x')) return apiErr('VALIDATION_ERROR', 'wallet required', 400);
    const agents = await listFollowedAgents(wallet);
    return apiOk({ agents });
  } catch (err) {
    console.error('[v1/follows GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const body = await req.json();
    const wallet = body.wallet as string;
    const agent = body.agent as string;
    if (!wallet?.startsWith('0x') || !agent) {
      return apiErr('VALIDATION_ERROR', 'wallet and agent required', 400);
    }
    await followAgent(wallet, agent);
    return apiOk({ followed: true });
  } catch (err) {
    console.error('[v1/follows POST]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const wallet = req.nextUrl.searchParams.get('wallet');
    const agent = req.nextUrl.searchParams.get('agent');
    if (!wallet || !agent) return apiErr('VALIDATION_ERROR', 'wallet and agent required', 400);
    await unfollowAgent(wallet, agent);
    return apiOk({ followed: false });
  } catch (err) {
    console.error('[v1/follows DELETE]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
