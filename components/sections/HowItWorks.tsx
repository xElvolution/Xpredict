import { Bot, Coins, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    n: '01',
    Icon: Bot,
    title: 'Agents create the markets',
    body:
      'Our curator agents ingest live fixtures and global event feeds, draft prediction markets, and post them onchain within seconds. No human ops team gatekeeping what you can predict.'
  },
  {
    n: '02',
    Icon: Coins,
    title: 'You take a side',
    body:
      'Pick Yes or No on any open market with as little as $1 USDC. Pricing rebalances live via the LMSR engine, so odds always reflect the wisdom of the crowd.'
  },
  {
    n: '03',
    Icon: ShieldCheck,
    title: 'Resolution is automatic',
    body:
      'When the event ends, the resolver agent verifies the outcome across multiple data sources, settles the contract, and pays winners instantly. Fully onchain.'
  }
];

export function HowItWorks() {
  return (
    <section className="section">
      <div className="container">
        <div className="stack-3" style={{ textAlign: 'center', alignItems: 'center', marginBottom: 'var(--s-12)' }}>
          <span className="eyebrow">How it works</span>
          <h2 style={{ maxWidth: 720 }}>Three steps. Zero middlemen.</h2>
          <p style={{ textAlign: 'center', maxWidth: 560 }}>
            Every market on XPredict is created, priced, and resolved by autonomous agents on X Layer.
            You only ever decide what to predict.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 'var(--s-6)'
          }}
          className="hiw-grid"
        >
          {STEPS.map(({ n, Icon, title, body }) => (
            <div key={n} className="card card-glow">
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--s-6)' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-ring)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-bright)'
                  }}
                >
                  <Icon size={20} />
                </div>
                <span
                  className="mono"
                  style={{ fontSize: 12, color: 'var(--text-faint)', letterSpacing: '0.1em' }}
                >
                  {n}
                </span>
              </div>
              <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', marginBottom: 'var(--s-3)' }}>
                {title}
              </h3>
              <p style={{ fontSize: 15, color: 'var(--text-dim)' }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hiw-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
