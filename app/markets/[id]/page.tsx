import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Shield, Clock, Activity, Users, Wallet } from 'lucide-react';
import { MARKETS, FEED } from '@/lib/data';
import { formatUSD, formatNumber, timeUntil, timeAgo } from '@/lib/format';
import { TradePanel } from '@/components/market/TradePanel';
import { ProbChart } from '@/components/market/ProbChart';

export function generateStaticParams() {
  return MARKETS.map((m) => ({ id: m.id }));
}

export default async function MarketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const market = MARKETS.find((m) => m.id === id);
  if (!market) notFound();

  const yes = market.outcomes[0];
  const no  = market.outcomes[1];
  const yesPct = Math.round(yes.probability * 100);
  const noPct  = 100 - yesPct;

  const relatedFeed = FEED.filter((e) => !e.marketId || e.marketId === market.id).slice(0, 8);

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        <Link
          href="/markets"
          className="row gap-2"
          style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 'var(--s-6)' }}
        >
          <ArrowLeft size={14} /> All markets
        </Link>

        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 380px',
            gap: 'var(--s-8)',
            alignItems: 'flex-start'
          }}
          className="md-grid"
        >
          {/* LEFT */}
          <div className="stack-6">
            <div>
              <div className="row gap-2" style={{ marginBottom: 'var(--s-3)', flexWrap: 'wrap' }}>
                <span className="badge badge-accent">{market.category}</span>
                {market.trending && <span className="badge badge-warning">Trending</span>}
                <span className="badge badge-neutral">
                  <Clock size={11} /> Closes in {timeUntil(market.closesAt)}
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.15 }}>
                {market.title}
              </h1>
              <p style={{ marginTop: 12, color: 'var(--text-dim)' }}>{market.subtitle}</p>
            </div>

            {/* Probability summary */}
            <div className="card">
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--s-6)' }}>
                <div className="stack-2">
                  <span
                    className="mono"
                    style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
                  >
                    Implied probability
                  </span>
                  <div className="row gap-4">
                    <Prob label="Yes" pct={yesPct} side="yes" />
                    <Prob label="No"  pct={noPct}  side="no"  />
                  </div>
                </div>
                <div className="row gap-2">
                  <span className="badge badge-positive badge-live">Live pricing</span>
                </div>
              </div>

              <ProbChart yesProbability={yes.probability} />
            </div>

            {/* Meta grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 0,
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                overflow: 'hidden'
              }}
              className="meta-grid"
            >
              <MetaCell k="Volume"    v={formatUSD(market.volume)}    Icon={Activity} />
              <MetaCell k="Liquidity" v={formatUSD(market.liquidity)} Icon={Wallet}   border />
              <MetaCell k="Traders"   v={formatNumber(market.traders)} Icon={Users}    border />
              <MetaCell k="Created"   v={market.agent}                Icon={Shield}   border mono />
            </div>

            {/* Resolution + sources */}
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 'var(--s-3)' }}>Resolution criteria</h3>
              <p style={{ color: 'var(--text-dim)', marginBottom: 'var(--s-4)' }}>
                This market settles automatically by the <span className="mono" style={{ color: 'var(--text)' }}>@resolver.chronos</span> agent
                once the underlying event has officially concluded. The agent cross-references the
                three independent data sources below; resolution requires a 2-of-3 consensus.
              </p>
              <div className="stack-3">
                <Source name="Sportradar Live API" url="#" tag="primary"   />
                <Source name="Opta Sports Data"    url="#" tag="primary"   />
                <Source name="Official tournament feed" url="#" tag="fallback" />
              </div>
            </div>

            {/* Activity */}
            <div className="card" style={{ padding: 0 }}>
              <div
                className="row"
                style={{
                  justifyContent: 'space-between',
                  padding: 'var(--s-4) var(--s-6)',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <h3 style={{ fontSize: 15 }}>Recent activity</h3>
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {relatedFeed.length} events
                </span>
              </div>
              <div>
                {relatedFeed.map((e) => (
                  <div
                    key={e.id}
                    className="feed-row"
                    data-kind={e.kind}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span className="feed-time">{timeAgo(e.at)}</span>
                    <span>
                      <span style={{ color: 'var(--text-muted)' }}>{e.who}</span>{'  '}
                      <span style={{ color: 'var(--text)' }}>{e.text}</span>
                    </span>
                    <span className="mono" style={{ color: 'var(--text)', fontWeight: 600 }}>
                      {e.amount ? formatUSD(e.amount) : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: trade panel sticky */}
          <aside style={{ position: 'sticky', top: 'calc(var(--nav-h) + var(--s-6))' }}>
            <TradePanel
              yesPct={yesPct}
              noPct={noPct}
              marketTitle={market.title}
              marketId={market.id}
              category={market.category}
            />
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .md-grid { grid-template-columns: 1fr !important; }
          aside    { position: static !important; }
        }
        @media (max-width: 640px) {
          .meta-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
          .meta-grid > div:nth-child(3) { border-top: 1px solid var(--border); border-left: none !important; }
          .meta-grid > div:nth-child(4) { border-top: 1px solid var(--border); }
        }
      `}</style>
    </section>
  );
}

function Prob({ label, pct, side }: { label: string; pct: number; side: 'yes' | 'no' }) {
  return (
    <div className="stack-2">
      <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: side === 'yes' ? 'var(--positive)' : 'var(--negative)',
          fontFamily: 'var(--font-mono)'
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

function MetaCell({
  k, v, Icon, border, mono
}: { k: string; v: string; Icon: React.ComponentType<{ size?: number; color?: string }>; border?: boolean; mono?: boolean }) {
  return (
    <div
      style={{
        padding: 'var(--s-5)',
        borderLeft: border ? '1px solid var(--border)' : 'none',
        background: 'var(--card)'
      }}
    >
      <div className="row gap-2" style={{ color: 'var(--text-muted)', marginBottom: 6 }}>
        <Icon size={13} color="var(--text-muted)" />
        <span
          className="mono"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          {k}
        </span>
      </div>
      <div
        className={mono ? 'mono' : undefined}
        style={{ fontSize: mono ? 14 : 18, fontWeight: 600, letterSpacing: '-0.015em' }}
      >
        {v}
      </div>
    </div>
  );
}

function Source({ name, url, tag }: { name: string; url: string; tag: 'primary' | 'fallback' }) {
  return (
    <div
      className="row"
      style={{
        justifyContent: 'space-between',
        padding: 'var(--s-3) var(--s-4)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)'
      }}
    >
      <div className="row gap-3">
        <Shield size={14} color={tag === 'primary' ? 'var(--positive)' : 'var(--text-muted)'} />
        <span style={{ fontSize: 14 }}>{name}</span>
      </div>
      <div className="row gap-3">
        <span className={`badge ${tag === 'primary' ? 'badge-positive' : 'badge-neutral'}`}>{tag}</span>
        <a href={url} className="row gap-1" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
