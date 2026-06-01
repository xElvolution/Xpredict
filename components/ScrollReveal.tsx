'use client';

import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

type Preset = 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';

const PRESETS: Record<Preset, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }
  },
  slideLeft: {
    hidden: { opacity: 0, x: -50 },
    show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  },
  slideRight: {
    hidden: { opacity: 0, x: 50 },
    show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.94 },
    show:   { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  }
};

/**
 * Wrap landing sections to fade-up as they enter the viewport.
 * Pure framer-motion `whileInView` — no scroll listeners, very cheap.
 */
export function ScrollReveal({
  children,
  preset = 'fadeUp',
  delay = 0,
  amount = 0.2,
  once = true,
  className
}: {
  children: ReactNode;
  preset?: Preset;
  delay?: number;
  amount?: number;
  once?: boolean;
  className?: string;
}) {
  const variants = PRESETS[preset];
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: '-60px 0px' }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger children inside a list. Use with <ScrollRevealItem>.
 */
export function ScrollRevealStagger({
  children,
  staggerDelay = 0.08,
  amount = 0.2,
  once = true,
  className
}: {
  children: ReactNode;
  staggerDelay?: number;
  amount?: number;
  once?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: '-60px 0px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: staggerDelay, delayChildren: 0.1 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({
  children,
  preset = 'fadeUp',
  className
}: {
  children: ReactNode;
  preset?: Preset;
  className?: string;
}) {
  return (
    <motion.div variants={PRESETS[preset]} className={className}>
      {children}
    </motion.div>
  );
}
