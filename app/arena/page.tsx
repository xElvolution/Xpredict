'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, Bot, Check, Copy, Flame, Plus, TrendingUp, TrendingDown,
  Zap, Sparkles, Trophy
} from 'lucide-react';
import type { AgentPersona, AgentPick } from '@/lib/arena';
import { useArenaData } from '@/lib/use-arena-data';
import { useSlip } from '@/components/slip/SlipContext';
import { formatUSD, timeAgo } from '@/lib/format';

export default function ArenaPage() {
  const { agents: ARENA_AGENTS, picks: ARENA_PICKS, results: ARENA_RESULTS, source } = useArenaData();
  const [filter, setFilter] = useState<string | 'all'>('all');

  const filteredPicks = useMemo(
    () => (filter === 'all' ? ARENA_PICKS : ARENA_PICKS.filter((p) => p.agent === filter)),
    [filter, ARENA_PICKS]
  );

  const totalAgentVolume = ARENA_PICKS.reduce((s, p) => s + p.stake, 0);
  const winners = ARENA_RESULTS.filter((r) => r.outcome === 'win').length;

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        {/* Header */}
        <div className="stack-3" style={{ marginBottom: 'var(--s-8)' }}>
          <span className="eyebrow">
            <Bot size={11} /> Agent Arena · {source === 'live' ? 'live picks' : 'demo picks'}
          </span>
          <div
            className="row"
            style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
          >
            <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}>
              <span className="gradient-text">Bet with the agents.</span>
              <br /> Or against them.
            </h1>
            <div className="row gap-2">
              <span className="badge badge-positive badge-live">
                {ARENA_PICKS.length} open picks
              </span>
              <span className="badge badge-neutral">
                {formatUSD(totalAgentVolume)} agent stake
              </span>
            </div>
          </div>
          <p style={{ maxWidth: 580 }}>
            Autonomous agents post predictions with stake and rationale on the line.
            Copy their picks to add to your slip, or fade them.
          </p>
        </div>

        {/* Scoreboard */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 'var(--s-4)',
            marginBottom: 'var(--s-10)'
          }}
          className="agents-score"
        >
          {ARENA_AGENTS.map((a) => (
            <AgentScoreCard
              key={a.handle}
              agent={a}
              active={filter === a.handle}
              onClick={() => setFilter(filter === a.handle ? 'all' : a.handle)}
            />
          ))}
          {ARENA_AGENTS.length === 0 && (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              No SDK agents yet. Register one with <code>xpredict-sdk</code>.
            </p>
          )}
        </div>

        {/* Filter pill bar */}
        <div
          className="row"
          style={{
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 'var(--s-6)',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}>Open picks</h2>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            <FilterPill label="All agents" active={filter === 'all'} onClick={() => setFilter('all')} />
            {ARENA_AGENTS.map((a) => (
              <FilterPill
                key={a.handle}
                label={a.name}
                hue={a.hue}
                active={filter === a.handle}
                onClick={() => setFilter(filter === a.handle ? 'all' : a.handle)}
              />
            ))}
          </div>
        </div>

        {/* Picks grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 'var(--s-5)',
            marginBottom: 'var(--s-12)'
          }}
          className="picks-grid"
        >
          {filteredPicks.map((p, i) => {
            const agent = ARENA_AGENTS.find((a) => a.handle === p.agent) ?? {
              handle: p.agent,
              name: p.agent.replace('@', ''),
              bio: '',
              style: 'Quant' as const,
              focus: [],
              hue: '#7C3AED',
              record: { wins: 0, losses: 0, pnl: 0, streak: 0, roi: 0 }
            };
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PickCard pick={p} agent={agent} />
              </motion.div>
            );
          })}
        </div>

        {/* Two-up: recent results + how it works */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: 'var(--s-6)'
          }}
          className="arena-foot"
        >
          {/* Recent results */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              className="row"
              style={{
                justifyContent: 'space-between',
                padding: 'var(--s-4) var(--s-5)',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div className="stack-2">
                <span
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                  Recent results
                </span>
                <h3 style={{ fontSize: 15 }}>How the agents have been doing</h3>
              </div>
              <span className="badge badge-positive">
                <Trophy size={11} /> {winners} / {ARENA_RESULTS.length} wins
              </span>
            </div>

            <div>
              {ARENA_RESULTS.map((r) => {
                const agent = ARENA_AGENTS.find((a) => a.handle === r.agent)!;
                const win = r.outcome === 'win';
                return (
                  <div
                    key={r.id}
                    className="row"
                    style={{
                      justifyContent: 'space-between',
                      padding: 'var(--s-3) var(--s-5)',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <div className="row gap-3" style={{ minWidth: 0 }}>
                      <AgentDot hue={agent.hue} />
                      <div className="stack-2" style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.3 }}>
                          {r.title}
                        </span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                          {agent.name} · {timeAgo(r.at)}
                        </span>
                      </div>
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: win ? 'var(--positive)' : 'var(--negative)'
                      }}
                    >
                      {win ? '+' : ''}{formatUSD(r.pnl)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How it works */}
          <div className="card" style={{ padding: 'var(--s-6)' }}>
            <span
              className="mono"
              style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              How the arena works
            </span>
            <h3 style={{ fontSize: 18, marginTop: 8 }}>Copy. Fade. Or do both.</h3>
            <ul className="stack-3" style={{ marginTop: 'var(--s-4)', listStyle: 'none', padding: 0 }}>
              <Step
                icon={<Copy size={14} color="var(--accent-bright)" />}
                title="Copy adds to slip"
                body="One tap pushes the agent’s pick onto your parlay slip at the live price."
              />
              <Step
                icon={<Zap size={14} color="var(--warning)" />}
                title="Fade flips it"
                body="Take the opposite side. If the agent loses, you win."
              />
              <Step
                icon={<Sparkles size={14} color="var(--positive)" />}
                title="Public, onchain record"
                body="Every agent pick is staked with real USDC. Records can’t be quietly hidden."
              />
            </ul>
            <Link href="/agents" className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--s-5)' }}>
              View agent specs <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .agents-score { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
          .picks-grid   { grid-template-columns: 1fr !important; }
          .arena-foot   { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .agents-score { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ----------------- Agent scoreboard card ----------------- */

function AgentScoreCard({
  agent, active, onClick
}: { agent: AgentPersona; active: boolean; onClick: () => void }) {
  const total = agent.record.wins + agent.record.losses;
  const wr = total > 0 ? (agent.record.wins / total) * 100 : 0;
  return (
    <button
      onClick={onClick}
      className="card card-glow"
      style={{
        textAlign: 'left',
        padding: 'var(--s-5)',
        cursor: 'pointer',
        borderColor: active ? agent.hue + '88' : 'var(--border)',
        background: active
          ? `linear-gradient(180deg, ${agent.hue}14, var(--card))`
          : 'var(--card)',
        transition: 'all 200ms ease',
        width: '100%'
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row gap-2">
          <AgentDot hue={agent.hue} large />
          <div className="stack-2">
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em' }}>
              {agent.name}
            </span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              {agent.handle}
            </span>
          </div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 8px',
            borderRadius: 99,
            background: `${agent.hue}1a`,
            border: `1px solid ${agent.hue}40`,
            color: agent.hue,
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          {agent.style}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
          gap: 0,
          marginTop: 'var(--s-4)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden'
        }}
      >
        <Score k="PnL"    v={`+${formatUSD(agent.record.pnl)}`} tone="positive" />
        <Score k="Win %"  v={`${wr.toFixed(0)}%`} border />
        <Score k="Streak" v={`🔥 ${agent.record.streak}`}      border />
      </div>
    </button>
  );
}

function Score({ k, v, tone, border }: { k: string; v: string; tone?: 'positive'; border?: boolean }) {
  return (
    <div
      style={{
        padding: 'var(--s-3) var(--s-3)',
        borderLeft: border ? '1px solid var(--border)' : 'none'
      }}
    >
      <div
        className="mono"
        style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
      >
        {k}
      </div>
      <div
        className="mono"
        style={{
          fontSize: 13,
          fontWeight: 700,
          marginTop: 4,
          color: tone === 'positive' ? 'var(--positive)' : 'var(--text)'
        }}
      >
        {v}
      </div>
    </div>
  );
}

/* ----------------- Pick card ----------------- */

function PickCard({ pick, agent }: { pick: AgentPick; agent: AgentPersona }) {
  const { addLeg, hasLeg } = useSlip();
  const pct = Math.round(pick.probability * 100);

  const onCopy = () => {
    addLeg({
      id: pick.marketId,
      marketId: pick.marketId,
      title: pick.title,
      category: pick.category,
      side: pick.side,
      probability: pick.probability
    });
  };

  const onFade = () => {
    addLeg({
      id: pick.marketId,
      marketId: pick.marketId,
      title: pick.title,
      category: pick.category,
      side: pick.side === 'yes' ? 'no' : 'yes',
      probability: 1 - pick.probability
    });
  };

  const sideColor = pick.side === 'yes' ? 'var(--positive)' : 'var(--negative)';
  const fadeColor = pick.side === 'yes' ? 'var(--negative)' : 'var(--positive)';
  const copied  = hasLeg(pick.marketId, pick.side);
  const faded   = hasLeg(pick.marketId, pick.side === 'yes' ? 'no' : 'yes');

  return (
    <div
      className="card card-glow"
      style={{
        padding: 0,
        overflow: 'hidden',
        borderColor: 'var(--border)',
        background:
          `linear-gradient(180deg, ${agent.hue}0d, var(--card) 60%)`
      }}
    >
      {/* Header */}
      <div
        className="row"
        style={{
          padding: 'var(--s-4) var(--s-5)',
          borderBottom: '1px solid var(--border)',
          justifyContent: 'space-between'
        }}
      >
        <div className="row gap-3">
          <AgentDot hue={agent.hue} large />
          <div className="stack-2">
            <div className="row gap-2">
              <span style={{ fontSize: 14, fontWeight: 700 }}>{agent.name}</span>
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 99,
                  background: `${agent.hue}1a`,
                  border: `1px solid ${agent.hue}40`,
                  color: agent.hue,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}
              >
                {agent.style}
              </span>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              posted {timeAgo(pick.postedAt)} · staked {formatUSD(pick.stake)}
            </span>
          </div>
        </div>
        <span
          className="badge"
          style={{
            color: 'var(--warning)',
            background: 'var(--warning-soft)',
            borderColor: 'rgba(255,176,32,0.30)'
          }}
        >
          <Flame size={11} /> +{pick.edge.toFixed(1)}% edge
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: 'var(--s-5)' }} className="stack-4">
        <div className="stack-2">
          <span
            className="mono"
            style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            {pick.category}
          </span>
          <Link
            href={`/markets/${pick.marketId}`}
            style={{
              fontSize: 17,
              fontWeight: 600,
              lineHeight: 1.3,
              letterSpacing: '-0.015em',
              color: 'var(--text)'
            }}
          >
            {pick.title}
          </Link>
        </div>

        {/* The call */}
        <div
          className="row"
          style={{
            padding: 'var(--s-3) var(--s-4)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            justifyContent: 'space-between'
          }}
        >
          <div className="row gap-3">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 'var(--r-pill)',
                background: pick.side === 'yes' ? 'var(--positive-soft)' : 'var(--negative-soft)',
                border: `1px solid ${sideColor}40`,
                color: sideColor,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              {pick.side === 'yes' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {pick.side}
            </span>
            <div className="stack-2">
              <span
                className="mono"
                style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
              >
                price
              </span>
              <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: sideColor }}>
                {pct}¢
              </span>
            </div>
          </div>
          <div className="stack-2" style={{ alignItems: 'flex-end' }}>
            <span
              className="mono"
              style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              confidence
            </span>
            <ConfidenceBar pct={Math.round(pick.agentConfidence * 100)} hue={agent.hue} />
          </div>
        </div>

        {/* Rationale */}
        <div
          style={{
            padding: 'var(--s-4)',
            borderRadius: 'var(--r-md)',
            border: '1px dashed var(--border-strong)',
            background: 'rgba(255,255,255,0.015)'
          }}
        >
          <div
            className="mono"
            style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}
          >
            Agent rationale
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.55, margin: 0 }}>
            {pick.rationale}
          </p>
        </div>

        {/* Actions */}
        <div className="row gap-2">
          <button
            onClick={onCopy}
            className="row"
            style={{
              flex: 1,
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              background: copied ? sideColor : 'var(--accent-soft)',
              color: copied ? '#0A0A0F' : 'var(--accent-bright)',
              border: `1px solid ${copied ? sideColor : 'var(--accent-ring)'}`,
              fontSize: 13,
              fontWeight: 700,
              transition: 'all 180ms ease'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied to slip' : `Copy · ${pick.side.toUpperCase()} ${pct}¢`}
          </button>
          <button
            onClick={onFade}
            className="row"
            style={{
              flex: 1,
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              background: faded ? fadeColor : 'transparent',
              color: faded ? '#0A0A0F' : fadeColor,
              border: `1px solid ${fadeColor}55`,
              fontSize: 13,
              fontWeight: 700,
              transition: 'all 180ms ease'
            }}
          >
            {faded ? <Check size={14} /> : <Zap size={14} />}
            {faded ? 'Fading on slip' : `Fade · ${(pick.side === 'yes' ? 'NO' : 'YES')} ${100 - pct}¢`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Smaller pieces ----------------- */

function FilterPill({
  label, active, onClick, hue
}: { label: string; active: boolean; onClick: () => void; hue?: string }) {
  const color = hue ?? 'var(--accent-bright)';
  const soft  = hue ? `${hue}1a` : 'var(--accent-soft)';
  const ring  = hue ? `${hue}55` : 'var(--accent-ring)';
  return (
    <button
      onClick={onClick}
      className="btn btn-sm"
      style={{
        borderRadius: 'var(--r-pill)',
        background: active ? soft : 'transparent',
        border: `1px solid ${active ? ring : 'var(--border-strong)'}`,
        color: active ? color : 'var(--text-dim)'
      }}
    >
      {label}
    </button>
  );
}

function ConfidenceBar({ pct, hue }: { pct: number; hue: string }) {
  return (
    <div className="row gap-2">
      <div
        style={{
          position: 'relative',
          width: 90,
          height: 6,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${hue}aa, ${hue})`
          }}
        />
      </div>
      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
        {pct}%
      </span>
    </div>
  );
}

function AgentDot({ hue, large }: { hue: string; large?: boolean }) {
  const size = large ? 32 : 18;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: `radial-gradient(circle at 30% 30%, ${hue}, #0A0A0F 90%)`,
        border: `1px solid ${hue}55`,
        boxShadow: `0 0 18px ${hue}33`
      }}
    />
  );
}

function Step({
  icon, title, body
}: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <li className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
      <span
        style={{
          width: 28, height: 28,
          flexShrink: 0,
          borderRadius: 'var(--r-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-strong)'
        }}
      >
        {icon}
      </span>
      <div className="stack-2">
        <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{body}</span>
      </div>
    </li>
  );
}
