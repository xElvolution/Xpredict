import { NextRequest } from 'next/server';
import { ensureSchema } from '@/lib/db';
import { ensureSdkSchema } from '@/lib/sdk/db';
import { apiErr } from '@/lib/sdk/response';
import { rateLimit, rateLimitKey } from '@/lib/sdk/rate-limit';

export async function ensureAllSchemas(): Promise<void> {
  await ensureSchema();
  await ensureSdkSchema();
}

/** Apply rate limit; returns error response or null if allowed. */
export function checkRateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowMs: number,
  id?: string
) {
  const retryAfter = rateLimit(rateLimitKey(req, scope, id), limit, windowMs);
  if (retryAfter === null) return null;
  return apiErr(
    'RATE_LIMITED',
    `Too many requests. Retry in ${retryAfter}s.`,
    429
  );
}

export { apiOk, apiErr } from '@/lib/sdk/response';
