'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, BarChart3, ListOrdered, Users, MessageCircle } from 'lucide-react';
import {
  matchById,
  statusLabel,
  statusColor,
  type GoalEvent,
  type LiveMatch,
  type Side
} from '@/lib/live-matches';

type Tab = 'stats' | 'commentary' | 'squad';

export default function LiveMatchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const m = matchById(params.id);

  const [tab, setTab] = useState<Tab>('stats');
  const [toast, setToast] = useState<GoalEvent | null>(null);

  useEffect(() => {
    if (!m) return;
    const last = m.goals[m.goals.length - 1];
    if (!last) return;
    setToast(last);
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [m]);

  const lastHomeGoal = useMemo(
    () => (m ? [...m.goals].reverse().find((g) => g.team === 'home') : undefined),
    [m]
  );
  const lastAwayGoal = useMemo(
    () => (m ? [...m.goals].reverse().find((g) => g.team === 'away') : undefined),
    [m]
  );

  if (!m) {
    return (
      <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
        <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
          <h1>Match not found</h1>
          <p style={{ marginTop: 'var(--s-3)' }}>
            <Link href="/live" className="btn btn-ghost">Back to live</Link>
          </p>
        </div>
      </section>
    );
  }

  const minute = m.status.kind === 'LIVE' ? m.status.minute : m.status.kind === 'FT' ? 90 : 0;
  const progressPct = Math.min(100, (minute / 90) * 100);
  const isFootball = m.sport === 'Football';

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-8))' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          {/* Header */}
          <div
            style={{
              padding: 'var(--s-5)',
              borderBottom: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center'
            }}
          >
            <div />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Live Match</div>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  color: statusColor(m.status),
                  marginTop: 2
                }}
              >
                {statusLabel(m.status).toUpperCase()}
              </div>
            </div>
            <div style={{ justifySelf: 'end' }}>
              <button
                onClick={() => router.push('/live')}
                className="btn btn-ghost btn-sm"
                aria-label="Close"
                style={{ padding: 6, borderRadius: 'var(--r-pill)' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Goal toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-pill)',
                  padding: '8px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  zIndex: 5
                }}
              >
                <span style={{ fontSize: 16 }}>{toast.team === 'home' ? m.home.flag : m.away.flag}</span>
                <span>GOAL! {toast.scorer}{toast.assist ? ` (${toast.assist})` : ''}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scoreline */}
          <div style={{ padding: 'var(--s-6) var(--s-5) var(--s-4)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: 'var(--s-4)'
              }}
            >
              <TeamBlock team={m.home} lastGoal={lastHomeGoal} />
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(2.4rem, 7vw, 3.4rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}
              >
                {m.scoreHome} <span style={{ color: 'var(--text-faint)' }}>-</span> {m.scoreAway}
              </div>
              <TeamBlock team={m.away} lastGoal={lastAwayGoal} />
            </div>

            {(m.venue || m.city) && (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 'var(--s-4)',
                  fontSize: 13,
                  color: 'var(--text-dim)'
                }}
              >
                {m.venue && <span style={{ color: 'var(--text)' }}>{m.venue}</span>}
                {m.city && <> · {m.city}</>}
                {m.capacity && <> · {m.capacity.toLocaleString()} cap.</>}
              </div>
            )}

            {/* Timeline bar — football only */}
            {isFootball && (
              <div style={{ marginTop: 'var(--s-5)' }}>
                <div
                  className="mono"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginBottom: 6
                  }}
                >
                  <span>0&apos;</span>
                  <span style={{ color: 'var(--positive)' }}>{minute}&apos;</span>
                  <span>90&apos;</span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: 'var(--border)',
                    borderRadius: 'var(--r-pill)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${progressPct}%`,
                      height: '100%',
                      background: 'var(--positive)',
                      transition: 'width 0.6s var(--ease-out)'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pitch — football only */}
          {isFootball && (
            <div style={{ padding: '0 var(--s-5) var(--s-5)' }}>
              <Pitch home={m.home} away={m.away} goals={m.goals} minute={minute} />
            </div>
          )}

          {/* Possession — only if defined */}
          {typeof m.possessionHome === 'number' && (
            <div style={{ padding: '0 var(--s-5) var(--s-5)' }}>
              <div
                style={{
                  height: 6,
                  background: 'var(--border)',
                  borderRadius: 'var(--r-pill)',
                  overflow: 'hidden',
                  display: 'flex'
                }}
              >
                <div style={{ width: `${m.possessionHome}%`, background: 'var(--positive)' }} />
                <div style={{ width: `${100 - m.possessionHome}%`, background: 'var(--text-faint)' }} />
              </div>
              <div
                className="mono"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  marginTop: 6,
                  letterSpacing: '0.08em'
                }}
              >
                <span style={{ color: 'var(--positive)' }}>{m.home.short} {m.possessionHome}%</span>
                <span style={{ color: 'var(--text-muted)' }}>POSSESSION</span>
                <span style={{ color: 'var(--text-dim)' }}>{100 - m.possessionHome}% {m.away.short}</span>
              </div>
            </div>
          )}

          {/* Coach cards */}
          {(m.home.coach || m.away.coach) && (
            <div
              style={{
                padding: '0 var(--s-5) var(--s-5)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--s-3)'
              }}
            >
              {m.home.coach && <CoachCard team={m.home} />}
              {m.away.coach && <CoachCard team={m.away} />}
            </div>
          )}

          {/* Tabs */}
          <div
            style={{
              borderTop: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr) auto',
              alignItems: 'center'
            }}
          >
            <TabBtn active={tab === 'stats'}      onClick={() => setTab('stats')}      icon={<BarChart3 size={14} />}   label="Statistics" />
            <TabBtn active={tab === 'commentary'} onClick={() => setTab('commentary')} icon={<ListOrdered size={14} />} label="Commentary" />
            <TabBtn active={tab === 'squad'}      onClick={() => setTab('squad')}      icon={<Users size={14} />}       label="Squad" />
            <button
              className="btn btn-ghost btn-sm"
              aria-label="Chat"
              style={{ padding: 10, marginRight: 8, borderRadius: 'var(--r-pill)' }}
            >
              <MessageCircle size={15} />
            </button>
          </div>

          {/* Tab body */}
          <div style={{ padding: 'var(--s-5)' }}>
            {tab === 'stats' && (m.stats.length > 0 ? <StatsTable match={m} /> : <Empty msg="No stats yet — match has not started." />)}
            {tab === 'commentary' && <Empty msg="Live commentary feed coming soon." />}
            {tab === 'squad'      && <Empty msg="Starting XIs and substitutes will appear here." />}
          </div>
        </div>

        <div style={{ marginTop: 'var(--s-4)', textAlign: 'center' }}>
          <Link href="/live" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            ← All matches
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Sub-components --------------------------- */

