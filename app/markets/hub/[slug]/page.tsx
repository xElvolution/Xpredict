'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import { MarketCard } from '@/components/sections/FeaturedMarkets';
import { useMarkets } from '@/lib/use-markets';

const HUBS: Record<string, { title: string; subtitle: string; filter: (m: { title: string; subtitle: string; category: string }) => boolean }> = {
  football: {
    title: 'Football',
    subtitle: 'Leagues, cups, and international fixtures — including UCL and World Cup build-up.',
    filter: (m) => m.category === 'Football'
  },
  'world-cup': {
    title: 'FIFA World Cup 2026',
    subtitle: '11 June – 19 July 2026 · USA, Canada, Mexico. Dedicated markets as the tournament approaches.',
    filter: (m) => /world cup|fifa/i.test(m.title + m.subtitle)
  },
  basketball: { title: 'Basketball', subtitle: 'NBA, playoffs, and season-long futures.', filter: (m) => m.category === 'Basketball' },
  ufc: { title: 'UFC', subtitle: 'Fight nights, title bouts, and card outcomes.', filter: (m) => m.category === 'UFC' },
  tennis: { title: 'Tennis', subtitle: 'Grand Slams and tour events.', filter: (m) => m.category === 'Tennis' },
  esports: { title: 'Esports', subtitle: 'Major brackets and championship markets.', filter: (m) => m.category === 'Esports' },
  crypto: { title: 'Crypto', subtitle: 'Macro and token price milestones.', filter: (m) => m.category === 'Crypto' }
};

export default function CategoryHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const hub = HUBS[slug];
  const { markets, isLoading } = useMarkets();

  const filtered = useMemo(() => {
    if (!hub) return [];
    return markets.filter(hub.filter).sort((a, b) => b.volume - a.volume);
  }, [markets, hub]);

  if (!hub) {
    return (
      <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
        <div className="container">
          <h1>Category not found</h1>
          <Link href="/markets">Back to markets</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        <Link href="/markets" className="row gap-2" style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 'var(--s-6)' }}>
          <ArrowLeft size={14} /> All markets
        </Link>
        <div className="stack-3" style={{ marginBottom: 'var(--s-8)' }}>
          <span className="eyebrow">Category hub</span>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>{hub.title}</h1>
          <p style={{ maxWidth: 560, color: 'var(--text-dim)' }}>{hub.subtitle}</p>
          <span className="badge badge-neutral">{filtered.length} markets</span>
        </div>

        {isLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading markets…</p>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 'var(--s-10)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 8 }}>No markets in this hub yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>The Curator agent drafts new markets every 30 minutes.</p>
            <Link href="/create" className="btn btn-primary">Propose a market</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--s-5)' }}>
            {filtered.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
