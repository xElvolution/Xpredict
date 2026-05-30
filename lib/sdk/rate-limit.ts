import { NextRequest } from 'next/server';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Sliding-window rate limit. Returns null if allowed, or retry-after seconds. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): number | null {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (bucket.count >= limit) {
    return Math.ceil((bucket.resetAt - now) / 1000);
  }

  bucket.count += 1;
  return null;
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export function rateLimitKey(req: NextRequest, scope: string, id?: string): string {
  return `${scope}:${id ?? clientIp(req)}`;
}
