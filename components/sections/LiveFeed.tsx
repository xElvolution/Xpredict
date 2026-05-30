'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useLiveEvents, type LiveEvent } from '@/lib/use-live-events';
import { formatUSD, timeAgo } from '@/lib/format';

const KIND_LABEL: Record<LiveEvent['kind'], string> = {
  bet:     'BET',
  resolve: 'SETTLE',
  create:  'CREATE'
};

export function LiveFeed() {
  const events = useLiveEvents();

  return (
    <section className="section">
      <div className="container">
        <div
          className="row"
          style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 'var(--s-6)' }}
        >
          <div className="stack-3">
            <span className="eyebrow">Live activity</span>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }}>The arena, in real time.</h2>
          </div>
          <span className="badge badge-positive badge-live">Streaming · X Layer</span>
        </div>

        <div className="feed">
          <div
            className="row"
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              justifyContent: 'space-between'
            }}
          >
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em' }}>
              TIME · ACTOR · EVENT
            </span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              {events.length} events · auto-refresh
            </span>
          </div>

          <AnimatePresence initial={false}>
            {events.map((e) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
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
                    <span style={{ color: 'var(--text-muted)' }}>{e.who}</span>
                    {'  '}
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

function kindColor(k: LiveEvent['kind']): string {
  switch (k) {
    case 'bet':     return '#8B5CF6';
    case 'resolve': return '#00FF87';
    case 'create':  return '#FFB020';
  }
}
