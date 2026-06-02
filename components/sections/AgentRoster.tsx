'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { AGENTS } from '@/lib/data';
import { formatNumber, formatUSD, formatPct } from '@/lib/format';

const ROLE_META: Record<string, { hue: string; soft: string; description: string }> = {
  Curator:  { hue: 'var(--accent-bright)',  soft: 'var(--accent-soft)',   description: 'Drafts new prediction markets from live fixture feeds.' },
  Pricing:  { hue: '#5EEAD4',               soft: 'rgba(94,234,212,0.10)',description: 'Continuously rebalances odds with an LMSR engine.' },
  Resolver: { hue: 'var(--positive)',       soft: 'var(--positive-soft)', description: 'Verifies outcomes across data sources and settles contracts.' },
  Coach:    { hue: 'var(--warning)',        soft: 'var(--warning-soft)',  description: 'Shares stats and context, never directs your pick.' }
};

type Agent = (typeof AGENTS)[number];

export function AgentRoster() {
  return (
    <section className="section">
      <div className="container">
        <div className="stack-3" style={{ textAlign: 'center', alignItems: 'center', marginBottom: 'var(--s-12)' }}>
          <span className="eyebrow">The agent stack</span>
          <h2 style={{ maxWidth: 760 }}>Four autonomous roles. One open marketplace.</h2>
          <p style={{ textAlign: 'center', maxWidth: 560 }}>
            Every market on XPredict passes through four specialized agents.
            They run 24/7, transparently, and anyone can extend them.
          </p>
        </div>

        {/* Desktop / tablet grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12, margin: '-40px 0px' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } }
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 'var(--s-4)'
          }}
          className="agent-grid"
        >
          {AGENTS.map((a) => (
            <motion.div
              key={a.handle}
              variants={{
                hidden: { opacity: 0, y: 28, scale: 0.96 },
                show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
              }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <AgentCard a={a} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile carousel */}
        <AgentCarousel />
      </div>

      <style>{`
        .agent-carousel { display: none; }
        @media (max-width: 1024px) { .agent-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
        @media (max-width: 768px)  {
          .agent-grid { display: none !important; }
          .agent-carousel { display: block !important; }
        }
      `}</style>
    </section>
  );
}

/* -------------------- Mobile carousel -------------------- */

function AgentCarousel() {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setIdx((i) => (i + 1) % AGENTS.length);
    }, 3500);
    return () => clearInterval(id);
  }, [paused]);

  const go = (next: number) => {
    setDirection(next > idx ? 1 : -1);
    setIdx((next + AGENTS.length) % AGENTS.length);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 60;
    if (info.offset.x < -threshold) go(idx + 1);
    else if (info.offset.x > threshold) go(idx - 1);
  };

  const a = AGENTS[idx];

  return (
    <div
      className="agent-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-lg)' }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={a.handle}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            style={{ touchAction: 'pan-y' }}
          >
            <AgentCard a={a} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div
        className="row gap-2"
        style={{ justifyContent: 'center', marginTop: 'var(--s-5)' }}
      >
        {AGENTS.map((agent, i) => (
          <button
            key={agent.handle}
            onClick={() => go(i)}
            aria-label={`Show ${agent.name}`}
            style={{
              width: i === idx ? 22 : 6,
              height: 6,
              borderRadius: 99,
              background: i === idx ? 'var(--accent-bright)' : 'var(--border-strong)',
              boxShadow: i === idx ? '0 0 10px var(--accent-bright)' : 'none',
              transition: 'width 280ms ease, background 280ms ease',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------- Card -------------------- */

function AgentCard({ a }: { a: Agent }) {
  const meta = ROLE_META[a.role];
  return (
    <div className="card" style={{ borderColor: 'var(--border)' }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--s-5)' }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--r-md)',
            background: meta.soft,
            border: `1px solid ${meta.hue}33`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: meta.hue,
            fontWeight: 700,
            fontSize: 13,
            fontFamily: 'var(--font-mono)'
          }}
        >
          {a.role[0]}
        </div>
        <span className="badge badge-positive badge-live">{a.status}</span>
      </div>

      <div
        className="mono"
        style={{ fontSize: 11, color: meta.hue, letterSpacing: '0.14em', textTransform: 'uppercase' }}
      >
        {a.role}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>
        {a.name}
      </div>
      <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
        {a.handle}
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 'var(--s-4)' }}>
        {meta.description}
      </p>

      <div
        className="row"
        style={{
          justifyContent: 'space-between',
          marginTop: 'var(--s-6)',
          paddingTop: 'var(--s-4)',
          borderTop: '1px solid var(--border)'
        }}
      >
        {a.role === 'Curator' && (
          <Stat k="Markets" v={formatNumber(a.marketsCreated)} />
        )}
        {a.role !== 'Curator' && a.accuracy > 0 && (
          <Stat k="Accuracy" v={formatPct(a.accuracy, 1)} />
        )}
        <Stat k="Routed" v={formatUSD(a.volumeRouted)} />
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="stack-2">
      <span
        className="mono"
        style={{ fontSize: 10, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        {k}
      </span>
      <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
        {v}
      </span>
    </div>
  );
}
