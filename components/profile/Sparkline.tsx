'use client';

export function Sparkline({ data, height = 56 }: { data: number[]; height?: number }) {
  if (data.length === 0) return null;

  const w = 320;
  const pad = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const xs = data.map((_, i) => pad + (i * (w - pad * 2)) / (data.length - 1));
  const ys = data.map((v) => height - pad - ((v - min) / range) * (height - pad * 2));

  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L ${xs[xs.length - 1].toFixed(1)} ${height - pad} L ${xs[0].toFixed(1)} ${height - pad} Z`;

  const last = data[data.length - 1];
  const positive = last >= 0;
  const accent   = positive ? 'var(--positive)' : 'var(--negative)';
  const accentRGB = positive ? '0, 255, 135' : '255, 77, 109';

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${accentRGB}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={`rgb(${accentRGB})`} stopOpacity="0.35" />
          <stop offset="100%" stopColor={`rgb(${accentRGB})`} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp-${accentRGB})`} />
      <path d={path} stroke={accent} strokeWidth="1.6" fill="none" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill={accent} />
    </svg>
  );
}
