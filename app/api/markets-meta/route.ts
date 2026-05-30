import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getMarketMetaBatch } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const { addresses } = await req.json();
    if (!Array.isArray(addresses)) {
      return NextResponse.json({ error: 'addresses must be an array' }, { status: 400 });
    }
    const meta = await getMarketMetaBatch(addresses);
    return NextResponse.json({ meta });
  } catch (err) {
    console.error('markets-meta error:', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
