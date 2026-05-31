'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Clock, Activity, Users, Wallet } from 'lucide-react';
import { formatUSD, formatNumber, timeUntil, timeAgo } from '@/lib/format';
import { HybridTradePanel } from '@/components/market/HybridTradePanel';
import { MarketInfoPanels } from '@/components/market/MarketInfoPanels';
import { ShareButton } from '@/components/ShareButton';
import { ProbChart } from '@/components/market/ProbChart';
import { useMarketState, toUiMarket } from '@/lib/markets-onchain';
import { useEffect, useState } from 'react';
import { useWatchContractEvent } from 'wagmi';
import { PREDICTION_MARKET_ABI, USDC_DECIMALS } from '@/lib/contracts';
import { formatUnits } from 'viem';

type MetaResult = { category?: string; subtitle?: string; agent_handle?: string; trending?: boolean };

export default function MarketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const address = id as `0x${string}`;
  const isValid = address.startsWith('0x') && address.length === 42;
  const { state, isLoading } = useMarketState(isValid ? address : undefined);

  const [meta, setMeta] = useState<MetaResult>({});

  useEffect(() => {
    if (!isValid) return;
    fetch('/api/markets-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: [address] })
    })
      .then((r) => r.json())
      .then((data) => setMeta(data.meta?.[address.toLowerCase()] ?? {}))
      .catch(() => setMeta({}));
  }, [address, isValid]);

  // Live activity from onchain events on this market
  const [activity, setActivity] = useState<Array<{ kind: 'bet' | 'resolve'; who: string; text: string; amount?: number; at: string; id: string }>>([]);

  useWatchContractEvent({
    address: isValid ? address : undefined,
    abi: PREDICTION_MARKET_ABI,
    eventName: 'Bought',
    onLogs(logs) {
      const newEvents = logs.map((log) => {
        const args = log.args as { buyer?: `0x${string}`; outcome?: number; collateralIn?: bigint; sharesOut?: bigint };
        return {
          id: `${log.transactionHash}-${log.logIndex}`,
          kind: 'bet' as const,
          who: args.buyer ? `${args.buyer.slice(0, 6)}…${args.buyer.slice(-4)}` : 'unknown',
          text: `${args.outcome === 0 ? 'YES' : 'NO'} on ${state?.question ?? 'market'}`,
          amount: args.collateralIn ? Number(formatUnits(args.collateralIn, USDC_DECIMALS)) : 0,
          at: new Date().toISOString()
        };
      });
      setActivity((prev) => [...newEvents, ...prev].slice(0, 12));
    }
  });

  if (!isValid || (!isLoading && !state)) notFound();

  if (isLoading || !state) {
    return (
      <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
        <div className="container">
          <div style={{ height: 300, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </section>
    );
  }

  const market = toUiMarket(state, meta);
  const yes = market.outcomes[0];
  const no  = market.outcomes[1];
  const yesPct = Math.round(yes.probability * 100);
  const noPct  = 100 - yesPct;

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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 380px',
            gap: 'var(--s-8)',
            alignItems: 'flex-start'
          }}
          className="md-grid"
        >
          <div className="stack-6">
            <div>
              <div className="row gap-2" style={{ marginBottom: 'var(--s-3)', flexWrap: 'wrap' }}>
                <span className="badge badge-accent">{market.category}</span>
                {market.trending && <span className="badge badge-warning">Trending</span>}
                {state.resolved ? (
                  <span className="badge badge-positive">
                    Resolved: {state.winningOutcome === 0 ? 'YES' : 'NO'}
                  </span>
                ) : (
                  <span className="badge badge-neutral">
                    <Clock size={11} /> Closes in {timeUntil(market.closesAt)}
                  </span>
                )}
              </div>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.15, flex: 1 }}>
                  {market.title}
                </h1>
                <ShareButton url={`/markets/${address}`} />
              </div>
              {market.subtitle && (
                <p style={{ marginTop: 12, color: 'var(--text-dim)' }}>{market.subtitle}</p>
              )}
              {meta.agent_handle && (
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                  Proposed by <strong style={{ color: 'var(--accent-bright)' }}>{meta.agent_handle}</strong>
                </p>
              )}
            </div>

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
              <MetaCell k="Liquidity" v={formatUSD(market.liquidity)} Icon={Wallet} />
              <MetaCell k="Volume"    v={formatUSD(market.volume)}    Icon={Activity} border />
              <MetaCell k="Traders"   v={formatNumber(market.traders)} Icon={Users}    border />
              <MetaCell k="Curator"   v={market.agent}                Icon={Shield}   border mono />
            </div>

            <MarketInfoPanels
              subtitle={market.subtitle}
              agent={meta.agent_handle ?? market.agent}
              closesAt={market.closesAt}
              category={market.category}
              resolved={state.resolved}
              winningOutcome={state.winningOutcome}
            />

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
                  {activity.length} events
                </span>
              </div>
              <div>
                {activity.length === 0 ? (
                  <div style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    No trades yet. Be the first.
                  </div>
                ) : (
                  activity.map((e) => (
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
                  ))
                )}
              </div>
            </div>
          </div>

          <aside style={{ position: 'sticky', top: 'calc(var(--nav-h) + var(--s-6))' }}>
            <HybridTradePanel
              yesPct={yesPct}
              noPct={noPct}
              marketTitle={market.title}
              marketId={market.id}
              category={market.category}
              marketAddress={address}
              resolved={state.resolved}
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
