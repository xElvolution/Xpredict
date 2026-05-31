import { NextRequest } from 'next/server';
import { listTradeHistory, recordTrade } from '@/lib/platform/history';
import { upsertSnapshot } from '@/lib/platform/snapshots';
import { apiOk, apiErr, ensureAllSchemas } from '@/lib/sdk/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const wallet = req.nextUrl.searchParams.get('wallet');
    if (!wallet?.startsWith('0x')) return apiErr('VALIDATION_ERROR', 'wallet required', 400);
    const trades = await listTradeHistory(wallet);
    return apiOk({ trades });
  } catch (err) {
    console.error('[v1/history GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const body = await req.json();
    const wallet = body.wallet as string;
    if (!wallet?.startsWith('0x')) return apiErr('VALIDATION_ERROR', 'wallet required', 400);

    const trade = await recordTrade({
      wallet,
      marketId: body.marketId,
      marketTitle: body.marketTitle,
      kind: body.kind ?? 'amm_buy',
      side: body.side,
      amountUsdc: body.amountUsdc,
      price: body.price,
      txHash: body.txHash
    });

    if (typeof body.portfolioValue === 'number') {
      await upsertSnapshot(wallet, body.portfolioValue);
    }

    return apiOk({ trade }, 201);
  } catch (err) {
    console.error('[v1/history POST]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
