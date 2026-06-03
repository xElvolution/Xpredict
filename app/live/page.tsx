'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  MATCHES,
  groupByLeague,
  statusLabel,
  statusColor,
  type LiveMatch,
  type Sport
} from '@/lib/live-matches';

const SPORTS: { v: 'all' | Sport; label: string }[] = [
  { v: 'all',        label: 'All' },
  { v: 'Football',   label: 'Football' },
  { v: 'Basketball', label: 'Basketball' },
  { v: 'UFC',        label: 'UFC' },
  { v: 'Tennis',     label: 'Tennis' },
  { v: 'Esports',    label: 'Esports' }
];

type StatusFilter = 'all' | 'live' | 'upcoming' | 'finished';

const STATUS: { v: StatusFilter; label: string }[] = [
  { v: 'all',      label: 'All' },
  { v: 'live',     label: 'Live now' },
  { v: 'upcoming', label: 'Upcoming' },
  { v: 'finished', label: 'Finished' }
];

export default function LivePage() {
  const [sport, setSport] = useState<'all' | Sport>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  const liveCount = useMemo(() => MATCHES.filter((m) => m.status.kind === 'LIVE' || m.status.kind === 'HT').length, []);

  const filtered = useMemo(() => {
    return MATCHES.filter((m) => {
      if (sport !== 'all' && m.sport !== sport) return false;
      if (status === 'live'     && !(m.status.kind === 'LIVE' || m.status.kind === 'HT')) return false;
      if (status === 'upcoming' && m.status.kind !== 'SCHEDULED') return false;
      if (status === 'finished' && m.status.kind !== 'FT')        return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !m.home.name.toLowerCase().includes(q) &&
          !m.away.name.toLowerCase().includes(q) &&
          !m.league.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [sport, status, query]);

  const groups = useMemo(() => groupByLeague(filtered), [filtered]);

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-8))' }}>
      <div className="container" style={{ maxWidth: 880 }}>
        {/* Hero */}
        <div className="stack-3" style={{ marginBottom: 'var(--s-6)' }}>
          <span className="eyebrow">Live</span>
          <div
            className="row"
            style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
          >
            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>Live scores</h1>
            <span className="badge badge-positive badge-live">
              {liveCount} live now
            </span>
          </div>
          <p style={{ maxWidth: 580, color: 'var(--text-dim)' }}>
            Pick a match to see the scoreline, pitch view, possession and full stats. Updates stream
            from the agents and venue feeds.
          </p>
        </div>

        {/* Search */}
        <div
          className="card"
          style={{
            padding: '6px 10px 6px 14px',
            marginBottom: 'var(--s-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams or leagues"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontSize: 14,
              padding: '8px 0'
            }}
          />
        </div>

        {/* Sport filter chips */}
        <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 'var(--s-3)' }}>
          {SPORTS.map((s) => {
            const active = sport === s.v;
            return (
              <button
                key={s.v}
                onClick={() => setSport(s.v)}
                className="btn btn-sm"
                style={{
                  borderRadius: 'var(--r-pill)',
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  border: `1px solid ${active ? 'var(--accent-ring)' : 'var(--border-strong)'}`,
                  color: active ? 'var(--accent-bright)' : 'var(--text-dim)'
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Status filter chips */}
        <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 'var(--s-6)' }}>
          {STATUS.map((s) => {
            const active = status === s.v;
            return (
              <button
                key={s.v}
                onClick={() => setStatus(s.v)}
                className="btn btn-sm"
                style={{
                  borderRadius: 'var(--r-pill)',
                  background: active ? 'var(--positive-soft)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(0,255,135,0.35)' : 'var(--border-strong)'}`,
                  color: active ? 'var(--positive)' : 'var(--text-dim)'
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Groups */}
        {groups.length === 0 ? (
          <div className="card" style={{ padding: 'var(--s-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matches match your filters.
          </div>
        ) : (
          <div className="stack-5">
            {groups.map((g) => (
              <LeagueGroup key={`${g.sport}::${g.league}`} title={g.league} flag={g.flag} sport={g.sport} matches={g.matches} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LeagueGroup({
  title,
  flag,
  sport,
  matches
}: {
  title: string;
  flag?: string;
  sport: Sport;
  matches: LiveMatch[];
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '10px 14px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {flag && <span style={{ fontSize: 16 }}>{flag}</span>}
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </span>
        </div>
        <span
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}
        >
          {sport}
        </span>
      </div>

      <div>
        {matches.map((m, i) => (
          <MatchRow key={m.id} match={m} divider={i < matches.length - 1} />
        ))}
      </div>
    </div>
  );
}

function MatchRow({ match, divider }: { match: LiveMatch; divider: boolean }) {
  const isLive = match.status.kind === 'LIVE' || match.status.kind === 'HT';
  return (
    <Link
      href={`/live/${match.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '64px 1fr 56px',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderBottom: divider ? '1px solid var(--border)' : 'none',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background var(--dur-1) var(--ease)'
      }}
      className="match-row"
    >
      {/* Status column */}
      <div
        className="mono"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4
        }}
      >
        {isLive && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--positive)',
              boxShadow: '0 0 8px var(--positive)'
            }}
          />
        )}
        <span style={{ fontSize: 12, fontWeight: 700, color: statusColor(match.status), whiteSpace: 'nowrap' }}>
          {statusLabel(match.status)}
        </span>
      </div>

      {/* Teams + score */}
      <div className="stack-2" style={{ minWidth: 0 }}>
        <TeamLine team={match.home} score={match.scoreHome} winning={match.scoreHome > match.scoreAway} />
        <TeamLine team={match.away} score={match.scoreAway} winning={match.scoreAway > match.scoreHome} />
      </div>

      {/* Chevron / sport icon */}
      <div
        style={{
          textAlign: 'right',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
          fontFamily: 'var(--font-mono)'
        }}
      >
        VIEW →
      </div>
    </Link>
  );
}

function TeamLine({
  team,
  score,
  winning
}: {
  team: { short: string; name: string; flag: string };
  score: number;
  winning: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr auto',
        alignItems: 'center',
        gap: 10,
        minWidth: 0
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>{team.flag}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: winning ? 700 : 500,
          color: winning ? 'var(--text)' : 'var(--text-dim)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {team.name}
      </span>
      <span
        className="mono"
        style={{
          fontSize: 16,
          fontWeight: winning ? 700 : 500,
          color: winning ? 'var(--text)' : 'var(--text-dim)',
          minWidth: 18,
          textAlign: 'right'
        }}
      >
        {score}
      </span>
    </div>
  );
}
