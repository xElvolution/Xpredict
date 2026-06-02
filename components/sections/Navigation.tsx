'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ConnectButton } from '@/components/wallet/ConnectButton';

const LINKS = [
  { href: '/markets',     label: 'Markets' },
  { href: '/arena',       label: 'Arena' },
  { href: '/live',        label: 'Live' },
  { href: '/agents',      label: 'Agents' },
  { href: '/leaderboard', label: 'Leaderboard' }
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <nav className={clsx('nav', scrolled && 'nav-scrolled')}>
      <div className="nav-inner">
        <Link href="/" className="row gap-2 nav-brand" aria-label="XPredict home" style={{ minWidth: 0, flexShrink: 1 }}>
          <Image src="/logo.png" alt="XPredict" width={26} height={26} style={{ borderRadius: 6, flexShrink: 0 }} />
          <span className="nav-brand-text">
            XPredict
          </span>
          <span className="badge badge-accent nav-chain-badge hide-on-mobile" style={{ marginLeft: 6 }}>X Layer</span>
        </Link>

        <div className="nav-links">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx('nav-link', active && 'active')}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="row gap-2 nav-actions">
          <ConnectButton compact />
          <button
            className="btn-icon"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            data-mobile-toggle
            style={{ display: 'none' }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                top: 'var(--nav-h)',
                background: 'rgba(5, 5, 10, 0.55)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 49
              }}
            />
            <motion.div
              key="mobile-menu-panel"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                top: 'var(--nav-h)',
                left: 16,
                right: 16,
                padding: 12,
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--border-strong)',
                background: 'rgba(12, 12, 20, 0.96)',
                backdropFilter: 'blur(20px) saturate(140%)',
                WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(124, 58, 237, 0.18)',
                zIndex: 50,
                transformOrigin: 'top right'
              }}
            >
              <motion.div
                className="stack-2"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } }
                }}
              >
                {[...LINKS, { href: '/profile', label: 'Profile' }, { href: '/settings', label: 'Settings' }].map((l) => (
                  <motion.div
                    key={l.href}
                    variants={{
                      hidden: { opacity: 0, y: -6 },
                      show:   { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }
                    }}
                    style={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <Link
                      href={l.href}
                      className="nav-link"
                      style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (max-width: 768px) {
          [data-mobile-toggle] { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  );
}
