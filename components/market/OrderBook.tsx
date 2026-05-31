'use client';

import { useEffect, useState } from 'react';
import { formatUSD } from '@/lib/format';
import { fetchOrderBook, type BookLevel } from '@/lib/platform/client';

export function OrderBook({
  marketId,
  side,
  midPrice
}: {
  marketId: string;
  side: 'yes' | 'no';
  midPrice: number;
}) {
  const [bids, setBids] = useState<BookLevel[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchOrderBook(marketId, side)
        .then((d) => {
          if (!cancelled) setBids(d.orderBook.bids);
        })
        .catch(() => {
          if (!cancelled) setBids([]);
        });
    load();
    const t = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [marketId, side]);

  const maxQty = Math.max(...bids.map((b) => b.quantity), 1);

  return (
    <div className="stack-3">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="label">Order book · {side.toUpperCase()}</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Mid {Math.round(midPrice * 100)}¢
        </span>
      </div>
      {bids.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: 'var(--s-4) 0' }}>
          No limit orders yet. Be the first to post one.
        </p>
      ) : (
        <div className="stack-2">
          {bids.map((b) => (
            <div key={b.price} className="row gap-3" style={{ fontSize: 13 }}>
              <span className="mono" style={{ width: 48, color: 'var(--positive)' }}>
                {Math.round(b.price * 100)}¢
              </span>
              <div style={{ flex: 1, height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(b.quantity / maxQty) * 100}%`,
                    height: '100%',
                    background: 'var(--positive-soft)',
                    borderRadius: 4
                  }}
                />
              </div>
              <span className="mono" style={{ width: 72, textAlign: 'right', color: 'var(--text-dim)' }}>
                {formatUSD(b.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
