'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount, useWriteContract } from 'wagmi';
import { Wallet, Trophy, ArrowUpRight, BadgeCheck, Loader2 } from 'lucide-react';
import { formatAddress, formatUSD, timeAgo } from '@/lib/format';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useUserPositions, type OnchainPosition } from '@/lib/use-positions';
import { PREDICTION_MARKET_ABI } from '@/lib/contracts';

type Tab = 'open' | 'settled' | 'all';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>('open');
  const { positions, isLoading, refetch } = useUserPositions();

  if (!isConnected || !address) return <Disconnected />;

  const open     = positions.filter((p) => !p.resolved);
  const settled  = positions.filter((p) => p.resolved);
  const claimable = positions.filter((p) => p.claimable);

  const totalValue = positions.reduce((s, p) => s + p.estimatedValue, 0);

  const visible =
    tab === 'open' ? open : tab === 'settled' ? settled : positions;

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        <div className="card" style={{ padding: 'var(--s-6)', marginBottom: 'var(--s-8)' }}>
          <div className="row gap-4">
            <Avatar seed={address} size={56} />
            <div className="stack-2">
              <div className="row gap-2">
                <span className="badge badge-accent"><BadgeCheck size={11} /> Predictor</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>{formatAddress(address)}</h1>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 0,
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            background: 'var(--card)',
            overflow: 'hidden',
            marginBottom: 'var(--s-8)'
          }}
          className="profile-stats"
        >
          <Stat k="Portfolio value" v={formatUSD(totalValue)} />
          <Stat k="Open positions"  v={String(open.length)} border />
          <Stat k="Claimable"       v={`${claimable.length} markets`} border highlight={claimable.length > 0} />
        </div>

        <div className="row gap-2" style={{ marginBottom: 'var(--s-5)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div className="row gap-2">
            <TabBtn id="open"    label={`Open · ${open.length}`}       cur={tab} set={setTab} />
            <TabBtn id="settled" label={`Settled · ${settled.length}`} cur={tab} set={setTab} />
            <TabBtn id="all"     label={`All · ${positions.length}`}   cur={tab} set={setTab} />
          </div>
          {claimable.length > 0 && (
            <span className="badge badge-positive">
              <Trophy size={11} /> {claimable.length} claimable
            </span>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 'var(--s-10)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : visible.length === 0 ? (
            <EmptyTab tab={tab} />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th className="num">YES shares</th>
                    <th className="num">NO shares</th>
                    <th className="num">Est. value</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <PositionRow key={p.marketAddress} p={p} onClaimed={refetch} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .profile-stats { grid-template-columns: 1fr !important; }
          .profile-stats > div + div { border-top: 1px solid var(--border); border-left: none !important; }
        }
      `}</style>
    </section>
  );
}

function PositionRow({ p, onClaimed }: { p: OnchainPosition; onClaimed: () => void }) {
  const { writeContractAsync, isPending } = useWriteContract();
  const [error, setError] = useState('');

  const handleClaim = async () => {
    setError('');
    try {
      await writeContractAsync({
        address: p.marketAddress,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'claim'
      });
      onClaimed();
    } catch (err: any) {
      setError(err?.shortMessage ?? 'Claim failed');
    }
  };

  return (
    <tr>
      <td>
        <Link href={`/markets/${p.marketAddress}`} className="stack-2" style={{ display: 'inline-flex', flexDirection: 'column', maxWidth: 360 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
            {p.question}
          </span>
          {error && <span style={{ fontSize: 11, color: 'var(--negative)' }}>{error}</span>}
        </Link>
      </td>
      <td className="num mono" style={{ color: p.yesShares > 0 ? 'var(--positive)' : 'var(--text-muted)' }}>
        {p.yesShares.toFixed(2)}
      </td>
      <td className="num mono" style={{ color: p.noShares > 0 ? 'var(--negative)' : 'var(--text-muted)' }}>
        {p.noShares.toFixed(2)}
      </td>
      <td className="num mono">{formatUSD(p.estimatedValue)}</td>
      <td>
        {p.resolved
          ? <span className="badge badge-positive">Resolved: {p.winningOutcome === 0 ? 'YES' : 'NO'}</span>
          : <span className="badge badge-neutral">Open</span>}
      </td>
      <td>
        {p.claimable ? (
          <button className="btn btn-primary btn-sm" onClick={handleClaim} disabled={isPending}>
            {isPending ? 'Claiming...' : 'Claim'}
          </button>
        ) : (
          <Link href={`/markets/${p.marketAddress}`} className="btn btn-ghost btn-sm">
            View <ArrowUpRight size={12} />
          </Link>
        )}
      </td>
    </tr>
  );
}

function TabBtn({ id, label, cur, set }: { id: Tab; label: string; cur: string; set: (t: Tab) => void }) {
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

function EmptyTab({ tab }: { tab: Tab }) {
  return (
    <div style={{ padding: 'var(--s-12) var(--s-6)', textAlign: 'center' }}>
      <h3 style={{ fontSize: 18, marginBottom: 6 }}>
        {tab === 'open' ? 'No open positions.' : tab === 'settled' ? 'No settled markets.' : 'No trades yet.'}
      </h3>
      <Link href="/markets" className="btn btn-primary" style={{ marginTop: 16 }}>Browse markets</Link>
    </div>
  );
}

function Disconnected() {
  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-16))' }}>
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card card-glow" style={{ padding: 'var(--s-10)', textAlign: 'center' }}>
          <Wallet size={40} style={{ margin: '0 auto var(--s-4)', color: 'var(--accent-bright)' }} />
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--s-3)' }}>Connect a wallet to view your profile.</h1>
          <p style={{ margin: '0 auto var(--s-6)', maxWidth: 360, color: 'var(--text-muted)' }}>
            Your positions and claimable winnings live onchain. Connect with OKX Wallet or any injected wallet to view them.
          </p>
          <ConnectButton />
        </div>
      </div>
    </section>
  );
}

function Avatar({ seed, size }: { seed: string; size: number }) {
  const hue = parseInt(seed.slice(2, 8), 16) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${(hue+60)%360},70%,45%))`,
      border: '1px solid rgba(255,255,255,0.15)'
    }} />
  );
}
