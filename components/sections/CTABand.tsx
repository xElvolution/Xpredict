import { ArrowRight } from 'lucide-react';

export function CTABand() {
  return (
    <section className="section">
      <div className="container">
        <div
          className="card card-glow"
          style={{
            position: 'relative',
            padding: 'var(--s-16) var(--s-10)',
            textAlign: 'center',
            overflow: 'hidden',
            borderColor: 'var(--accent-ring)'
          }}
        >
          {/* aurora */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(600px 320px at 50% -10%, rgba(124, 58, 237, 0.30), transparent 70%),' +
                'radial-gradient(420px 220px at 80% 110%, rgba(0, 255, 135, 0.10), transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          {/* grid */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),' +
                'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
              maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-5)' }}>
            <span className="eyebrow">XCup · Build X Hackathon</span>
            <h2 style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', maxWidth: 760, letterSpacing: '-0.03em' }}>
              <span className="gradient-text">The arena is open.</span>
              <br /> Predict your first market.
            </h2>
            <p style={{ maxWidth: 560, textAlign: 'center' }}>
              No KYC, no waiting, no human gatekeepers. Connect on X Layer, pick a market, and watch
              the agents settle it for you.
            </p>
            <div className="row gap-3" style={{ marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a className="btn btn-primary btn-lg" href="/markets">
                Predict now
                <ArrowRight size={16} />
              </a>
              <a className="btn btn-ghost btn-lg" href="/agents">
                Read the agent spec
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
