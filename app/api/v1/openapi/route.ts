import { NextResponse } from 'next/server';
import openApiSpec from '@/lib/sdk/openapi.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'X-API-Version': 'v1'
    }
  });
}
