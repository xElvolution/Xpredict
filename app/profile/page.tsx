'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAccount, useWriteContract } from 'wagmi';
import {
  ArrowUpRight, BadgeCheck, Loader2, Settings,
  LineChart, ShieldCheck, Coins
} from 'lucide-react';
import { formatAddress, formatUSD, timeAgo } from '@/lib/format';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useUserPositions, type OnchainPosition } from '@/lib/use-positions';
import { PREDICTION_MARKET_ABI } from '@/lib/contracts';
import { Sparkline } from '@/components/profile/Sparkline';
import {
  fetchOrders, fetchHistory, fetchFollows, fetchSnapshots, cancelLimitOrder,
  type OrderRow, type TradeRow
} from '@/lib/platform/client';

type Tab = 'positions' | 'orders' | 'history' | 'claims' | 'following';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>('positions');
  const { positions, isLoading, refetch } = useUserPositions();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [follows, setFollows] = useState<string[]>([]);
  const [snapshots, setSnapshots] = useState<number[]>([]);
  const [platformLoading, setPlatformLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setPlatformLoading(true);
    Promise.all([
      fetchOrders(address).then((d) => setOrders(d.orders.filter((o) => o.status === 'open' || o.status === 'partial'))),
      fetchHistory(address).then((d) => setTrades(d.trades)),
      fetchFollows(address).then((d) => setFollows(d.agents)),
      fetchSnapshots(address).then((d) => setSnapshots(d.snapshots.map((s) => s.value)))
    ])
      .catch(() => {})
      .finally(() => setPlatformLoading(false));
  }, [address]);

  if (!isConnected || !address) return <Disconnected />;

  const open = positions.filter((p) => !p.resolved);
  const settled = positions.filter((p) => p.resolved);
  const claimable = positions.filter((p) => p.claimable);
  const totalValue = positions.reduce((s, p) => s + p.estimatedValue, 0);

  const chartData = snapshots.length > 1 ? snapshots : [totalValue * 0.9, totalValue * 0.95, totalValue];

  const refreshOrders = () => {
    if (!address) return;
    fetchOrders(address).then((d) => setOrders(d.orders.filter((o) => o.status === 'open' || o.status === 'partial')));
  };

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        <div className="card" style={{ padding: 'var(--s-6)', marginBottom: 'var(--s-8)' }}>
          <div className="row gap-4" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div className="row gap-4">
              <Avatar seed={address} size={56} />
              <div className="stack-2">
                <div className="row gap-2">
                  <span className="badge badge-accent"><BadgeCheck size={11} /> Predictor</span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>{formatAddress(address)}</h1>
              </div>
            </div>
            <Link href="/settings" className="btn btn-ghost btn-sm">
              <Settings size={14} /> Settings
            </Link>
          </div>
          <div style={{ marginTop: 'var(--s-5)' }}>
            <Sparkline data={chartData} height={64} />
          </div>
        </div>

        <div className="profile-stats" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0,
          border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', background: 'var(--card)',
          overflow: 'hidden', marginBottom: 'var(--s-8)'
        }}>
          <Stat k="Portfolio" v={formatUSD(totalValue)} />
          <Stat k="Open positions" v={String(open.length)} border />
          <Stat k="Open orders" v={String(orders.length)} border />
          <Stat k="Claimable" v={`${claimable.length}`} border highlight={claimable.length > 0} />
        </div>

        <div className="row gap-2" style={{ marginBottom: 'var(--s-5)', flexWrap: 'wrap' }}>
          <TabBtn id="positions" label={`Positions · ${open.length}`} cur={tab} set={setTab} />
          <TabBtn id="orders" label={`Orders · ${orders.length}`} cur={tab} set={setTab} />
          <TabBtn id="history" label={`History · ${trades.length}`} cur={tab} set={setTab} />
          <TabBtn id="claims" label={`Claims · ${claimable.length}`} cur={tab} set={setTab} />
          <TabBtn id="following" label={`Following · ${follows.length}`} cur={tab} set={setTab} />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {tab === 'positions' && (
            <PositionsTable loading={isLoading} rows={open.length ? open : positions} empty="No open positions." refetch={refetch} />
          )}
          {tab === 'orders' && (
            <OrdersTable loading={platformLoading} orders={orders} wallet={address} onCancel={refreshOrders} />
          )}
          {tab === 'history' && (
            <HistoryTable loading={platformLoading} trades={trades} />
          )}
          {tab === 'claims' && (
            <PositionsTable loading={isLoading} rows={claimable} empty="Nothing to claim." refetch={refetch} claimsOnly />
          )}
          {tab === 'following' && (
            <FollowingList agents={follows} />
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .profile-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

function PositionsTable({
  loading, rows, empty, refetch, claimsOnly
}: {
  loading: boolean; rows: OnchainPosition[]; empty: string; refetch: () => void; claimsOnly?: boolean;
}) {
  if (loading) return <LoadingState />;
  if (rows.length === 0) return <EmptyTab message={empty} />;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Market</th>
            <th className="num">YES</th>
            <th className="num">NO</th>
            <th className="num">Est. value</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <PositionRow key={p.marketAddress} p={p} onClaimed={refetch} claimsOnly={claimsOnly} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTable({
  loading, orders, wallet, onCancel
}: { loading: boolean; orders: OrderRow[]; wallet: string; onCancel: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  if (loading) return <LoadingState />;
  if (orders.length === 0) return <EmptyTab message="No open limit orders." cta={{ href: '/markets', label: 'Browse markets' }} />;

  const cancel = async (id: string) => {
    setBusy(id);
    try {
      await cancelLimitOrder(id, wallet);
      onCancel();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Market</th>
            <th>Side</th>
            <th className="num">Price</th>
            <th className="num">Size</th>
            <th className="num">Filled</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <Link href={`/markets/${o.market_id}`} style={{ fontSize: 14, fontWeight: 600 }}>
                  {o.market_title}
                </Link>
              </td>
              <td><span className="badge badge-neutral">{o.side.toUpperCase()}</span></td>
              <td className="num mono">{Math.round(o.price * 100)}¢</td>
              <td className="num mono">{formatUSD(o.quantity_usdc)}</td>
              <td className="num mono">{formatUSD(o.filled_usdc)}</td>
              <td>
                <button className="btn btn-ghost btn-sm" disabled={busy === o.id} onClick={() => cancel(o.id)}>
                  {busy === o.id ? '…' : 'Cancel'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistoryTable({ loading, trades }: { loading: boolean; trades: TradeRow[] }) {
  if (loading) return <LoadingState />;
  if (trades.length === 0) return <EmptyTab message="No trades recorded yet." />;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>When</th>
            <th>Market</th>
            <th>Type</th>
            <th className="num">Amount</th>
            <th className="num">Price</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id}>
              <td className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(t.created_at)}</td>
              <td style={{ fontSize: 14 }}>{t.market_title}</td>
              <td><span className="badge badge-neutral">{t.kind.replace('_', ' ')}</span></td>
              <td className="num mono">{formatUSD(t.amount_usdc)}</td>
              <td className="num mono">{t.price ? `${Math.round(t.price * 100)}¢` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FollowingList({ agents }: { agents: string[] }) {
  if (agents.length === 0) {
    return (
      <EmptyTab
        message="You're not following any agents yet."
        cta={{ href: '/arena', label: 'Explore Arena' }}
      />
    );
  }
  return (
    <div style={{ padding: 'var(--s-4)' }} className="stack-3">
      {agents.map((a) => (
        <div key={a} className="row" style={{ justifyContent: 'space-between', padding: 'var(--s-3) var(--s-4)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
          <span style={{ fontWeight: 600 }}>{a}</span>
          <Link href="/arena" className="btn btn-ghost btn-sm">View picks <ArrowUpRight size={12} /></Link>
        </div>
      ))}
    </div>
  );
}

function PositionRow({ p, onClaimed, claimsOnly }: { p: OnchainPosition; onClaimed: () => void; claimsOnly?: boolean }) {
  const { writeContractAsync, isPending } = useWriteContract();
  const [error, setError] = useState('');

  const handleClaim = async () => {
    setError('');
    try {
      await writeContractAsync({ address: p.marketAddress, abi: PREDICTION_MARKET_ABI, functionName: 'claim' });
      onClaimed();
    } catch (err: unknown) {
      const e = err as { shortMessage?: string };
      setError(e?.shortMessage ?? 'Claim failed');
    }
  };

  return (
    <tr>
      <td>
        <Link href={`/markets/${p.marketAddress}`} className="stack-2" style={{ display: 'inline-flex', flexDirection: 'column', maxWidth: 360 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{p.question}</span>
          {error && <span style={{ fontSize: 11, color: 'var(--negative)' }}>{error}</span>}
        </Link>
      </td>
      <td className="num mono" style={{ color: p.yesShares > 0 ? 'var(--positive)' : 'var(--text-muted)' }}>{p.yesShares.toFixed(2)}</td>
      <td className="num mono" style={{ color: p.noShares > 0 ? 'var(--negative)' : 'var(--text-muted)' }}>{p.noShares.toFixed(2)}</td>
      <td className="num mono">{formatUSD(p.estimatedValue)}</td>
      <td>
        {p.resolved
          ? <span className="badge badge-positive">Resolved: {p.winningOutcome === 0 ? 'YES' : 'NO'}</span>
          : <span className="badge badge-neutral">Open</span>}
      </td>
      <td>
        {p.claimable ? (
          <button className="btn btn-primary btn-sm" onClick={handleClaim} disabled={isPending}>
            {isPending ? 'Claiming…' : 'Claim'}
          </button>
        ) : !claimsOnly ? (
          <Link href={`/markets/${p.marketAddress}`} className="btn btn-ghost btn-sm">View <ArrowUpRight size={12} /></Link>
        ) : null}
      </td>
    </tr>
  );
}

function TabBtn({ id, label, cur, set }: { id: Tab; label: string; cur: Tab; set: (t: Tab) => void }) {
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

function Stat({ k, v, border, highlight }: { k: string; v: string; border?: boolean; highlight?: boolean }) {
  return (
    <div style={{ padding: 'var(--s-5)', borderLeft: border ? '1px solid var(--border)' : 'none', background: highlight ? 'var(--accent-soft)' : 'transparent' }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{k}</div>
      <div className="mono" style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: highlight ? 'var(--accent-bright)' : 'var(--text)' }}>{v}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: 'var(--s-10)', textAlign: 'center', color: 'var(--text-muted)' }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
    </div>
  );
}

function EmptyTab({ message, cta }: { message: string; cta?: { href: string; label: string } }) {
  return (
    <div style={{ padding: 'var(--s-12) var(--s-6)', textAlign: 'center' }}>
      <h3 style={{ fontSize: 18, marginBottom: 6 }}>{message}</h3>
      {cta && <Link href={cta.href} className="btn btn-primary" style={{ marginTop: 16 }}>{cta.label}</Link>}
    </div>
  );
}

function Disconnected() {
  const perks = [
    { Icon: LineChart,   label: 'Live P&L'   },
    { Icon: Coins,       label: 'Claim wins' },
    { Icon: ShieldCheck, label: 'Onchain'    }
  ];

  return (
    <section
      style={{
        minHeight: 'calc(100vh - var(--nav-h))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--s-8) var(--s-4)',
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
            'radial-gradient(520px 320px at 50% 20%, rgba(124,58,237,0.22), transparent 70%),' +
            'radial-gradient(420px 280px at 80% 90%, rgba(0,255,135,0.08), transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          padding: 1,
          borderRadius: 22,
          background:
            'linear-gradient(140deg, rgba(124,58,237,0.55), rgba(124,58,237,0.05) 35%, rgba(255,255,255,0.06) 65%, rgba(124,58,237,0.4))',
          boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.10)'
        }}
      >
        <div
          style={{
            borderRadius: 21,
            background: 'rgba(12, 12, 20, 0.92)',
            backdropFilter: 'blur(18px) saturate(140%)',
            padding: 'var(--s-8) var(--s-6) var(--s-6)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 84,
              height: 84,
              margin: '0 auto var(--s-5)'
            }}
          >
            <motion.div
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background:
                  'conic-gradient(from 0deg, rgba(124,58,237,0.95), rgba(124,58,237,0) 35%, rgba(94,234,212,0.7) 60%, rgba(124,58,237,0) 85%, rgba(124,58,237,0.95))',
                filter: 'blur(0.5px)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 2,
                borderRadius: '50%',
                background: 'rgba(12,12,20,0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image
                src="/logo.png"
                alt="XPredict"
                width={42}
                height={42}
                style={{ borderRadius: 10 }}
              />
            </div>
            <motion.span
              aria-hidden
              animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0.2, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'var(--positive)',
                boxShadow: '0 0 12px var(--positive)'
              }}
            />
          </div>

          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent-bright)',
              marginBottom: 8
            }}
          >
            Your arena, your wallet
          </div>

          <h2
            style={{
              fontSize: '1.45rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: 'var(--s-2)'
            }}
          >
            <span className="gradient-text">Connect</span> to enter
          </h2>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              maxWidth: 300,
              margin: '0 auto var(--s-6)'
            }}
          >
            Predictions, P&amp;L, claims, and following all sync to your wallet on X Layer.
          </p>

          <div
            className="row gap-2"
            style={{ justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--s-6)' }}
          >
            {perks.map(({ Icon, label }) => (
              <span
                key={label}
                className="row gap-2"
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  border: '1px solid var(--border-strong)',
                  background: 'rgba(255,255,255,0.025)',
                  fontSize: 12,
                  color: 'var(--text-dim)'
                }}
              >
                <Icon size={12} color="var(--accent-bright)" />
                {label}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ConnectButton />
          </div>

          <div
            className="mono"
            style={{
              marginTop: 'var(--s-5)',
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)'
            }}
          >
            Powered by Privy · X Layer zkEVM
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Avatar({ seed, size }: { seed: string; size: number }) {
  const hue = parseInt(seed.slice(2, 8), 16) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${(hue + 60) % 360},70%,45%))`,
      border: '1px solid rgba(255,255,255,0.15)'
    }} />
  );
}
