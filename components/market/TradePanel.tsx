'use client';

import { useState } from 'react';
import { Sparkles, Wallet, Layers, Check } from 'lucide-react';
import { useSlip } from '@/components/slip/SlipContext';

export function TradePanel({
  yesPct,
  noPct,
  marketTitle,
  marketId,
  category
}: {
  yesPct: number;
  noPct: number;
  marketTitle: string;
  marketId?: string;
  category?: string;
}) {
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('25');
  const { addLeg, hasLeg } = useSlip();

  const pct = side === 'yes' ? yesPct : noPct;
  const odds = pct > 0 ? 100 / pct : 0;
  const numericAmount = Math.max(0, Number(amount) || 0);
  const potential = numericAmount * odds;
  const profit = Math.max(0, potential - numericAmount);
  const onSlip = marketId ? hasLeg(marketId, side) : false;

  return (
    <div className="card card-glow" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        className="row"
        style={{
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.02)'
        }}
      >
        <strong style={{ fontSize: 14, letterSpacing: '-0.01em' }}>Place prediction</strong>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em' }}>
          USDC · X LAYER
        </span>
      </div>

      <div style={{ padding: 'var(--s-5)' }} className="stack-5">
        {/* Side toggle */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            padding: 4,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)'
          }}
        >
          <SideButton
            label="Yes"
            pct={yesPct}
            active={side === 'yes'}
            tone="yes"
            onClick={() => setSide('yes')}
          />
          <SideButton
            label="No"
            pct={noPct}
            active={side === 'no'}
            tone="no"
            onClick={() => setSide('no')}
          />
        </div>

        {/* Amount input */}
        <div className="stack-2">
          <label
            className="mono"
            style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Stake
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className="input input-mono"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
              inputMode="decimal"
              style={{ paddingRight: 70, fontSize: 18, fontWeight: 600 }}
            />
            <span
              className="mono"
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 13,
                color: 'var(--text-muted)'
              }}
            >
              USDC
            </span>
          </div>
          <div className="row gap-2" style={{ marginTop: 4 }}>
            {['10', '25', '100', '500'].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className="btn btn-sm btn-ghost"
                style={{ flex: 1, height: 32, fontSize: 12, padding: '0 8px' }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: 'var(--s-4)'
          }}
          className="stack-3"
        >
          <Line k="Price"        v={`${pct}¢ / share`} />
          <Line k="Shares"       v={(numericAmount / Math.max(0.01, pct / 100)).toFixed(2)} mono />
          <Line k="Potential payout" v={`$${potential.toFixed(2)}`} highlight />
          <Line k="If correct"   v={`+$${profit.toFixed(2)}`} tone="positive" />
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', height: 52, fontSize: 15 }}
        >
          <Wallet size={16} />
          Predict {side === 'yes' ? 'Yes' : 'No'} · ${numericAmount.toFixed(2)}
        </button>

        {marketId && (
          <button
            className="btn btn-ghost"
            style={{ width: '100%' }}
            onClick={() =>
              addLeg({
                id: marketId,
                marketId,
                title: marketTitle,
                category: category ?? 'Market',
                side,
                probability: pct / 100
              })
            }
          >
            {onSlip ? <Check size={14} /> : <Layers size={14} />}
            {onSlip ? 'On slip · open drawer' : 'Add to parlay slip'}
          </button>
        )}

        <div
          className="row gap-2"
          style={{
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: 12,
            paddingTop: 4
          }}
        >
          <Sparkles size={12} color="var(--accent-bright)" />
          <span>Settled in &lt; 2s on X Layer · gas ≈ $0.001</span>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border)',
          padding: '10px 18px',
          background: 'var(--bg-elevated)'
        }}
      >
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em' }}>
          {truncate(marketTitle, 56)}
        </div>
      </div>
    </div>
  );
}

function SideButton({
  label, pct, active, tone, onClick
}: {
  label: string; pct: number; active: boolean; tone: 'yes' | 'no'; onClick: () => void;
}) {
  const color = tone === 'yes' ? 'var(--positive)' : 'var(--negative)';
  const soft  = tone === 'yes' ? 'var(--positive-soft)' : 'var(--negative-soft)';
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--r-sm)',
        background: active ? soft : 'transparent',
        border: `1px solid ${active ? color + '55' : 'transparent'}`,
        transition: 'all 180ms ease',
        textAlign: 'left'
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: active ? color : 'var(--text-muted)'
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: active ? color : 'var(--text-dim)',
          letterSpacing: '-0.02em',
          marginTop: 2
        }}
      >
        {pct}¢
      </div>
    </button>
  );
}

function Line({
  k, v, mono, highlight, tone
}: {
  k: string; v: string; mono?: boolean; highlight?: boolean; tone?: 'positive';
}) {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k}</span>
      <span
        className={mono || highlight ? 'mono' : undefined}
        style={{
          fontSize: highlight ? 15 : 13,
          fontWeight: highlight ? 700 : 500,
          color: tone === 'positive' ? 'var(--positive)' : 'var(--text)'
        }}
      >
        {v}
      </span>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
