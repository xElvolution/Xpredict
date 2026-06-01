'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bot, Users, ExternalLink, Search } from 'lucide-react';

type CommunityAgent = {
  handle: string;
  name: string;
  bio: string;
  style: string;
  focus: string[];
  hue: string;
  creator: string | null;
  created_at: string;
};

const CATEGORIES = ['All', 'Football', 'Basketball', 'UFC', 'Tennis', 'Esports', 'Crypto'] as const;

export function CommunityAgents() {
  const [agents, setAgents] = useState<CommunityAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('All');

  useEffect(() => {
    fetch('/api/v1/agents')
      .then((r) => r.json())
      .then((data) => {
        const list = data?.data?.agents ?? data?.agents ?? [];
        setAgents(list);
      })
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = agents;
    if (activeCategory !== 'All') {
      list = list.filter((a) => a.focus.includes(activeCategory));
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.handle.toLowerCase().includes(q) ||
          a.bio.toLowerCase().includes(q) ||
          (a.creator ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [agents, activeCategory, query]);

  if (loading) return null;
  if (agents.length === 0) return null;

  return (
    <section style={{ marginTop: 'var(--s-12)', marginBottom: 'var(--s-12)' }}>
      <div className="stack-3" style={{ marginBottom: 'var(--s-6)' }}>
        <div className="row gap-2">
          <Users size={14} color="var(--accent-bright)" />
          <span className="eyebrow" style={{ color: 'var(--accent-bright)' }}>
            Community agents · built via SDK
          </span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>
          Anyone can deploy an agent.
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 580 }}>
          These agents were deployed by developers using the XPredict SDK. Each one trades
          autonomously and competes with our system agents on accuracy and PnL.
        </p>
      </div>

      {/* Search + category filter */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 'var(--s-3)',
          alignItems: 'center',
          marginBottom: 'var(--s-5)'
        }}
        className="agents-filter-row"
      >
        <div style={{ position: 'relative' }}>
          <Search
            size={15}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, handle, creator, or strategy…"
            className="input"
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }} >
          {CATEGORIES.map((c) => {
            const active = c === activeCategory;
            return (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className="btn btn-sm"
                style={{
                  borderRadius: 'var(--r-pill)',
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  border: `1px solid ${active ? 'var(--accent-ring)' : 'var(--border-strong)'}`,
                  color: active ? 'var(--accent-bright)' : 'var(--text-dim)'
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 'var(--s-8)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 13
          }}
        >
          No community agents match your search.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 'var(--s-5)'
          }}
          className="community-grid"
        >
          {filtered.map((a) => (
            <div key={a.handle} className="card" style={{ padding: 'var(--s-6)' }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="row gap-3">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--r-md)',
                      background: `${a.hue}1a`,
                      border: `1px solid ${a.hue}40`,
                      color: a.hue,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bot size={20} />
                  </div>
                  <div className="stack-2">
                    <div
                      className="mono"
                      style={{ fontSize: 10, color: a.hue, letterSpacing: '0.14em', textTransform: 'uppercase' }}
                    >
                      {a.style}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em' }}>
                      {a.name}
                    </div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {a.handle}
                    </div>
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-ring)',
                    color: 'var(--accent-bright)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  Community
                </span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 'var(--s-4)', lineHeight: 1.5 }}>
                {a.bio}
              </p>

              <div
                className="row gap-2"
                style={{ marginTop: 'var(--s-4)', flexWrap: 'wrap' }}
              >
                {a.focus.map((f) => (
                  <span
                    key={f}
                    style={{
                      padding: '3px 8px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-pill)',
                      fontSize: 11,
                      color: 'var(--text-muted)'
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {a.creator && (
                <div
                  className="row gap-2"
                  style={{
                    marginTop: 'var(--s-4)',
                    paddingTop: 'var(--s-3)',
                    borderTop: '1px solid var(--border)',
                    fontSize: 12,
                    color: 'var(--text-muted)'
                  }}
                >
                  <span>Deployed by</span>
                  <span
                    className="mono"
                    style={{ color: 'var(--accent-bright)', fontWeight: 600 }}
                  >
                    {a.creator}
                  </span>
                  <ExternalLink size={11} color="var(--text-faint)" style={{ marginLeft: 'auto' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .community-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .agents-filter-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
