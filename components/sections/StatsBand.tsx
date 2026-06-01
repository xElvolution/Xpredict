'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Stat = {
  /** Target numeric value to count to */
  target: number;
  /** Display formatter, e.g. n => `$${(n/1e6).toFixed(1)}M` */
  format: (n: number) => string;
  label: string;
  sub: string;
};

const STATS: Stat[] = [
  {
    target: 48.2,
    format: (n) => `$${n.toFixed(1)}M`,
    label: 'Volume traded',
    sub: 'last 30 days'
  },
  {
    target: 1284,
    format: (n) => Math.round(n).toLocaleString('en-US'),
    label: 'Open markets',
    sub: 'auto-created'
  },
  {
    target: 99.4,
    format: (n) => `${n.toFixed(1)}%`,
    label: 'Resolution rate',
    sub: 'agent accuracy'
  },
  {
    target: 21.9,
    format: (n) => `${n.toFixed(1)}K`,
    label: 'Active predictors',
    sub: 'this week'
  },
  {
    target: 2,
    format: (n) => `<${Math.round(n)}s`,
    label: 'Settlement time',
    sub: 'X Layer block'
  },
  {
    target: 0.001,
    format: (n) => `$${n.toFixed(3)}`,
    label: 'Average gas',
    sub: 'per prediction'
  }
];

export function StatsBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const valueRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Build a count-up timeline triggered when the section enters the viewport.
      const counters = STATS.map((s, i) => {
        const el = valueRefs.current[i];
        if (!el) return null;
        const proxy = { v: 0 };
        return { el, target: s.target, format: s.format, proxy };
      }).filter(Boolean) as Array<{
        el: HTMLDivElement;
        target: number;
        format: (n: number) => string;
        proxy: { v: number };
      }>;

      // Initialize displays to formatted 0 so they don't flash the target value first
      counters.forEach((c) => {
        c.el.textContent = c.format(0);
      });

      ScrollTrigger.create({
        trigger: sectionRef.current!,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          counters.forEach((c) => {
            gsap.to(c.proxy, {
              v: c.target,
              duration: 1.6,
              ease: 'power3.out',
              onUpdate: () => {
                c.el.textContent = c.format(c.proxy.v);
              }
            });
          });
        }
      });

      // Subtle vertical drift on each value as section scrolls
      gsap.fromTo(
        valueRefs.current.filter(Boolean) as HTMLDivElement[],
        { y: 12, opacity: 0.6 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current!,
            start: 'top 85%',
            once: true
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
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
                ref={(el) => { valueRefs.current[i] = el; }}
                style={{
                  fontSize: 'clamp(1.75rem, 2.4vw, 2.25rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(180deg, #FFFFFF, #C4B6FF)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {s.format(0)}
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
