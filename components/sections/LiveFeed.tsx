'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FEED, type FeedEvent } from '@/lib/data';
import { formatUSD, timeAgo } from '@/lib/format';

const KIND_LABEL: Record<FeedEvent['kind'], string> = {
  bet:     'BET',
  resolve: 'SETTLE',
  create:  'CREATE',
  cancel:  'VOID'
};

const PLACEHOLDER_TEXTS = [
  'YES on Liverpool to win at home',
  'NO on Bayern over 2.5 goals',
  'YES on Sinner straight sets',
  'NO on Curry hits 4+ threes',
  'YES on McGregor TKO round 2',
  'NO on PSG cleansheet'
];

const RANDOM_ADDRS = [
  '0x9b41…22cd', '0x2210…aa01', '0xf021…1e7e', '0x5a3b…00b1',
  '0x88c4…f1ac', '0x4022…dd99'
];

export function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>(FEED);

  useEffect(() => {
    const id = setInterval(() => {
      const e: FeedEvent = {
        id: `f${Math.random().toString(36).slice(2, 9)}`,
        kind: 'bet',
        at: new Date().toISOString(),
        who: RANDOM_ADDRS[Math.floor(Math.random() * RANDOM_ADDRS.length)],
        text: PLACEHOLDER_TEXTS[Math.floor(Math.random() * PLACEHOLDER_TEXTS.length)],
        amount: Math.floor(20 + Math.random() * 2400)
      };
      setEvents((prev) => [e, ...prev].slice(0, 14));
    }, 3200);
    return () => clearInterval(id);
  }, []);

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

function kindColor(k: FeedEvent['kind']): string {
  switch (k) {
    case 'bet':     return '#8B5CF6';
    case 'resolve': return '#00FF87';
    case 'create':  return '#FFB020';
    case 'cancel':  return '#FF4D6D';
  }
}
