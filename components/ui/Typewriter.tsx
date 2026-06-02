'use client';

import { useEffect, useState } from 'react';

type Props = {
  phrases: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  holdMs?: number;
  className?: string;
  style?: React.CSSProperties;
  prefix?: React.ReactNode;
};

export function Typewriter({
  phrases,
  typeSpeed = 65,
  deleteSpeed = 35,
  holdMs = 1400,
  className,
  style,
  prefix
}: Props) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing');

  useEffect(() => {
    const current = phrases[idx % phrases.length];
    let t: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (text.length < current.length) {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed);
      } else {
        t = setTimeout(() => setPhase('deleting'), holdMs);
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        t = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed);
      } else {
        setIdx((i) => (i + 1) % phrases.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(t);
  }, [text, phase, idx, phrases, typeSpeed, deleteSpeed, holdMs]);

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontVariantNumeric: 'tabular-nums',
        ...style
      }}
      aria-live="polite"
    >
      {prefix}
      <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 2,
          height: '1em',
          background: 'currentColor',
          marginLeft: 1,
          transform: 'translateY(2px)',
          animation: 'tw-caret 1s steps(2, start) infinite',
          opacity: 0.85
        }}
      />
      <style jsx>{`
        @keyframes tw-caret {
          0%, 49% { opacity: 0.85; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
