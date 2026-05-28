const STATS = [
  { value: '$48.2M', label: 'Volume traded',     sub: 'last 30 days' },
  { value: '1,284',  label: 'Open markets',      sub: 'auto-created' },
  { value: '99.4%',  label: 'Resolution rate',   sub: 'agent accuracy' },
  { value: '21.9K',  label: 'Active predictors', sub: 'this week' },
  { value: '<2s',    label: 'Settlement time',   sub: 'X Layer block' },
  { value: '$0.001', label: 'Average gas',       sub: 'per prediction' }
];

export function StatsBand() {
  return (
    <section
      style={{
        padding: 'var(--s-16) 0',
        background:
          'linear-gradient(180deg, rgba(124, 58, 237, 0.04), rgba(124, 58, 237, 0))',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
          pointerEvents: 'none'
        }}
      />
      <div className="container" style={{ position: 'relative' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
            gap: 0
          }}
          className="stats-grid"
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: 'var(--s-6) var(--s-4)',
                borderLeft: i === 0 ? 'none' : '1px solid var(--border)',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(1.75rem, 2.4vw, 2.25rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(180deg, #FFFFFF, #C4B6FF)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                {s.value}
              </div>
              <div
                className="mono"
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--text-muted)'
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(3, minmax(0,1fr)) !important; }
          .stats-grid > div:nth-child(4) { border-left: none !important; border-top: 1px solid var(--border); }
          .stats-grid > div:nth-child(5),
          .stats-grid > div:nth-child(6) { border-top: 1px solid var(--border); }
        }
        @media (max-width: 640px) { .stats-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
          .stats-grid > div { border-left: none !important; }
          .stats-grid > div:nth-child(odd) { border-right: 1px solid var(--border); }
          .stats-grid > div:nth-child(n+3) { border-top: 1px solid var(--border); }
        }
      `}</style>
    </section>
  );
}
