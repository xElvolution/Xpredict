import { AGENTS } from '@/lib/data';
import { formatNumber, formatUSD, formatPct } from '@/lib/format';

const ROLE_META: Record<string, { hue: string; soft: string; description: string }> = {
  Curator:  { hue: 'var(--accent-bright)',  soft: 'var(--accent-soft)',   description: 'Drafts new prediction markets from live fixture feeds.' },
  Pricing:  { hue: '#5EEAD4',               soft: 'rgba(94,234,212,0.10)',description: 'Continuously rebalances odds with an LMSR engine.' },
  Resolver: { hue: 'var(--positive)',       soft: 'var(--positive-soft)', description: 'Verifies outcomes across data sources and settles contracts.' },
  Coach:    { hue: 'var(--warning)',        soft: 'var(--warning-soft)',  description: 'Shares stats and context, never directs your pick.' }
};

export function AgentRoster() {
  return (
    <section className="section">
      <div className="container">
        <div className="stack-3" style={{ textAlign: 'center', alignItems: 'center', marginBottom: 'var(--s-12)' }}>
          <span className="eyebrow">The agent stack</span>
          <h2 style={{ maxWidth: 760 }}>Four autonomous roles. One open marketplace.</h2>
          <p style={{ textAlign: 'center', maxWidth: 560 }}>
            Every market on XPredict passes through four specialized agents.
            They run 24/7, transparently, and anyone can extend them.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 'var(--s-4)'
          }}
          className="agent-grid"
        >
          {AGENTS.map((a) => {
            const meta = ROLE_META[a.role];
            return (
              <div key={a.handle} className="card" style={{ borderColor: 'var(--border)' }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--s-5)' }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--r-md)',
                      background: meta.soft,
                      border: `1px solid ${meta.hue}33`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: meta.hue,
                      fontWeight: 700,
                      fontSize: 13,
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {a.role[0]}
                  </div>
                  <span className="badge badge-positive badge-live">{a.status}</span>
                </div>

                <div
                  className="mono"
                  style={{ fontSize: 11, color: meta.hue, letterSpacing: '0.14em', textTransform: 'uppercase' }}
                >
                  {a.role}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>
                  {a.name}
                </div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {a.handle}
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 'var(--s-4)' }}>
                  {meta.description}
                </p>

                <div
                  className="row"
                  style={{
                    justifyContent: 'space-between',
                    marginTop: 'var(--s-6)',
                    paddingTop: 'var(--s-4)',
                    borderTop: '1px solid var(--border)'
                  }}
                >
                  {a.role === 'Curator' && (
                    <Stat k="Markets" v={formatNumber(a.marketsCreated)} />
                  )}
                  {a.role !== 'Curator' && a.accuracy > 0 && (
                    <Stat k="Accuracy" v={formatPct(a.accuracy, 1)} />
                  )}
                  <Stat k="Routed" v={formatUSD(a.volumeRouted)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .agent-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
        @media (max-width: 560px)  { .agent-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="stack-2">
      <span
        className="mono"
        style={{ fontSize: 10, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        {k}
      </span>
      <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
        {v}
      </span>
    </div>
  );
}
