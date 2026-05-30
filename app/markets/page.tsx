'use client';

import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { type Category } from '@/lib/data';
import { MarketCard } from '@/components/sections/FeaturedMarkets';
import { useMarkets } from '@/lib/use-markets';

const CATEGORIES: Array<Category | 'All'> = [
  'All', 'Football', 'Basketball', 'UFC', 'Tennis', 'Esports', 'Crypto'
];

type Sort = 'volume' | 'closing' | 'trending';

export default function MarketsPage() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category | 'All'>('All');
  const [sort, setSort] = useState<Sort>('volume');
  const { markets, isLoading } = useMarkets();

  const filtered = useMemo(() => {
    let list = markets.slice();
    if (cat !== 'All') list = list.filter((m) => m.category === cat);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(t) || m.subtitle.toLowerCase().includes(t));
    }
    if (sort === 'volume')   list.sort((a, b) => b.volume - a.volume);
    if (sort === 'closing')  list.sort((a, b) => +new Date(a.closesAt) - +new Date(b.closesAt));
    if (sort === 'trending') list.sort((a, b) => Number(!!b.trending) - Number(!!a.trending) || b.volume - a.volume);
    return list;
  }, [markets, q, cat, sort]);

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-12))' }}>
      <div className="container">
        {/* Header */}
        <div className="stack-3" style={{ marginBottom: 'var(--s-8)' }}>
          <span className="eyebrow">Markets</span>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}>Browse the arena.</h1>
            <span className="badge badge-neutral">
              {filtered.length} {filtered.length === 1 ? 'market' : 'markets'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div
          className="card"
          style={{
            padding: 'var(--s-4)',
            marginBottom: 'var(--s-8)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 'var(--s-4)',
            alignItems: 'center'
          }}
        >
          <div className="row gap-3" style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}
            />
            <input
              className="input"
              placeholder="Search markets: teams, players, events…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>
          <div className="row gap-2">
            <SortControl sort={sort} setSort={setSort} />
          </div>
        </div>

        {/* Category chips */}
        <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 'var(--s-8)' }}>
          {CATEGORIES.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="btn btn-sm"
                style={{
                  borderRadius: 'var(--r-pill)',
                  background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? 'var(--accent-ring)' : 'var(--border-strong)'}`,
                  color: active ? 'var(--accent-bright)' : 'var(--text-dim)',
                  fontWeight: 500
                }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <LoadingGrid />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 'var(--s-6)'
            }}
            className="mkts-grid"
          >
            {filtered.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) { .mkts-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
        @media (max-width: 680px)  { .mkts-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function SortControl({ sort, setSort }: { sort: Sort; setSort: (s: Sort) => void }) {
  const opts: { v: Sort; label: string }[] = [
    { v: 'volume',   label: 'Top volume' },
    { v: 'closing',  label: 'Closing soon' },
    { v: 'trending', label: 'Trending' }
  ];
  return (
    <div className="row gap-1">
      <SlidersHorizontal size={14} color="var(--text-muted)" style={{ marginRight: 4 }} />
      {opts.map((o) => {
        const active = sort === o.v;
        return (
          <button
            key={o.v}
            onClick={() => setSort(o.v)}
            className="btn-sm"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--r-sm)',
              fontSize: 13,
              color: active ? 'var(--accent-bright)' : 'var(--text-dim)',
              background: active ? 'var(--accent-soft)' : 'transparent',
              border: `1px solid ${active ? 'var(--accent-ring)' : 'transparent'}`,
              transition: 'all 160ms ease'
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card" style={{ padding: 'var(--s-16) var(--s-6)', textAlign: 'center' }}>
      <div
        style={{
          width: 56,
          height: 56,
          margin: '0 auto var(--s-4)',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-ring)'
        }}
      >
        <Search size={22} color="var(--accent-bright)" />
      </div>
      <h3 style={{ fontSize: 20, marginBottom: 6 }}>No markets match that filter.</h3>
      <p style={{ color: 'var(--text-muted)', margin: '0 auto', maxWidth: 360 }}>
        Try a different category, clear your search, or check back in a few minutes. The curator
        agent posts new markets continuously.
      </p>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 'var(--s-6)'
      }}
      className="mkts-grid"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            padding: 'var(--s-5)',
            height: 220,
            background: 'rgba(255,255,255,0.02)',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        >
          <div style={{ height: 14, width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 12 }} />
          <div style={{ height: 20, width: '90%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 20, width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
        </div>
      ))}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
      `}</style>
    </div>
  );
}
