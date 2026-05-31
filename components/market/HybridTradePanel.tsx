'use client';

import { useState } from 'react';
import { TradePanel } from './TradePanel';
import { LimitOrderPanel } from './LimitOrderPanel';
import { OrderBook } from './OrderBook';

type Mode = 'amm' | 'limit' | 'book';

export function HybridTradePanel({
  yesPct,
  noPct,
  marketTitle,
  marketId,
  category,
  marketAddress,
  resolved
}: {
  yesPct: number;
  noPct: number;
  marketTitle: string;
  marketId?: string;
  category?: string;
  marketAddress?: `0x${string}`;
  resolved?: boolean;
}) {
  const [mode, setMode] = useState<Mode>('amm');
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const midPrice = (side === 'yes' ? yesPct : noPct) / 100;

  return (
    <div className="stack-4">
      <div
        className="row gap-1"
        style={{
          padding: 4,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)'
        }}
      >
        {(['amm', 'limit', 'book'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="btn btn-sm"
            style={{
              flex: 1,
              background: mode === m ? 'var(--accent-soft)' : 'transparent',
              border: `1px solid ${mode === m ? 'var(--accent-ring)' : 'transparent'}`,
              color: mode === m ? 'var(--accent-bright)' : 'var(--text-muted)',
              textTransform: 'uppercase',
              fontSize: 11,
              letterSpacing: '0.08em'
            }}
          >
            {m === 'amm' ? 'Instant' : m === 'limit' ? 'Limit' : 'Book'}
          </button>
        ))}
      </div>

      {(mode === 'limit' || mode === 'book') && (
        <div className="row gap-2">
          {(['yes', 'no'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className="btn btn-sm"
              style={{
                flex: 1,
                background: side === s ? (s === 'yes' ? 'var(--positive-soft)' : 'var(--negative-soft)') : 'transparent',
                border: `1px solid ${side === s ? (s === 'yes' ? 'var(--positive)' : 'var(--negative)') + '55' : 'var(--border)'}`,
                color: side === s ? (s === 'yes' ? 'var(--positive)' : 'var(--negative)') : 'var(--text-muted)'
              }}
            >
              {s.toUpperCase()} · {s === 'yes' ? yesPct : noPct}¢
            </button>
          ))}
        </div>
      )}

      {mode === 'amm' && (
        <TradePanel
          yesPct={yesPct}
          noPct={noPct}
          marketTitle={marketTitle}
          marketId={marketId}
          category={category}
          marketAddress={marketAddress}
          resolved={resolved}
        />
      )}

      {mode === 'limit' && marketId && (
        <div className="card card-glow" style={{ padding: 'var(--s-5)' }}>
          <LimitOrderPanel
            marketId={marketId}
            marketTitle={marketTitle}
            category={category ?? 'Football'}
            side={side}
            midPrice={midPrice}
          />
        </div>
      )}

      {mode === 'book' && marketId && (
        <div className="card" style={{ padding: 'var(--s-5)' }}>
          <OrderBook marketId={marketId} side={side} midPrice={midPrice} />
        </div>
      )}
    </div>
  );
}
