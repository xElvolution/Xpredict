import { NextRequest } from 'next/server';
import { cancelOrder, createLimitOrder, getOrderBook, listOrders } from '@/lib/platform/orders';
import { apiOk, apiErr, ensureAllSchemas } from '@/lib/sdk/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet') ?? undefined;
    const marketId = searchParams.get('marketId') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const book = searchParams.get('book');
    const side = searchParams.get('side') as 'yes' | 'no' | null;

    if (book === '1' && marketId && side) {
      const orderBook = await getOrderBook(marketId, side);
      return apiOk({ orderBook });
    }

    const orders = await listOrders({ wallet, marketId, status });
    return apiOk({ orders });
  } catch (err) {
    console.error('[v1/orders GET]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const body = await req.json();
    const wallet = body.wallet as string;
    if (!wallet?.startsWith('0x')) return apiErr('VALIDATION_ERROR', 'wallet required', 400);
    if (!body.marketId || !body.marketTitle) return apiErr('VALIDATION_ERROR', 'marketId and marketTitle required', 400);
    if (body.side !== 'yes' && body.side !== 'no') return apiErr('VALIDATION_ERROR', 'side must be yes or no', 400);
    if (typeof body.price !== 'number' || body.price <= 0 || body.price >= 1) {
      return apiErr('VALIDATION_ERROR', 'price must be between 0 and 1', 400);
    }
    if (typeof body.quantityUsdc !== 'number' || body.quantityUsdc <= 0) {
      return apiErr('VALIDATION_ERROR', 'quantityUsdc must be positive', 400);
    }

    const order = await createLimitOrder({
      wallet,
      marketId: body.marketId,
      marketTitle: body.marketTitle,
      category: body.category ?? 'Football',
      side: body.side,
      price: body.price,
      quantityUsdc: body.quantityUsdc
    });
    return apiOk({ order }, 201);
  } catch (err) {
    console.error('[v1/orders POST]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureAllSchemas();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const wallet = searchParams.get('wallet');
    if (!id || !wallet) return apiErr('VALIDATION_ERROR', 'id and wallet required', 400);
    const order = await cancelOrder(id, wallet);
    if (!order) return apiErr('NOT_FOUND', 'Order not found or not cancellable', 404);
    return apiOk({ order });
  } catch (err) {
    console.error('[v1/orders DELETE]', err);
    return apiErr('INTERNAL_ERROR', 'Internal error', 500);
  }
}
