'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Wallet, Trophy, Flame, ArrowUpRight, BadgeCheck } from 'lucide-react';
import { MOCK_POSITIONS, MOCK_STATS, MOCK_PNL_SERIES, type Position } from '@/lib/positions';
import { formatAddress, formatUSD, formatPct, timeAgo } from '@/lib/format';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { Sparkline } from '@/components/profile/Sparkline';

type Tab = 'open' | 'settled' | 'all';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>('open');

  if (!isConnected || !address) return <Disconnected />;

  const open    = MOCK_POSITIONS.filter((p) => p.status === 'open');
  const settled = MOCK_POSITIONS.filter((p) => p.status !== 'open');
  const claimable = settled.filter((p) => p.claimable);

  const visible: Position[] =
    tab === 'open' ? open : tab === 'settled' ? settled : MOCK_POSITIONS;

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        {/* Header */}
        <div
          className="card"
          style={{
            padding: 'var(--s-8)',
            marginBottom: 'var(--s-8)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(540px 280px at 90% -10%, rgba(124, 58, 237, 0.18), transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 320px',
              gap: 'var(--s-8)',
              alignItems: 'center'
            }}
            className="profile-head"
          >
            <div className="row gap-4">
              <Avatar seed={address} size={72} />
              <div className="stack-3">
                <div className="row gap-2">
                  <span
                    className="badge"
                    style={{
                      color: '#5EEAD4',
                      background: 'rgba(94, 234, 212, 0.10)',
                      borderColor: 'rgba(94, 234, 212, 0.30)'
                    }}
                  >
                    <BadgeCheck size={11} /> {MOCK_STATS.tier}
                  </span>
                  <span className="badge badge-warning">
                    <Flame size={11} /> Streak {MOCK_STATS.streak}
                  </span>
                  <span className="badge badge-neutral">Rank #{MOCK_STATS.rank}</span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
                  {formatAddress(address)}
                </h1>
                <div className="row gap-4" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  <span>Joined Mar 2026</span>
                  <span>·</span>
                  <span>{MOCK_STATS.marketsTraded} markets traded</span>
                  <span>·</span>
                  <span>{formatUSD(MOCK_STATS.lifetimeVolume)} lifetime volume</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--s-5)', background: 'var(--surface)' }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--s-3)' }}>
                <span
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                  Lifetime P&amp;L · 30d
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: MOCK_STATS.totalPnl >= 0 ? 'var(--positive)' : 'var(--negative)'
                  }}
                >
                  {MOCK_STATS.totalPnl >= 0 ? '+' : ''}{formatUSD(MOCK_STATS.totalPnl)}
                </span>
              </div>
              <Sparkline data={MOCK_PNL_SERIES} height={56} />
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 0,
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            background: 'var(--card)',
            overflow: 'hidden',
            marginBottom: 'var(--s-8)'
          }}
          className="profile-stats"
        >
          <Stat k="Unrealized P&amp;L" v={`+${formatUSD(MOCK_STATS.unrealizedPnl)}`} tone="positive" />
          <Stat k="Win rate"        v={formatPct(MOCK_STATS.winRate, 1)} border />
          <Stat k="Open positions"  v={String(open.length)}              border />
          <Stat k="Claimable"       v={`${claimable.length} markets`}    border highlight={claimable.length > 0} />
        </div>

        {/* Tabs */}
        <div
          className="row gap-2"
          style={{
            marginBottom: 'var(--s-5)',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}
        >
          <div className="row gap-2">
            <Tab id="open"    label={`Open · ${open.length}`}        cur={tab} set={setTab} />
            <Tab id="settled" label={`Settled · ${settled.length}`}  cur={tab} set={setTab} />
            <Tab id="all"     label={`All · ${MOCK_POSITIONS.length}`} cur={tab} set={setTab} />
          </div>
          {claimable.length > 0 && (
            <button className="btn btn-primary btn-sm">
              <Trophy size={14} />
              Claim all · +${claimable.reduce((s, p) => s + p.pnl, 0).toFixed(2)}
            </button>
          )}
        </div>

        {/* Positions */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {visible.length === 0 ? (
            <EmptyTab tab={tab} />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Side</th>
                    <th className="num">Shares</th>
                    <th className="num">Entry</th>
                    <th className="num">Now</th>
                    <th className="num">P&amp;L</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <PositionRow key={p.id} p={p} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .profile-head    { grid-template-columns: 1fr !important; }
          .profile-stats   { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
          .profile-stats > div:nth-child(3),
          .profile-stats > div:nth-child(4) { border-top: 1px solid var(--border); }
          .profile-stats > div:nth-child(3) { border-left: none !important; }
        }
        @media (max-width: 560px) {
          .profile-stats { grid-template-columns: 1fr !important; }
          .profile-stats > div { border-left: none !important; }
          .profile-stats > div + div { border-top: 1px solid var(--border); }
        }
      `}</style>
    </section>
  );
}

/* -------- Position row -------- */

function PositionRow({ p }: { p: Position }) {
  const sideColor = p.side === 'yes' ? 'var(--positive)' : 'var(--negative)';
  const pnlColor  = p.pnl >= 0 ? 'var(--positive)' : 'var(--negative)';

  return (
    <tr>
      <td>
        <Link
          href={`/markets/${p.marketId}`}
          className="stack-2"
          style={{ display: 'inline-flex', flexDirection: 'column', maxWidth: 360 }}
        >
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {p.category}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
            {p.marketTitle}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            opened {timeAgo(p.openedAt)}
            {p.resolvedAt && ` · settled ${timeAgo(p.resolvedAt)}`}
          </span>
        </Link>
      </td>
      <td>
        <span
          style={{
            display: 'inline-flex',
            padding: '4px 10px',
            borderRadius: 'var(--r-pill)',
            background: p.side === 'yes' ? 'var(--positive-soft)' : 'var(--negative-soft)',
            border: `1px solid ${sideColor}40`,
            color: sideColor,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
        >
          {p.side}
        </span>
      </td>
      <td className="num mono">{p.shares.toLocaleString()}</td>
      <td className="num mono">{(p.entryPrice * 100).toFixed(0)}¢</td>
      <td className="num mono">{(p.currentPrice * 100).toFixed(0)}¢</td>
      <td className="num mono" style={{ color: pnlColor, fontWeight: 700 }}>
        {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)}
      </td>
      <td>
        {p.status === 'open' && (
          <span className="badge badge-neutral">Open</span>
        )}
        {p.status === 'won' && (
          <span className="badge badge-positive">Won</span>
        )}
        {p.status === 'lost' && (
          <span className="badge badge-negative">Lost</span>
        )}
      </td>
      <td>
        {p.claimable ? (
          <button className="btn btn-primary btn-sm">Claim ${p.pnl.toFixed(0)}</button>
        ) : (
          <Link
            href={`/markets/${p.marketId}`}
            className="btn btn-ghost btn-sm"
          >
            View <ArrowUpRight size={12} />
          </Link>
        )}
      </td>
    </tr>
  );
}

/* -------- Helpers -------- */

function Tab({ id, label, cur, set }: { id: 'open' | 'settled' | 'all'; label: string; cur: string; set: (t: 'open' | 'settled' | 'all') => void }) {
  const active = cur === id;
  return (
    <button
      onClick={() => set(id)}
      className="btn btn-sm"
      style={{
        borderRadius: 'var(--r-pill)',
        background: active ? 'var(--accent-soft)' : 'transparent',
        border: `1px solid ${active ? 'var(--accent-ring)' : 'var(--border-strong)'}`,
        color: active ? 'var(--accent-bright)' : 'var(--text-dim)'
      }}
    >
      {label}
    </button>
  );
}

function Stat({ k, v, border, tone, highlight }: {
  k: string; v: string; border?: boolean; tone?: 'positive'; highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: 'var(--s-5)',
        borderLeft: border ? '1px solid var(--border)' : 'none',
        background: highlight ? 'var(--accent-soft)' : 'transparent'
      }}
    >
      <div
        className="mono"
        style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
        dangerouslySetInnerHTML={{ __html: k }}
      />
      <div
        className="mono"
        style={{
          marginTop: 6,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: tone === 'positive' ? 'var(--positive)' : highlight ? 'var(--accent-bright)' : 'var(--text)'
        }}
      >
        {v}
      </div>
    </div>
  );
}

function EmptyTab({ tab }: { tab: Tab }) {
  return (
    <div style={{ padding: 'var(--s-16) var(--s-6)', textAlign: 'center' }}>
      <div
        style={{
          width: 56, height: 56,
          margin: '0 auto var(--s-4)',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-ring)',
          color: 'var(--accent-bright)'
        }}
      >
        <Wallet size={22} />
      </div>
      <h3 style={{ fontSize: 18, marginBottom: 6 }}>
        {tab === 'open'
          ? 'No open positions yet.'
          : tab === 'settled'
            ? 'No settled markets yet.'
            : "You haven't traded anything yet."}
      </h3>
      <p style={{ color: 'var(--text-muted)', margin: '0 auto', maxWidth: 360 }}>
        Browse open markets and place your first prediction in seconds.
      </p>
      <Link href="/markets" className="btn btn-primary" style={{ marginTop: 16 }}>
        Browse markets
      </Link>
    </div>
  );
}

function Disconnected() {
  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-16))' }}>
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card card-glow" style={{ padding: 'var(--s-10)', textAlign: 'center' }}>
          <div
            style={{
              width: 64, height: 64,
              margin: '0 auto var(--s-5)',
              borderRadius: 'var(--r-lg)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-ring)',
              color: 'var(--accent-bright)'
            }}
          >
            <Wallet size={26} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', marginBottom: 'var(--s-3)' }}>
            Connect a wallet to view your profile.
          </h1>
          <p style={{ margin: '0 auto var(--s-6)', maxWidth: 360 }}>
            Your positions, P&amp;L, and claimable winnings live onchain. Connect with OKX Wallet
            or any injected wallet to view them.
          </p>
          <ConnectButton />
        </div>
      </div>
    </section>
  );
}

function Avatar({ seed, size = 28 }: { seed: string; size?: number }) {
  const h1 = hashHue(seed);
  const h2 = (h1 + 80) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: `conic-gradient(from 40deg, hsl(${h1} 80% 60%), hsl(${h2} 75% 55%), hsl(${h1} 80% 60%))`,
        border: '2px solid var(--border-strong)'
      }}
    />
  );
}

function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}
