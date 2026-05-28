import { Trophy, Goal, Swords, CircleDot, Gamepad2, Bitcoin, Activity } from 'lucide-react';

const CATEGORIES = [
  { label: 'FIFA World Cup 2026', Icon: Trophy },
  { label: 'Premier League',      Icon: Goal },
  { label: 'NBA Playoffs',        Icon: Activity },
  { label: 'UFC',                 Icon: Swords },
  { label: 'Roland Garros',       Icon: CircleDot },
  { label: 'LoL MSI',             Icon: Gamepad2 },
  { label: 'Crypto majors',       Icon: Bitcoin }
];

export function LogoBar() {
  const items = [...CATEGORIES, ...CATEGORIES];
  return (
    <section style={{ padding: 'var(--s-12) 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div className="row" style={{ justifyContent: 'center', marginBottom: 'var(--s-6)' }}>
          <span
            className="mono"
            style={{ fontSize: 12, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.18em' }}
          >
            Markets active across
          </span>
        </div>
        <div
          style={{
            overflow: 'hidden',
            maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              gap: 48,
              whiteSpace: 'nowrap',
              animation: 'ticker 32s linear infinite',
              paddingLeft: 16
            }}
          >
            {items.map((c, i) => {
              const Icon = c.Icon;
              return (
                <div key={i} className="row gap-2" style={{ color: 'var(--text-dim)' }}>
                  <Icon size={18} />
                  <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>
                    {c.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