function TeamBlock({ team, lastGoal }: { team: Side; lastGoal?: GoalEvent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 52,
          height: 36,
          fontSize: 30,
          lineHeight: '36px',
          textAlign: 'center',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))'
        }}
      >
        {team.flag}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{team.name}</div>
      {lastGoal && (
        <div
          className="mono"
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--positive)' }} />
          {lastGoal.scorer} {lastGoal.minute}&apos;
        </div>
      )}
    </div>
  );
}

function Pitch({ home, away, goals, minute }: { home: Side; away: Side; goals: GoalEvent[]; minute: number }) {
  const players = [
    { x: 22, y: 60 }, { x: 35, y: 40 }, { x: 48, y: 55 }, { x: 60, y: 35 }, { x: 72, y: 60 }, { x: 82, y: 45 }
  ];
  const goal = goals[goals.length - 1];

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-strong)'
      }}
    >
      <svg viewBox="0 0 200 110" width="100%" style={{ display: 'block', background: '#1F7A3A' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={i}
            x={(i * 200) / 6}
            y={0}
            width={200 / 6}
            height={110}
            fill={i % 2 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
          />
        ))}
        <rect x={3} y={3} width={194} height={104} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={0.6} />
        <line x1={100} y1={3} x2={100} y2={107} stroke="rgba(255,255,255,0.55)" strokeWidth={0.6} />
        <circle cx={100} cy={55} r={11} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={0.6} />
        <circle cx={100} cy={55} r={0.8} fill="rgba(255,255,255,0.55)" />
        <rect x={3} y={28} width={26} height={54} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={0.6} />
        <rect x={3} y={42} width={10} height={26} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={0.6} />
        <rect x={171} y={28} width={26} height={54} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={0.6} />
        <rect x={187} y={42} width={10} height={26} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={0.6} />

        <text x={6} y={10} fontSize={5} fill="rgba(255,255,255,0.8)" fontFamily="monospace">{home.short}</text>
        <text x={186} y={10} fontSize={5} fill="rgba(255,255,255,0.8)" fontFamily="monospace">{away.short}</text>

        {players.map((p, i) => (
          <circle key={i} cx={p.x * 2} cy={p.y} r={1.6} fill="#5EA9FF" stroke="rgba(0,0,0,0.4)" strokeWidth={0.3} />
        ))}
        <circle cx={96} cy={62} r={1.8} fill="#FFFFFF" stroke="#000" strokeWidth={0.3} />

        {goal && (
          <g>
            <circle cx={goal.x * 2} cy={goal.y} r={2.2} fill="#FF3B5C" />
            <text x={goal.x * 2 + 4} y={goal.y - 4} fontSize={4} fill="#fff" fontFamily="monospace">
              {(goal.team === 'home' ? home.short : away.short)} · GOAL · {goal.scorer.toUpperCase()}
            </text>
          </g>
        )}
      </svg>

      {goal && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 12,
            background: 'rgba(10, 10, 15, 0.85)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-pill)',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
            backdropFilter: 'blur(6px)'
          }}
        >
          <span style={{ fontSize: 14 }}>{goal.team === 'home' ? home.flag : away.flag}</span>
          <span style={{ color: 'var(--positive)' }}>GOAL</span>
          <span>{goal.scorer}</span>
        </div>
      )}

      <div
        style={{
          background: '#0E0E15',
          padding: '6px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border)'
        }}
      >
        <div className="row gap-1" style={{ alignItems: 'center' }}>
          {[0, 15, 30, 45, 60, 75, 90].map((mm) => {
            const passed = mm <= minute;
            const goalHere = goals.some((g) => Math.abs(g.minute - mm) <= 2);
            return (
              <span
                key={mm}
                title={`${mm}'`}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: goalHere ? '#FFB020' : passed ? '#5EEAD4' : '#2D2D3A',
                  display: 'inline-block'
                }}
              />
            );
          })}
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          0  15  30  45  60  75  90
        </div>
      </div>
    </div>
  );
}

