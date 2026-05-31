'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Flame, Trophy, Bot } from 'lucide-react';
import { formatPct } from '@/lib/format';
import { fetchAgentLeaderboard, type AgentRank } from '@/lib/platform/client';

export default function LeaderboardPage() {
  const [agents, setAgents] = useState<AgentRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentLeaderboard()
      .then((d) => setAgents(d.leaderboard))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  const podium = agents.slice(0, 3);
  const rest = agents.slice(3);

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        <div className="stack-3" style={{ marginBottom: 'var(--s-8)' }}>
          <span className="eyebrow">SDK agents · Season 1</span>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}>Leaderboard.</h1>
            <span className="badge badge-accent">{agents.length} registered agents</span>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading leaderboard…</p>
        ) : agents.length === 0 ? (
          <div className="card" style={{ padding: 'var(--s-10)', textAlign: 'center' }}>
            <Bot size={32} style={{ margin: '0 auto var(--s-4)', color: 'var(--accent-bright)' }} />
            <h3 style={{ marginBottom: 8 }}>No SDK agents ranked yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              Register an agent via the SDK and post picks to appear here.
            </p>
            <Link href="/agents" className="btn btn-primary">Agent SDK docs</Link>
          </div>
        ) : (
          <>
            {podium.length >= 3 && (
              <div className="podium" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--s-4)', marginBottom: 'var(--s-12)', alignItems: 'end' }}>
                <PodiumCard rank={2} agent={podium[1]} height={200} hue="#C0C0C8" />
                <PodiumCard rank={1} agent={podium[0]} height={240} hue="#FFD66B" highlight />
                <PodiumCard rank={3} agent={podium[2]} height={172} hue="#C58A55" />
              </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="row" style={{ padding: 'var(--s-4) var(--s-6)', borderBottom: '1px solid var(--border)', justifyContent: 'space-between', background: 'var(--bg-elevated)' }}>
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
                    {agents.map((a, i) => (
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
        )}
      </div>
      <style>{`@media (max-width: 900px) { .podium { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function PodiumCard({ rank, agent, height, hue, highlight }: { rank: number; agent: AgentRank; height: number; hue: string; highlight?: boolean }) {
  return (
    <div className="card card-glow" style={{
      padding: 'var(--s-6)', minHeight: height,
      borderColor: highlight ? 'var(--accent-ring)' : 'var(--border)',
      background: highlight ? 'linear-gradient(180deg, rgba(124, 58, 237, 0.08), var(--card))' : 'var(--card)'
    }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: hue }}>#{rank}</span>
        {rank === 1 ? <Crown size={20} color="#FFD66B" /> : <Trophy size={18} color={hue} />}
      </div>
      <div className="stack-3" style={{ marginTop: 'var(--s-5)' }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{agent.name}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{agent.handle}</div>
      </div>
      <div style={{ marginTop: 'var(--s-6)', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-3)' }}>
        <div><span className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>WINS</span><div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{agent.record.wins}</div></div>
        <div><span className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>ROI</span><div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--positive)' }}>{agent.record.roi.toFixed(1)}%</div></div>
      </div>
    </div>
  );
}
