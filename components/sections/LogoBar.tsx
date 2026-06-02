const CATEGORIES = [
  { label: 'FIFA World Cup 2026' },
  { label: 'Premier League' },
  { label: 'NBA Playoffs' },
  { label: 'UFC' },
  { label: 'Roland Garros' },
  { label: 'LoL MSI' },
  { label: 'Crypto majors' }
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
            {items.map((c, i) => (
              <div key={i} style={{ color: 'var(--text-dim)' }}>
                <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
