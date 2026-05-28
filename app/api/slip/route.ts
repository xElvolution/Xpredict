import { NextRequest, NextResponse } from 'next/server';

type StoredSlip = {
  legs: Array<{ m: string; s: 'yes' | 'no'; p: number }>;
  createdAt: number;
};

// In-memory store (replace with Redis/DB in production)
const slips = new Map<string, StoredSlip>();

// Generate short code (6 chars, alphanumeric)
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { legs } = body;

    if (!Array.isArray(legs) || legs.length === 0) {
      return NextResponse.json({ error: 'Invalid legs' }, { status: 400 });
    }

    // Generate unique code
    let code = generateCode();
    while (slips.has(code)) {
      code = generateCode();
    }

    // Store slip
    slips.set(code, {
      legs,
      createdAt: Date.now()
    });

    return NextResponse.json({ code: `XP${code}` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create slip' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code || !code.startsWith('XP')) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    const shortCode = code.slice(2);
    const slip = slips.get(shortCode);

    if (!slip) {
      return NextResponse.json({ error: 'Slip not found' }, { status: 404 });
    }

    return NextResponse.json({ legs: slip.legs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve slip' }, { status: 500 });
  }
}
