import type { SlipLeg } from '@/components/slip/SlipContext';

type EncodedSlip = {
  legs: Array<{ m: string; s: 'yes' | 'no'; p: number }>;
};

export async function encodeSlip(legs: SlipLeg[]): Promise<string> {
  const payload = {
    legs: legs.map((l) => ({ m: l.marketId, s: l.side, p: l.probability }))
  };

  const res = await fetch('/api/slip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Failed to create slip code');

  const data = await res.json();
  return data.code;
}

export async function decodeSlip(code: string): Promise<EncodedSlip | null> {
  try {
    const res = await fetch(`/api/slip?code=${encodeURIComponent(code)}`);
    if (!res.ok) return null;

    const data = await res.json();
    return { legs: data.legs };
  } catch {
    return null;
  }
}