function CoachCard({ team }: { team: Side }) {
  return (
    <div className="card" style={{ padding: 'var(--s-3) var(--s-4)', background: 'var(--bg-elevated)' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
        {team.short} COACH
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{team.coach}</div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '14px 8px',
        background: 'transparent',
        border: 'none',
        color: active ? 'var(--positive)' : 'var(--text-dim)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }}
    >
      {icon}
      {label}
      {active && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            left: '20%',
            right: '20%',
            height: 2,
            background: 'var(--positive)',
            borderRadius: 2
          }}
        />
      )}
    </button>
  );
}

function StatsTable({ match }: { match: LiveMatch }) {
  return (
    <div className="stack-3">
      <div
        className="mono"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          fontSize: 12,
          letterSpacing: '0.14em',
          padding: '0 4px var(--s-2)'
        }}
      >
        <span style={{ textAlign: 'center', color: 'var(--positive)' }}>{match.home.short}</span>
        <span />
        <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{match.away.short}</span>
      </div>

      {match.stats.map((s) => {
        const total = Math.max(1, s.home + s.away);
        const homePct = (s.home / total) * 100;
        const awayPct = (s.away / total) * 100;
        return (
          <div
            key={s.label}
            style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr auto 1fr 32px',
              alignItems: 'center',
              gap: 'var(--s-3)',
              padding: '8px 4px'
            }}
          >
            <span className="mono" style={{ fontSize: 16, fontWeight: 700, textAlign: 'right' }}>{s.home}</span>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div
                style={{
                  width: `${homePct}%`,
                  height: 5,
                  background: s.home >= s.away ? 'var(--positive)' : '#FF4D6D',
                  borderRadius: 'var(--r-pill)',
                  opacity: s.home === 0 ? 0 : 1
                }}
              />
            </div>
            <span
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                padding: '0 8px',
                textAlign: 'center'
              }}
            >
              {s.label}
            </span>
            <div>
              <div
                style={{
                  width: `${awayPct}%`,
                  height: 5,
                  background: s.away >= s.home ? '#FF4D6D' : 'var(--positive)',
                  borderRadius: 'var(--r-pill)',
                  opacity: s.away === 0 ? 0 : 1
                }}
              />
            </div>
            <span className="mono" style={{ fontSize: 16, fontWeight: 700 }}>{s.away}</span>
          </div>
        );
      })}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div style={{ padding: 'var(--s-6) 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      {msg}
    </div>
  );
}
