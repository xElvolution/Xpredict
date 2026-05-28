'use client';

import { useMemo } from 'react';

export function ProbChart({ yesProbability }: { yesProbability: number }) {
  const points = useMemo(() => generateSeries(yesProbability), [yesProbability]);
  const w = 800;
  const h = 180;
  const pad = 8;

  const xs = points.map((_, i) => pad + (i * (w - pad * 2)) / (points.length - 1));
  const ys = points.map((p) => h - pad - p * (h - pad * 2));

  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L ${xs[xs.length - 1].toFixed(1)} ${h - pad} L ${xs[0].toFixed(1)} ${h - pad} Z`;
  const last = { x: xs[xs.length - 1], y: ys[ys.length - 1] };

  return (
    <div style={{ width: '100%', height: h, position: 'relative' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
        <defs>
          <linearGradient id="probArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7C3AED" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="probLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#5EEAD4" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={pad}
            x2={w - pad}
            y1={h - pad - g * (h - pad * 2)}
            y2={h - pad - g * (h - pad * 2)}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="3 4"
          />
        ))}

        <path d={area} fill="url(#probArea)" />
        <path d={path} stroke="url(#probLine)" strokeWidth="2" fill="none" />
        <circle cx={last.x} cy={last.y} r={4} fill="#8B5CF6" />
        <circle cx={last.x} cy={last.y} r={9} fill="#8B5CF6" opacity="0.25" />
      </svg>

      {/* Y axis labels */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          color: 'var(--text-faint)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11
        }}
      >
        <span style={{ position: 'absolute', top: 4, left: 10 }}>100%</span>
        <span style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)' }}>50%</span>
        <span style={{ position: 'absolute', bottom: 4, left: 10 }}>0%</span>
      </div>
      <div
        className="row"
        style={{
          justifyContent: 'space-between',
          marginTop: 8,
          color: 'var(--text-faint)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11
        }}
      >
        <span>30d</span>
        <span>21d</span>
        <span>14d</span>
        <span>7d</span>
        <span>now</span>
      </div>
    </div>
  );
}

function generateSeries(endProb: number): number[] {
  // deterministic-ish series ending at endProb
  const n = 60;
  const out: number[] = [];
  let p = clamp(endProb + (hash(endProb) % 21 - 10) / 100, 0.05, 0.95);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const target = endProb * t + p * (1 - t);
    const noise = (Math.sin(i * 1.7 + endProb * 13) * 0.05);
    out.push(clamp(target + noise, 0.02, 0.98));
  }
  out[out.length - 1] = endProb;
  return out;
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function hash(n: number) { const x = Math.sin(n * 9999) * 10000; return Math.floor(Math.abs(x)); }
