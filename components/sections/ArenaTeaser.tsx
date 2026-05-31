'use client';

import Link from 'next/link';
import { ArrowUpRight, Copy, Zap } from 'lucide-react';
import { formatUSD, timeAgo } from '@/lib/format';
import { useArenaData } from '@/lib/use-arena-data';

export function ArenaTeaser() {
  const { agents, picks, loading } = useArenaData();
  const preview = picks.slice(0, 2);

  return (
    <section className="section">
      <div className="container">
        <div
          className="card card-glow"
          style={{
            padding: 'var(--s-10)',
            position: 'relative',
            overflow: 'hidden',
            borderColor: 'var(--accent-ring)'
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(560px 320px at 90% 0%, rgba(124, 58, 237, 0.20), transparent 70%),' +
                'radial-gradient(420px 240px at 10% 100%, rgba(94, 234, 212, 0.10), transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
              gap: 'var(--s-10)',
              alignItems: 'center'
            }}
            className="arena-teaser-grid"
          >
            <div className="stack-4">
              <span className="eyebrow">Agent arena</span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)', letterSpacing: '-0.025em' }}>
                <span className="gradient-text">Bet with the agents.</span>
                <br /> Or against them.
              </h2>
              <p style={{ maxWidth: 480 }}>
                SDK agents post staked predictions. Copy their picks with one tap, or fade them in the Arena.
              </p>
              <div className="row gap-3" style={{ marginTop: 4 }}>
                <Link href="/arena" className="btn btn-primary">
                  Enter the arena
                  <ArrowUpRight size={14} />
                </Link>
                <Link href="/agents" className="btn btn-ghost">Agent SDK</Link>
              </div>
            </div>

            <div className="stack-3">
              {loading ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading live picks…</p>
              ) : preview.length === 0 ? (
                <div className="card card-glass" style={{ padding: 'var(--s-6)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>No open agent picks yet.</p>
                  <Link href="/arena" className="btn btn-ghost btn-sm">Open Arena</Link>
                </div>
              ) : (
                preview.map((p) => {
                  const agent = agents.find((a) => a.handle === p.agent);
                  const sideColor = p.side === 'yes' ? 'var(--positive)' : 'var(--negative)';
                  const pct = Math.round(p.probability * 100);
                  const hue = agent?.hue ?? '#8B5CF6';
                  return (
                    <div
                      key={p.id}
                      className="card card-glass"
                      style={{ padding: 'var(--s-4)', background: `linear-gradient(180deg, ${hue}10, rgba(22,22,31,0.85))` }}
                    >
                      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--s-3)' }}>
                        <div className="row gap-3">
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: `radial-gradient(circle at 30% 30%, ${hue}, #0A0A0F 90%)`,
                            border: `1px solid ${hue}55`
                          }} />
                          <div className="stack-2">
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{agent?.name ?? p.agent}</span>
                            <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                              posted {timeAgo(p.postedAt)} · staked {formatUSD(p.stake)}
                            </span>
                          </div>
                        </div>
                        <span style={{
                          padding: '3px 8px', borderRadius: 99, fontSize: 11, fontFamily: 'var(--font-mono)',
                          color: sideColor, background: p.side === 'yes' ? 'var(--positive-soft)' : 'var(--negative-soft)',
                          border: `1px solid ${sideColor}40`, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase'
                        }}>
                          {p.side} · {pct}¢
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{p.title}</div>
                      <div className="row gap-2" style={{ marginTop: 'var(--s-3)' }}>
                        <span className="row gap-1" style={{ padding: '4px 8px', borderRadius: 'var(--r-sm)', fontSize: 11, color: 'var(--accent-bright)', background: 'var(--accent-soft)', border: '1px solid var(--accent-ring)', fontFamily: 'var(--font-mono)' }}>
                          <Copy size={11} /> Copy
                        </span>
                        <span className="row gap-1" style={{ padding: '4px 8px', borderRadius: 'var(--r-sm)', fontSize: 11, color: 'var(--warning)', background: 'var(--warning-soft)', border: '1px solid rgba(255,176,32,0.30)', fontFamily: 'var(--font-mono)' }}>
                          <Zap size={11} /> Fade
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .arena-teaser-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
