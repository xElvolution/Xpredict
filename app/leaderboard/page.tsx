import { Crown, Flame, Trophy } from 'lucide-react';
import { LEADERBOARD } from '@/lib/data';
import { formatUSD, formatPct } from '@/lib/format';

const TIER_HUE = {
  Oracle: '#8B5CF6',
  Pro:    '#5EEAD4',
  Rookie: '#A1A1AA'
} as const;

export default function LeaderboardPage() {
  const podium = LEADERBOARD.slice(0, 3);
  const rest   = LEADERBOARD.slice(3);

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        {/* Header */}
        <div className="stack-3" style={{ marginBottom: 'var(--s-8)' }}>
          <span className="eyebrow">Season 1 · ends in 12d</span>
          <div
            className="row"
            style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
          >
            <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}>Leaderboard.</h1>
            <div className="row gap-2">
              <span className="badge badge-accent">Prize pool · $50,000</span>
              <span className="badge badge-neutral">21,907 predictors</span>
            </div>
          </div>
        </div>

        {/* Podium */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 'var(--s-4)',
            marginBottom: 'var(--s-12)',
            alignItems: 'end'
          }}
          className="podium"
        >
          {/* 2nd */}
          <PodiumCard rank={2} row={podium[1]} height={200} hue="#C0C0C8" />
          {/* 1st */}
          <PodiumCard rank={1} row={podium[0]} height={240} hue="#FFD66B" highlight />
          {/* 3rd */}
          <PodiumCard rank={3} row={podium[2]} height={172} hue="#C58A55" />
        </div>

        {/* Table */}
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
            <h3 style={{ fontSize: 15 }}>Top predictors · Season 1</h3>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              UPDATED LIVE
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>Rank</th>
                  <th>Predictor</th>
                  <th>Tier</th>
                  <th className="num">PnL</th>
                  <th className="num">Win rate</th>
                  <th className="num">Streak</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((r) => (
                  <tr key={r.rank}>
                    <td>
                      <span
                        className="mono"
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: r.rank <= 3 ? 'var(--accent-bright)' : 'var(--text-dim)'
                        }}
                      >
                        #{r.rank}
                      </span>
                    </td>
                    <td>
                      <div className="row gap-3">
                        <Avatar seed={r.player} />
                        <div className="stack-2" style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{r.player}</span>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                            {r.address}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <TierBadge tier={r.tier} />
                    </td>
                    <td className="num" style={{ color: 'var(--positive)', fontWeight: 600 }}>
                      +{formatUSD(r.pnl)}
                    </td>
                    <td className="num">{formatPct(r.winRate, 1)}</td>
                    <td className="num">
                      <span className="row gap-1" style={{ justifyContent: 'flex-end' }}>
                        <Flame size={12} color="var(--warning)" />
                        <span className="mono">{r.streak}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .podium { grid-template-columns: 1fr !important; align-items: stretch !important; }
        }
      `}</style>
    </section>
  );
}

function PodiumCard({
  rank, row, height, hue, highlight
}: {
  rank: number; row: typeof LEADERBOARD[number]; height: number; hue: string; highlight?: boolean;
}) {
  return (
    <div
      className="card card-glow"
      style={{
        position: 'relative',
        padding: 'var(--s-6)',
        minHeight: height,
        borderColor: highlight ? 'var(--accent-ring)' : 'var(--border)',
        background: highlight
          ? 'linear-gradient(180deg, rgba(124, 58, 237, 0.08), var(--card))'
          : 'var(--card)'
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div
          className="mono"
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: hue,
            letterSpacing: '0.05em'
          }}
        >
          #{rank}
        </div>
        {rank === 1 ? <Crown size={20} color="#FFD66B" /> : <Trophy size={18} color={hue} />}
      </div>

      <div className="stack-3" style={{ marginTop: 'var(--s-5)' }}>
        <Avatar seed={row.player} size={48} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em' }}>
            {row.player}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            {row.address}
          </div>
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
        <div className="stack-2">
          <span
            className="mono"
            style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            PnL
          </span>
          <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--positive)' }}>
            +{formatUSD(row.pnl)}
          </span>
        </div>
        <div className="stack-2">
          <span
            className="mono"
            style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Win rate
          </span>
          <span className="mono" style={{ fontSize: 18, fontWeight: 700 }}>
            {formatPct(row.winRate, 1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: 'Oracle' | 'Pro' | 'Rookie' }) {
  const hue = TIER_HUE[tier];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 'var(--r-pill)',
        background: `${hue}1a`,
        border: `1px solid ${hue}40`,
        color: hue,
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em'
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 99, background: hue }} />
      {tier}
    </span>
  );
}

function Avatar({ seed, size = 32 }: { seed: string; size?: number }) {
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
        border: '1px solid var(--border-strong)'
      }}
    />
  );
}

function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}
