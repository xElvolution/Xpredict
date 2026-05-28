'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import type { Category } from '@/lib/data';

const CATEGORIES: Category[] = ['Football', 'Basketball', 'UFC', 'Tennis', 'Esports', 'Crypto'];

export default function CreateMarketPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<Category>('Football');
  const [closesAt, setClosesAt] = useState('');
  const [liquidity, setLiquidity] = useState(1000);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subtitle.trim() || !closesAt) return;

    setSubmitting(true);

    // TODO: Replace with actual contract call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Mock success: redirect to markets
    router.push('/markets');
  };

  const canSubmit = title.trim() && subtitle.trim() && closesAt && liquidity > 0;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--s-20)', paddingBottom: 'var(--s-12)' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 'var(--s-8)' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--r-lg)',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-ring)',
              color: 'var(--accent-bright)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--s-4)'
            }}
          >
            <Sparkles size={20} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--s-2)' }}>
            Create market
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Propose a new prediction market. Once submitted, the pricing agent will initialize liquidity and open trading.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="stack-6">
          <div className="card" style={{ padding: 'var(--s-6)' }}>
            <div className="stack-5">
              <div className="stack-2">
                <label className="label">Market question</label>
                <input
                  className="input"
                  placeholder="Will Argentina win FIFA World Cup 2026?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  required
                />
                <div style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'right' }}>
                  {title.length}/120
                </div>
              </div>

              <div className="stack-2">
                <label className="label">Resolution criteria</label>
                <input
                  className="input"
                  placeholder="Resolves on final whistle of the tournament final"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  maxLength={100}
                  required
                />
                <div style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'right' }}>
                  {subtitle.length}/100
                </div>
              </div>

              <div className="stack-2">
                <label className="label">Category</label>
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={category === cat ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}
                      style={{ minWidth: 100 }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="stack-2">
                <label className="label" htmlFor="closes-at">
                  <Calendar size={14} style={{ marginRight: 6 }} />
                  Market closes at
                </label>
                <input
                  id="closes-at"
                  type="datetime-local"
                  className="input input-mono"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  style={{ fontSize: 14 }}
                />
              </div>

              <div className="stack-2">
                <label className="label" htmlFor="liquidity">
                  <TrendingUp size={14} style={{ marginRight: 6 }} />
                  Initial liquidity (USDC)
                </label>
                <input
                  id="liquidity"
                  type="number"
                  className="input input-mono"
                  value={liquidity}
                  onChange={(e) => setLiquidity(Math.max(0, parseFloat(e.target.value) || 0))}
                  min={100}
                  step={100}
                  required
                  style={{ fontSize: 16, fontWeight: 600 }}
                />
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Minimum 100 USDC. Higher liquidity reduces slippage for early traders.
                </div>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: 'var(--s-5)',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-ring)'
            }}
          >
            <div className="row gap-3">
              <Sparkles size={16} color="var(--accent-bright)" />
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text)', fontWeight: 600 }}>AI agent review:</strong> Your market will be reviewed by @curator agents for clarity and resolvability before going live. Estimated approval time: ~2 minutes.
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', height: 56, fontSize: 16 }}
          >
            {submitting ? (
              <>Creating market...</>
            ) : (
              <>
                Create market · {liquidity.toLocaleString()} USDC
                <ChevronRight size={16} />
              </>
            )}
          </button>

          <div style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
            By creating a market, you agree that the resolution criteria are objective and verifiable.
          </div>
        </form>
      </div>
    </div>
  );
}
