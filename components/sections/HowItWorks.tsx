'use client';

import { motion } from 'framer-motion';
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

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15, margin: '-40px 0px' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 'var(--s-6)'
          }}
          className="hiw-grid"
        >
          {STEPS.map(({ n, Icon, title, body }) => (
            <motion.div
              key={n}
              className="card card-glow"
              variants={{
                hidden: { opacity: 0, y: 36 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
              }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
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
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hiw-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
