'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Flame, Users, Loader2 } from 'lucide-react';
import { type Market } from '@/lib/data';
import { useMarkets } from '@/lib/use-markets';
import { formatUSD, formatNumber, timeUntil } from '@/lib/format';
import { SlipAddButton } from '@/components/slip/SlipAddButton';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } })
};

export function FeaturedMarkets() {
  const { markets, isLoading } = useMarkets();
  // Sort by liquidity (proxy for activity) then take top 6
  const featured = markets
    .filter((m) => !m.resolved)
    .sort((a, b) => b.liquidity - a.liquidity)
    .slice(0, 6);

  return (
    <section className="section">
      <div className="container">
        <div
          className="row"
          style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--s-8)', flexWrap: 'wrap', gap: 16 }}
        >
          <div className="stack-3">
            <span className="eyebrow">Live markets</span>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }}>What the arena is predicting</h2>
          </div>
          <Link href="/markets" className="btn btn-ghost btn-sm">
            View all markets
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div
            style={{
              padding: 'var(--s-10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--s-3)',
              color: 'var(--text-muted)', fontSize: 13
            }}
          >
            <Loader2 size={16} className="spin" />
            Loading markets from X Layer…
          </div>
        ) : featured.length === 0 ? (
          <div
            style={{
              padding: 'var(--s-10)',
              textAlign: 'center',
              color: 'var(--text-muted)', fontSize: 14
            }}
          >
            No live markets yet — the Curator agent is drafting some now. Check back in a few minutes.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 'var(--s-6)'
            }}
            className="markets-grid"
          >
            {featured.map((m, i) => (
              <motion.div
                key={m.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
              >
                <MarketCard market={m} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) { .markets-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 680px)  { .markets-grid { grid-template-columns: 1fr !important; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}

export function MarketCard({ market }: { market: Market }) {
  const yes = market.outcomes[0];
  const no  = market.outcomes[1];
  const yesPct = Math.round(yes.probability * 100);
  const noPct  = 100 - yesPct;

  return (
    <article className="card card-glow" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--s-4)' }}>
        <span className="badge badge-accent">{market.category}</span>
        {market.trending && (
          <span className="badge badge-warning">
            <Flame size={11} /> Trending
          </span>
        )}
      </div>

      <Link
        href={`/markets/${market.id}`}
        style={{ color: 'inherit', display: 'block' }}
      >
        <h3
          style={{
            fontSize: 18,
            lineHeight: 1.3,
            letterSpacing: '-0.015em',
            marginBottom: 'var(--s-2)',
            minHeight: 46
          }}
        >
          {market.title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--s-5)' }}>
          {market.subtitle}
        </p>

        <div className="stack-3" style={{ marginBottom: 'var(--s-5)' }}>
          <Row label="Yes" pct={yesPct} side="yes" />
          <Row label="No"  pct={noPct}  side="no"  />
        </div>
      </Link>

      {/* Slip controls */}
      <div className="row gap-2" style={{ marginBottom: 'var(--s-4)' }}>
        <SlipAddButton
          full
          leg={{
            id: market.id,
            marketId: market.id,
            title: market.title,
            category: market.category,
            side: 'yes',
            probability: yes.probability
          }}
        />
        <SlipAddButton
          full
          leg={{
            id: market.id,
            marketId: market.id,
            title: market.title,
            category: market.category,
            side: 'no',
            probability: no.probability
          }}
        />
      </div>

      <div
        className="row"
        style={{
          justifyContent: 'space-between',
          paddingTop: 'var(--s-4)',
          borderTop: '1px solid var(--border)',
          marginTop: 'auto'
        }}
      >
        <div className="row gap-4">
          <Meta k="Volume" v={formatUSD(market.volume)} />
          <Meta k="Closes" v={timeUntil(market.closesAt)} />
        </div>
        <div className="row gap-1" style={{ color: 'var(--text-muted)' }}>
          <Users size={12} />
          <span className="mono" style={{ fontSize: 12 }}>{formatNumber(market.traders)}</span>
        </div>
      </div>
    </article>
  );
}

function Row({ label, pct, side }: { label: string; pct: number; side: 'yes' | 'no' }) {
  return (
    <div className="stack-2">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--text)' }}>{label}</span>
        <span
          className="mono"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: side === 'yes' ? 'var(--positive)' : 'var(--negative)'
          }}
        >
          {pct}%
        </span>
      </div>
      <div className="bar">
        <div className={`bar-fill ${side}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="stack-2">
      <span
        className="mono"
        style={{ fontSize: 10, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        {k}
      </span>
      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
        {v}
      </span>
    </div>
  );
}
