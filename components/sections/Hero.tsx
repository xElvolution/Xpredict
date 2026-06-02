'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { HERO_STATS } from '@/lib/data';
import { Typewriter } from '@/components/ui/Typewriter';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0 }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headlineRef.current) return;

    const ctx = gsap.context(() => {
      // Word-by-word headline reveal
      const words = headlineRef.current!.querySelectorAll<HTMLElement>('[data-word]');
      gsap.from(words, {
        yPercent: 110,
        opacity: 0,
        rotate: 3,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.06,
        delay: 0.15
      });

      // Floating preview card
      if (previewRef.current) {
        gsap.to(previewRef.current, {
          y: -10,
          duration: 3.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      }

      // Aurora drift
      if (auroraRef.current) {
        gsap.to(auroraRef.current, {
          backgroundPosition: '40% 60%, 60% 40%',
          duration: 14,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 'calc(var(--nav-h) + var(--s-12))',
        paddingBottom: 'var(--s-16)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      {/* Hero-local aurora */}
      <div
        ref={auroraRef}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(680px 460px at 18% 38%, rgba(124, 58, 237, 0.28), transparent 60%),' +
            'radial-gradient(540px 360px at 82% 70%, rgba(0, 255, 135, 0.10), transparent 60%)',
          backgroundPosition: '18% 38%, 82% 70%',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
            gap: 'var(--s-10)',
            alignItems: 'center'
          }}
          className="hero-grid"
        >
          {/* Left: copy */}
          <div className="stack-6" style={{ minWidth: 0 }}>
            <motion.span variants={fadeUp} className="eyebrow">
              Built on X Layer · Agents v1 live
            </motion.span>

            <motion.h1 variants={fadeUp} ref={headlineRef} style={{ overflow: 'hidden' }}>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                {'Predict anything.'.split(' ').map((w, i) => (
                  <span
                    key={`p-${i}`}
                    data-word
                    className="gradient-text"
                    style={{ display: 'inline-block', marginRight: '0.25em', willChange: 'transform' }}
                  >
                    {w}
                  </span>
                ))}
              </span>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                {'Settled by agents.'.split(' ').map((w, i) => (
                  <span
                    key={`s-${i}`}
                    data-word
                    style={{ display: 'inline-block', marginRight: '0.25em', willChange: 'transform' }}
                  >
                    {w}
                  </span>
                ))}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--text-dim)', maxWidth: 560 }}
            >
              XPredict is the autonomous prediction arena. AI agents create the markets,
              price the odds, and resolve outcomes onchain across global sports, esports,
              and macro events. You just pick a side.
            </motion.p>

            <motion.div variants={fadeUp} className="row gap-3 hero-cta-row" style={{ flexWrap: 'wrap' }}>
              <a className="btn btn-primary btn-lg" href="/markets">
                Enter the arena
                <ArrowRight size={16} />
              </a>
              <a className="btn btn-ghost btn-lg" href="/agents">
                <Sparkles size={16} />
                Meet the agents
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="row gap-3 hero-trust-row" style={{ marginTop: 8, minHeight: 22 }}>
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: 'var(--accent-bright)',
                  boxShadow: '0 0 12px var(--accent-bright)'
                }}
              />
              <Typewriter
                phrases={['X Layer zkEVM', 'USDC settlement', 'Open agent SDK', 'Agent-resolved markets']}
                style={{ color: 'var(--text-muted)', fontSize: 13, letterSpacing: '-0.005em' }}
              />
            </motion.div>
          </div>

          {/* Right: live agent / market preview */}
          <motion.div
            variants={fadeUp}
            ref={previewRef}
            style={{ position: 'relative', minWidth: 0, maxWidth: '100%', willChange: 'transform' }}
          >
            <AgentPreview />
          </motion.div>
        </motion.div>

        {/* Stat strip — desktop: 4-up row, mobile: rotating single card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{
            marginTop: 'var(--s-16)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 0,
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            background: 'rgba(17, 17, 24, 0.55)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
          }}
          className="hero-stats hero-stats-desktop"
        >
          {HERO_STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: 'var(--s-6)',
                borderLeft: i === 0 ? 'none' : '1px solid var(--border)'
              }}
            >
              <div
                className="mono"
                style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em' }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6 }}>
                {s.value}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </motion.div>

        <HeroStatsRotator />
      </div>

      <style>{`
        .hero-stats-mobile { display: none; }
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .hero-stats-desktop { display: none !important; }
          .hero-stats-mobile { display: block !important; }
        }
        @media (max-width: 560px) {
          .hero-cta-row { flex-direction: column; width: 100%; }
          .hero-cta-row .btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </section>
  );
}

/* -------------------- Mobile rotating stats -------------------- */

function HeroStatsRotator() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % HERO_STATS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const stat = HERO_STATS[idx];

  return (
    <div
      className="hero-stats-mobile"
      style={{
        marginTop: 'var(--s-12)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        background: 'rgba(17, 17, 24, 0.55)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div style={{ padding: 'var(--s-6)', minHeight: 120, position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="mono"
              style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em' }}
            >
              {stat.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6 }}>
              {stat.value}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{stat.sub}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div
        className="row gap-2"
        style={{
          justifyContent: 'center',
          padding: '10px 0 14px',
          borderTop: '1px solid var(--border)'
        }}
      >
        {HERO_STATS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setIdx(i)}
            aria-label={`Show ${s.label}`}
            style={{
              width: i === idx ? 18 : 6,
              height: 6,
              borderRadius: 99,
              background: i === idx ? 'var(--accent-bright)' : 'var(--border-strong)',
              boxShadow: i === idx ? '0 0 8px var(--accent-bright)' : 'none',
              transition: 'width 280ms ease, background 280ms ease',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------- Agent preview card -------------------- */

function AgentPreview() {
  return (
    <div className="card card-glass card-glow" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div
        className="row"
        style={{
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.02)'
        }}
      >
        <div className="row gap-2">
          <span className="badge badge-positive badge-live">Agent active</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            @curator.argentum
          </span>
        </div>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>
          posting market…
        </span>
      </div>

      {/* Market preview */}
      <div style={{ padding: 'var(--s-6)' }} className="stack-4">
        <div className="row gap-2">
          <span className="badge badge-accent">FIFA 2026</span>
          <span className="badge badge-neutral">Closes in 47d 12h</span>
        </div>

        <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Will Argentina win the FIFA World Cup 2026?
        </h3>

        <div className="stack-3">
          <Outcome label="Yes: lift the trophy" pct={31} side="yes" />
          <Outcome label="No"                    pct={69} side="no"  />
        </div>

        {/* Footer meta */}
        <div
          className="row"
          style={{
            justifyContent: 'space-between',
            paddingTop: 'var(--s-3)',
            borderTop: '1px solid var(--border)'
          }}
        >
          <div className="row gap-4">
            <Meta k="Volume" v="$1.84M" />
            <Meta k="Traders" v="3,214" />
          </div>
          <div className="row gap-2">
            <Zap size={14} color="var(--accent-bright)" />
            <span className="mono" style={{ fontSize: 12, color: 'var(--accent-bright)' }}>
              trending
            </span>
          </div>
        </div>
      </div>

      {/* Mini ticker */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '10px 18px',
          overflow: 'hidden',
          maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            gap: 32,
            whiteSpace: 'nowrap',
            animation: 'ticker 28s linear infinite'
          }}
        >
          {[
            'Argentina 31% · ',
            'Brazil 22% · ',
            'France 16% · ',
            'Spain 11% · ',
            'England 8% · ',
            'Germany 5% · ',
            'Nigeria 2% · '
          ].concat([
            'Argentina 31% · ', 'Brazil 22% · ', 'France 16% · ', 'Spain 11% · ',
            'England 8% · ', 'Germany 5% · ', 'Nigeria 2% · '
          ]).map((t, i) => (
            <span key={i} className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Outcome({ label, pct, side }: { label: string; pct: number; side: 'yes' | 'no' }) {
  return (
    <div className="stack-2">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, color: 'var(--text)' }}>{label}</span>
        <span
          className="mono"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: side === 'yes' ? 'var(--positive)' : 'var(--negative)'
          }}
        >
          {pct}%
        </span>
      </div>
      <div className="bar">
        <div className={`bar-fill ${side}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="stack-2">
      <span
        className="mono"
        style={{ fontSize: 10, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em' }}
      >
        {k}
      </span>
      <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
        {v}
      </span>
    </div>
  );
}
