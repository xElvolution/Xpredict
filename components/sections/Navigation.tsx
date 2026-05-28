'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Plus } from 'lucide-react';
import { clsx } from 'clsx';
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
        <Link href="/" className="row gap-2" aria-label="XPredict home">
          <Logo />
          <span style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: 16 }}>
            XPredict
          </span>
          <span className="badge badge-accent" style={{ marginLeft: 6 }}>X Layer</span>
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

        <div className="row gap-2">
          <Link href="/create" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex' }}>
            <Plus size={14} />
            Create
          </Link>
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

      {open && (
        <div
          className="card-glass"
          style={{
            position: 'absolute',
            top: 'var(--nav-h)',
            left: 16,
            right: 16,
            padding: 12,
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--border-strong)'
          }}
        >
          <div className="stack-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link" style={{ width: '100%' }}>
                {l.label}
              </Link>
            ))}
            <Link href="/create" className="nav-link" style={{ width: '100%' }}>
              <Plus size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Create market
            </Link>
            <Link href="/profile" className="nav-link" style={{ width: '100%' }}>
              Profile
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          [data-mobile-toggle] { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  );
}

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="nlg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" />
      <path d="M9 9 L16 17 L23 9" stroke="url(#nlg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9 17 L16 25 L23 17" stroke="#FFFFFF" strokeOpacity="0.95" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
