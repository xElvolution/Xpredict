import { NextRequest } from 'next/server';
import { getSettings, updateSettings } from '@/lib/platform/settings';
import { apiOk, apiErr, ensureAllSchemas } from '@/lib/sdk/api-utils';

export const dynamic = 'force-dynamic';

function walletFromReq(req: NextRequest): string | null {
  const w = req.headers.get('x-wallet-address') ?? req.nextUrl.searchParams.get('wallet');
  return w?.startsWith('0x') ? w.toLowerCase() : null;
}

export async function GET(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const wallet = walletFromReq(req);
    if (!wallet) return apiErr('VALIDATION_ERROR', 'wallet required (x-wallet-address header)', 400);
    const settings = await getSettings(wallet);
    return apiOk({ settings });
  } catch (err) {
    console.error('[v1/settings GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const wallet = walletFromReq(req);
    if (!wallet) return apiErr('VALIDATION_ERROR', 'wallet required', 400);
    const body = await req.json();
    const settings = await updateSettings(wallet, body);
    return apiOk({ settings });
  } catch (err) {
    console.error('[v1/settings PATCH]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
