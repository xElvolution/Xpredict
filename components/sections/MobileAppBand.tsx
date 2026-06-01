'use client';

import { motion } from 'framer-motion';
import { Smartphone, Bell, Wallet, Zap, ArrowRight, Sparkles } from 'lucide-react';

export function MobileAppBand() {
  return (
    <section className="section">
      <div className="container">
        <div
          className="card"
          style={{
            padding: 'var(--s-10)',
            position: 'relative',
            overflow: 'hidden',
            borderColor: 'var(--accent-ring)'
          }}
        >
          {/* Background aurora */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(560px 320px at 100% 0%, rgba(124, 58, 237, 0.20), transparent 70%),' +
                'radial-gradient(420px 240px at 0% 100%, rgba(0, 255, 135, 0.10), transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
              gap: 'var(--s-10)',
              alignItems: 'center'
            }}
            className="mobile-band-grid"
          >
            {/* Left: copy */}
            <div className="stack-5">
              <div className="row gap-2">
                <Smartphone size={14} color="var(--accent-bright)" />
                <span className="eyebrow" style={{ color: 'var(--accent-bright)' }}>
                  XPredict Mobile
                </span>
              </div>

              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em' }}>
                <span className="gradient-text">Predict on the go.</span>
                <br /> Onchain in your pocket.
              </h2>

              <p style={{ fontSize: 16, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 520 }}>
                The XPredict Android app lets you place predictions, build parlay slips, and claim
                winnings without leaving your phone. Same wallet, same markets, real-time onchain.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 'var(--s-3)',
                  marginTop: 'var(--s-2)'
                }}
                className="mobile-feature-grid"
              >
                <Feature
                  Icon={Wallet}
                  label="Single sign-in"
                  body="Privy wallet syncs across web + mobile. One login, every device."
                />
                <Feature
                  Icon={Zap}
                  label="Live onchain"
                  body="Sub-second odds + X Layer settlement. Trade as fast as you scroll."
                />
                <Feature
                  Icon={Bell}
                  label="Push alerts"
                  body="Resolution pings, parlay updates, agent picks. Never miss a settle."
                />
                <Feature
                  Icon={Sparkles}
                  label="Coach in-app"
                  body="Ask Coach AI for context on any market before you stake."
                />
              </div>

              <div className="row gap-3" style={{ flexWrap: 'wrap', marginTop: 'var(--s-3)' }}>
                <button
                  className="btn btn-primary btn-lg"
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                >
                  <Smartphone size={16} />
                  Coming soon to Android
                </button>
                <a
                  href="https://github.com/xElvolution/Xpredict/tree/main/mobile-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-lg"
                >
                  View source
                  <ArrowRight size={14} />
                </a>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                Join the waitlist · APK drop announced on{' '}
                <a
                  href="https://twitter.com/xpredict"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-bright)' }}
                >
                  @xpredict
                </a>
              </p>
            </div>

            {/* Right: phone mockup */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .mobile-band-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .mobile-feature-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function Feature({
  Icon, label, body
}: { Icon: typeof Wallet; label: string; body: string }) {
  return (
    <div
      style={{
        padding: 'var(--s-4)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)'
      }}
    >
      <div className="row gap-2" style={{ marginBottom: 6 }}>
        <Icon size={14} color="var(--accent-bright)" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 }}>{body}</div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div
      style={{
        position: 'relative',
        width: 260,
        height: 540,
        borderRadius: 38,
        background: 'linear-gradient(180deg, #1a1a26 0%, #11111a 100%)',
        border: '8px solid #050509',
        boxShadow:
          '0 30px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        overflow: 'hidden'
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 100,
          height: 22,
          background: '#050509',
          borderRadius: 999,
          zIndex: 2
        }}
      />
      {/* Status bar */}
      <div
        style={{
          padding: '34px 18px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          color: 'var(--text)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)'
        }}
      >
        <span>9:41</span>
        <span style={{ color: 'var(--accent-bright)' }}>● X LAYER</span>
      </div>

      {/* App header */}
      <div style={{ padding: '0 18px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          Markets · 7 live
        </div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>What the arena is predicting</div>
      </div>

      {/* Market card 1 */}
      <PhoneMarketRow
        category="Crypto"
        title="Will BTC close above $80k by June 30?"
        yes={62}
        accent="#7C3AED"
      />
      <PhoneMarketRow
        category="Football"
        title="Will Man City beat Liverpool today?"
        yes={48}
        accent="#FFB020"
      />
      <PhoneMarketRow
        category="UFC"
        title="Will Topuria retain at UFC 312?"
        yes={71}
        accent="#FF4D6D"
      />

      {/* Bottom nav */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          background: 'rgba(14,14,21,0.92)',
          borderTop: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          alignItems: 'center'
        }}
      >
        {['Markets', 'Live', 'Coach', 'Profile'].map((t, i) => (
          <div
            key={t}
            style={{
              fontSize: 9,
              textAlign: 'center',
              color: i === 0 ? 'var(--accent-bright)' : 'var(--text-faint)',
              fontWeight: i === 0 ? 700 : 500
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneMarketRow({
  category, title, yes, accent
}: { category: string; title: string; yes: number; accent: string }) {
  return (
    <div
      style={{
        padding: '12px 18px',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div
        style={{
          display: 'inline-block',
          fontSize: 9,
          color: accent,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 700,
          marginBottom: 6
        }}
      >
        {category}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.35, marginBottom: 8 }}>
        {title}
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 999,
          background: 'rgba(255,77,109,0.30)',
          overflow: 'hidden',
          marginBottom: 4
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${yes}%`,
            background: 'var(--positive)',
            transition: 'width 400ms'
          }}
        />
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ color: 'var(--positive)' }}>YES {yes}¢</span>
        <span style={{ color: 'var(--negative)' }}>NO {100 - yes}¢</span>
      </div>
    </div>
  );
}
