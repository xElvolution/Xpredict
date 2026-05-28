'use client';

import { useEffect, useState } from 'react';

/**
 * Renders `text` char-by-char with a blinking caret.
 * Calls onDone when finished.
 */
export function Typewriter({
  text,
  speed = 18,
  delay = 0,
  caret = true,
  onDone
}: {
  text: string;
  speed?: number;
  delay?: number;
  caret?: boolean;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setShown('');
    setDone(false);
    const start = setTimeout(() => {
      const id = setInterval(() => {
        i++;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(id);
          setDone(true);
          onDone?.();
        }
      }, speed);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span>
      {shown}
      {caret && !done && <Caret />}
    </span>
  );
}

function Caret() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: '0.9em',
        marginLeft: 2,
        verticalAlign: 'text-bottom',
        background: 'var(--accent-bright)',
        animation: 'blink 1s steps(2) infinite'
      }}
    >
      <style>{`@keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }`}</style>
    </span>
  );
}
