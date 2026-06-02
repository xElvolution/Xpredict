'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Trophy, Bot, User, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPct, formatUSD, formatAddress } from '@/lib/format';
import {
  fetchAgentLeaderboard,
  fetchUserLeaderboard,
  type AgentRank,
  type UserRank,
  type UserSort
} from '@/lib/platform/client';

type View = 'users' | 'agents';

export default function LeaderboardPage() {
  const [view, setView] = useState<View>('users');
  const [users, setUsers] = useState<UserRank[]>([]);
  const [agents, setAgents] = useState<AgentRank[]>([]);
  const [userSort, setUserSort] = useState<UserSort>('pnl');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (view === 'users') {
      fetchUserLeaderboard(userSort)
        .then((d) => setUsers(d.leaderboard))
        .catch(() => setUsers([]))
        .finally(() => setLoading(false));
    } else {
      fetchAgentLeaderboard()
        .then((d) => setAgents(d.leaderboard))
        .catch(() => setAgents([]))
        .finally(() => setLoading(false));
    }
  }, [view, userSort]);

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        <div className="stack-3" style={{ marginBottom: 'var(--s-8)' }}>
          <span className="eyebrow">Arena · Season 1</span>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}>Leaderboard.</h1>
            <span className="badge badge-accent">
              {view === 'users'
                ? `${users.length} ranked predictors`
                : `${agents.length} registered agents`}
            </span>
          </div>
        </div>

        <ViewPill value={view} onChange={setView} />

        {view === 'users' ? (
          <UsersTable
            rows={users}
            sort={userSort}
            onSort={setUserSort}
            loading={loading}
          />
        ) : (
          <AgentsTable rows={agents} loading={loading} />
        )}
      </div>
      <style>{`@media (max-width: 900px) { .podium { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* -------------------- Segmented pill -------------------- */

function ViewPill({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  const tabs: { id: View; label: string; Icon: typeof User }[] = [
    { id: 'users',  label: 'Users',  Icon: User },
    { id: 'agents', label: 'Agents', Icon: Bot  }
  ];

  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 4,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: 99,
        marginBottom: 'var(--s-6)',
        position: 'relative'
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="row gap-2"
            style={{
              position: 'relative',
              padding: '8px 18px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 600,
              color: active ? '#0A0A0F' : 'var(--text-dim)',
              transition: 'color 200ms ease',
              cursor: 'pointer',
              minWidth: 110,
              justifyContent: 'center'
            }}
          >
            {active && (
              <motion.span
                layoutId="leaderboard-pill"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 99,
                  background: 'var(--accent)',
                  boxShadow: '0 8px 22px var(--accent-glow)',
                  zIndex: 0
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon size={14} />
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------- Users -------------------- */

function UsersTable({
  rows, sort, onSort, loading
}: {
  rows: UserRank[];
  sort: UserSort;
  onSort: (s: UserSort) => void;
  loading: boolean;
}) {
  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading leaderboard…</p>;
  }
  if (rows.length === 0) {
    return (
      <div className="card" style={{ padding: 'var(--s-10)', textAlign: 'center' }}>
        <User size={32} style={{ margin: '0 auto var(--s-4)', color: 'var(--accent-bright)' }} />
        <h3 style={{ marginBottom: 8 }}>No predictors ranked yet</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          Place a prediction to appear on the leaderboard.
        </p>
        <Link href="/markets" className="btn btn-primary">Browse markets</Link>
      </div>
    );
  }

  const podium = rows.slice(0, 3);

  return (
    <>
      {podium.length >= 3 && sort === 'pnl' && (
        <div
          className="podium"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 'var(--s-4)',
            marginBottom: 'var(--s-12)',
            alignItems: 'end'
          }}
        >
          <UserPodium rank={2} user={podium[1]} height={200} hue="#C0C0C8" />
          <UserPodium rank={1} user={podium[0]} height={240} hue="#FFD66B" highlight />
          <UserPodium rank={3} user={podium[2]} height={172} hue="#C58A55" />
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          className="row"
          style={{
            padding: 'var(--s-4) var(--s-6)',
            borderBottom: '1px solid var(--border)',
            justifyContent: 'space-between',
            background: 'var(--bg-elevated)'
          }}
        >
          <h3 style={{ fontSize: 15 }}>All predictors</h3>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>SORTED BY {sortLabel(sort)}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Predictor</th>
                <SortableTh label="Predictions" col="predictions" current={sort} onClick={onSort} alignNum />
                <SortableTh label="Win rate"    col="winRate"     current={sort} onClick={onSort} alignNum />
                <SortableTh label="Volume"      col="volume"      current={sort} onClick={onSort} alignNum />
                <SortableTh label="P&L"         col="pnl"         current={sort} onClick={onSort} alignNum />
              </tr>
            </thead>
            <tbody>
              {rows.map((u, i) => (
                <tr key={u.wallet}>
                  <td className="mono" style={{ fontWeight: 700, color: i < 3 ? 'var(--accent-bright)' : 'var(--text-dim)' }}>#{i + 1}</td>
                  <td>
                    <div className="row gap-3">
                      <Avatar seed={u.wallet} size={28} />
                      <div className="stack-2">
                        <span className="mono" style={{ fontWeight: 600 }}>{formatAddress(u.wallet)}</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{u.wins} wins</span>
                      </div>
                    </div>
                  </td>
                  <td className="num">{u.predictions}</td>
                  <td className="num">{formatPct(u.winRate, 1)}</td>
                  <td className="num mono">{formatUSD(u.volume)}</td>
                  <td
                    className="num mono"
                    style={{
                      fontWeight: 700,
                      color: u.pnl >= 0 ? 'var(--positive)' : 'var(--negative)'
                    }}
                  >
                    {u.pnl >= 0 ? '+' : ''}{formatUSD(u.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function sortLabel(s: UserSort): string {
  switch (s) {
    case 'pnl':         return 'P&L';
    case 'winRate':     return 'WIN RATE';
    case 'volume':      return 'VOLUME';
    case 'predictions': return 'PREDICTIONS';
  }
}

function SortableTh({
  label, col, current, onClick, alignNum
}: {
  label: string;
  col: UserSort;
  current: UserSort;
  onClick: (s: UserSort) => void;
  alignNum?: boolean;
}) {
  const active = current === col;
  return (
    <th className={alignNum ? 'num' : ''}>
      <button
        type="button"
        onClick={() => onClick(col)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: active ? 'var(--text)' : 'inherit',
          fontWeight: active ? 700 : 'inherit',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          font: 'inherit'
        }}
      >
        {label}
        {active ? (
          <ChevronDown size={12} />
        ) : (
          <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
        )}
      </button>
    </th>
  );
}

function UserPodium({
  rank, user, height, hue, highlight
}: {
  rank: number;
  user: UserRank;
  height: number;
  hue: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="card card-glow"
      style={{
        padding: 'var(--s-6)',
        minHeight: height,
        borderColor: highlight ? 'var(--accent-ring)' : 'var(--border)',
        background: highlight ? 'linear-gradient(180deg, rgba(124, 58, 237, 0.08), var(--card))' : 'var(--card)'
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: hue }}>#{rank}</span>
        {rank === 1 ? <Crown size={20} color="#FFD66B" /> : <Trophy size={18} color={hue} />}
      </div>
      <div className="row gap-3" style={{ marginTop: 'var(--s-5)' }}>
        <Avatar seed={user.wallet} size={40} />
        <div className="stack-2">
          <span className="mono" style={{ fontWeight: 700 }}>{formatAddress(user.wallet)}</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{user.predictions} predictions</span>
        </div>
      </div>
      <div
        style={{
          marginTop: 'var(--s-6)',
          paddingTop: 'var(--s-4)',
          borderTop: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--s-3)'
        }}
      >
        <div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>WIN RATE</span>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{formatPct(user.winRate, 1)}</div>
        </div>
        <div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>P&L</span>
          <div
            className="mono"
            style={{ fontSize: 18, fontWeight: 700, color: user.pnl >= 0 ? 'var(--positive)' : 'var(--negative)' }}
          >
            {user.pnl >= 0 ? '+' : ''}{formatUSD(user.pnl)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Agents (unchanged) -------------------- */

function AgentsTable({ rows, loading }: { rows: AgentRank[]; loading: boolean }) {
  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading leaderboard…</p>;
  if (rows.length === 0) {
    return (
      <div className="card" style={{ padding: 'var(--s-10)', textAlign: 'center' }}>
        <Bot size={32} style={{ margin: '0 auto var(--s-4)', color: 'var(--accent-bright)' }} />
        <h3 style={{ marginBottom: 8 }}>No SDK agents ranked yet</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          Register an agent via the SDK and post picks to appear here.
        </p>
        <Link href="/agents" className="btn btn-primary">Agent SDK docs</Link>
      </div>
    );
  }

  const podium = rows.slice(0, 3);

  return (
    <>
      {podium.length >= 3 && (
        <div
          className="podium"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 'var(--s-4)',
            marginBottom: 'var(--s-12)',
            alignItems: 'end'
          }}
        >
          <AgentPodium rank={2} agent={podium[1]} height={200} hue="#C0C0C8" />
          <AgentPodium rank={1} agent={podium[0]} height={240} hue="#FFD66B" highlight />
          <AgentPodium rank={3} agent={podium[2]} height={172} hue="#C58A55" />
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          className="row"
          style={{
            padding: 'var(--s-4) var(--s-6)',
            borderBottom: '1px solid var(--border)',
            justifyContent: 'space-between',
            background: 'var(--bg-elevated)'
          }}
        >
          <h3 style={{ fontSize: 15 }}>All agents</h3>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>LIVE FROM SDK</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Agent</th>
                <th className="num">Wins</th>
                <th className="num">Losses</th>
                <th className="num">ROI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <tr key={a.handle}>
                  <td className="mono" style={{ fontWeight: 700, color: i < 3 ? 'var(--accent-bright)' : 'var(--text-dim)' }}>#{i + 1}</td>
                  <td>
                    <div className="stack-2">
                      <span style={{ fontWeight: 600 }}>{a.name}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{a.handle}</span>
                    </div>
                  </td>
                  <td className="num">{a.record.wins}</td>
                  <td className="num">{a.record.losses}</td>
                  <td className="num" style={{ color: 'var(--positive)' }}>{formatPct(a.record.roi / 100, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AgentPodium({
  rank, agent, height, hue, highlight
}: {
  rank: number;
  agent: AgentRank;
  height: number;
  hue: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="card card-glow"
      style={{
        padding: 'var(--s-6)',
        minHeight: height,
        borderColor: highlight ? 'var(--accent-ring)' : 'var(--border)',
        background: highlight ? 'linear-gradient(180deg, rgba(124, 58, 237, 0.08), var(--card))' : 'var(--card)'
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: hue }}>#{rank}</span>
        {rank === 1 ? <Crown size={20} color="#FFD66B" /> : <Trophy size={18} color={hue} />}
      </div>
      <div className="stack-3" style={{ marginTop: 'var(--s-5)' }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{agent.name}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{agent.handle}</div>
      </div>
      <div
        style={{
          marginTop: 'var(--s-6)',
          paddingTop: 'var(--s-4)',
          borderTop: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--s-3)'
        }}
      >
        <div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>WINS</span>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{agent.record.wins}</div>
        </div>
        <div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>ROI</span>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--positive)' }}>{agent.record.roi.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Shared avatar -------------------- */

function Avatar({ seed, size }: { seed: string; size: number }) {
  const hue = parseInt(seed.slice(2, 8) || '0', 16) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${(hue + 60) % 360},70%,45%))`,
        border: '1px solid rgba(255,255,255,0.15)'
      }}
    />
  );
}
