'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
          <Image src="/logo.png" alt="XPredict" width={26} height={26} style={{ borderRadius: 6 }} />
          <span style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: 16 }}>
            XPredict
          </span>
          <span className="badge badge-accent nav-chain-badge" style={{ marginLeft: 6 }}>X Layer</span>
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
          <Link href="/create" className="btn btn-ghost btn-sm nav-create-btn" style={{ display: 'inline-flex' }}>
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
            <Link href="/settings" className="nav-link" style={{ width: '100%' }}>
              Settings
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          [data-mobile-toggle] { display: inline-flex !important; }
          .nav-create-btn { display: none !important; }
        }
        @media (max-width: 480px) {
          .nav-chain-badge { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
