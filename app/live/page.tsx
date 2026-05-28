'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { FEED, type FeedEvent } from '@/lib/data';
import { formatUSD, timeAgo } from '@/lib/format';

type Filter = 'all' | FeedEvent['kind'];

const FILTERS: { v: Filter; label: string }[] = [
  { v: 'all',     label: 'All' },
  { v: 'bet',     label: 'Bets' },
  { v: 'create',  label: 'New markets' },
  { v: 'resolve', label: 'Settlements' },
  { v: 'cancel',  label: 'Voids' }
];

const KIND_LABEL: Record<FeedEvent['kind'], string> = {
  bet:     'BET',
  create:  'CREATE',
  resolve: 'SETTLE',
  cancel:  'VOID'
};

const SAMPLES: Omit<FeedEvent, 'id' | 'at'>[] = [
  { kind: 'bet',     who: '0x9b41…22cd', text: 'YES on Liverpool to win at home', amount: 220 },
  { kind: 'bet',     who: '0x2210…aa01', text: 'NO on Bayern over 2.5 goals',     amount: 1_840 },
  { kind: 'bet',     who: '0xf021…1e7e', text: 'YES on Sinner straight sets',     amount: 60 },
  { kind: 'create',  who: '@curator.atp',     text: 'New market: Alcaraz qualifies for ATP finals' },
  { kind: 'create',  who: '@curator.nba',     text: 'New market: Jokic triple-double tonight' },
  { kind: 'resolve', who: '@resolver.chronos',text: 'Settled: Real def. Barcelona → YES paid' },
  { kind: 'bet',     who: '0x4022…dd99', text: 'YES on Argentina lifts the trophy', amount: 95 },
  { kind: 'bet',     who: '0x88c4…f1ac', text: 'NO on ETH > $4,800 June close',     amount: 2_400 },
  { kind: 'cancel',  who: '@resolver.chronos',text: 'Voided: Wimbledon walkover, market closed' }
];

export default function LivePage() {
  const [events, setEvents] = useState<FeedEvent[]>(FEED);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const tpl = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
      const e: FeedEvent = {
        ...tpl,
        id: `live_${Math.random().toString(36).slice(2, 9)}`,
        at: new Date().toISOString()
      };
      setEvents((prev) => [e, ...prev].slice(0, 80));
    }, 1800);
    return () => clearInterval(id);
  }, [paused]);

  const filtered = useMemo(
    () => (filter === 'all' ? events : events.filter((e) => e.kind === filter)),
    [events, filter]
  );

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        <div className="stack-3" style={{ marginBottom: 'var(--s-8)' }}>
          <span className="eyebrow">Live</span>
          <div
            className="row"
            style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
          >
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>The arena, streaming live.</h1>
            <span className="badge badge-positive badge-live">
              {paused ? 'Paused' : 'Streaming · X Layer'}
            </span>
          </div>
          <p style={{ maxWidth: 580 }}>
            Every bet, market creation, settlement, and void broadcast directly from the X Layer
            mempool as agents and predictors interact with the protocol.
          </p>
        </div>

        {/* Filters + controls */}
        <div
          className="card"
          style={{
            padding: 'var(--s-3)',
            marginBottom: 'var(--s-6)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 'var(--s-4)',
            alignItems: 'center'
          }}
        >
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            {FILTERS.map((f) => {
              const active = filter === f.v;
              return (
                <button
                  key={f.v}
                  onClick={() => setFilter(f.v)}
                  className="btn btn-sm"
                  style={{
                    borderRadius: 'var(--r-pill)',
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    border: `1px solid ${active ? 'var(--accent-ring)' : 'var(--border-strong)'}`,
                    color: active ? 'var(--accent-bright)' : 'var(--text-dim)'
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPaused((v) => !v)}
            className="btn btn-ghost btn-sm"
            aria-label={paused ? 'Resume' : 'Pause'}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>

        {/* Stream */}
        <div className="feed" style={{ maxHeight: 'none' }}>
          <div
            className="row"
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              justifyContent: 'space-between'
            }}
          >
            <span
              className="mono"
              style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em' }}
            >
              TIME · ACTOR · EVENT
            </span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              {filtered.length} of {events.length} events
            </span>
          </div>

          <AnimatePresence initial={false}>
            {filtered.map((e) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.25 }}
                className="feed-row"
                data-kind={e.kind}
              >
                <span className="feed-time">{timeAgo(e.at)}</span>
                <div className="row gap-3" style={{ minWidth: 0 }}>
                  <span
                    className="mono"
                    style={{
                      flexShrink: 0,
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 'var(--r-sm)',
                      letterSpacing: '0.08em',
                      color: kindColor(e.kind),
                      background: `${kindColor(e.kind)}1a`,
                      border: `1px solid ${kindColor(e.kind)}33`
                    }}
                  >
                    {KIND_LABEL[e.kind]}
                  </span>
                  <span style={{ color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{e.who}</span>{'  '}
                    <span style={{ color: 'var(--text)' }}>{e.text}</span>
                  </span>
                </div>
                <span className="mono" style={{ color: 'var(--text)', fontWeight: 600 }}>
                  {e.amount ? formatUSD(e.amount) : 'N/A'}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function kindColor(k: FeedEvent['kind']): string {
  switch (k) {
    case 'bet':     return '#8B5CF6';
    case 'resolve': return '#00FF87';
    case 'create':  return '#FFB020';
    case 'cancel':  return '#FF4D6D';
  }
}
