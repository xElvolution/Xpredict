'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { Copy, ExternalLink, LogOut, ChevronDown, User2, Wallet, X, AlertTriangle } from 'lucide-react';
import { xLayer } from '@/lib/chains';
import { formatAddress } from '@/lib/format';

export function ConnectButton({ compact = false }: { compact?: boolean }) {
  const { address, isConnected } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);

  if (!isConnected) {
    return (
      <>
        <button
          className={compact ? 'btn btn-primary btn-sm' : 'btn btn-primary'}
          onClick={() => setModalOpen(true)}
        >
          <Wallet size={14} />
          Connect Wallet
        </button>
        {modalOpen && <ConnectModal onClose={() => setModalOpen(false)} />}
      </>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <ConnectedButton
        address={address!}
        compact={compact}
        onClick={() => setDropOpen((v) => !v)}
      />
      {dropOpen && (
        <WalletDropdown address={address!} onClose={() => setDropOpen(false)} />
      )}
    </div>
  );
}

/* ---------- Connected pill ---------- */

function ConnectedButton({
  address, compact, onClick
}: { address: `0x${string}`; compact: boolean; onClick: () => void }) {
  const { data: bal } = useBalance({ address, chainId: xLayer.id });
  const chainId = useChainId();
  const wrongNet = chainId !== xLayer.id;

  return (
    <button
      onClick={onClick}
      className={compact ? 'btn btn-ghost btn-sm' : 'btn btn-ghost'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        borderColor: wrongNet ? 'rgba(255, 176, 32, 0.4)' : 'var(--border-strong)'
      }}
    >
      {wrongNet ? (
        <AlertTriangle size={14} color="var(--warning)" />
      ) : (
        <Avatar seed={address} size={20} />
      )}
      <span className="mono" style={{ fontSize: 13 }}>{formatAddress(address)}</span>
      {!compact && bal && (
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 4 }}>
          {Number(bal.formatted).toFixed(3)} {bal.symbol}
        </span>
      )}
      <ChevronDown size={14} color="var(--text-muted)" />
    </button>
  );
}

/* ---------- Wallet dropdown ---------- */

function WalletDropdown({
  address, onClose
}: { address: `0x${string}`; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: bal } = useBalance({ address, chainId: xLayer.id });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  const copy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const wrongNet = chainId !== xLayer.id;

  return (
    <div
      ref={ref}
      className="card-glass"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 320,
        padding: 0,
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--r-lg)',
        background: 'rgba(17, 17, 24, 0.95)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
        zIndex: 60,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ padding: 'var(--s-5)', borderBottom: '1px solid var(--border)' }}>
        <div className="row gap-3">
          <Avatar seed={address} size={40} />
          <div className="stack-2" style={{ minWidth: 0 }}>
            <div className="row gap-2">
              <span style={{ fontSize: 14, fontWeight: 600 }} className="mono">
                {formatAddress(address)}
              </span>
              <button
                onClick={copy}
                aria-label="Copy address"
                style={{ color: 'var(--text-muted)' }}
              >
                <Copy size={13} />
              </button>
              {copied && (
                <span className="mono" style={{ fontSize: 11, color: 'var(--positive)' }}>
                  copied
                </span>
              )}
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              {bal ? `${Number(bal.formatted).toFixed(4)} ${bal.symbol}` : 'N/A'} · X Layer
            </span>
          </div>
        </div>
      </div>

      {/* Wrong-net warning */}
      {wrongNet && (
        <div
          style={{
            padding: 'var(--s-4)',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(255, 176, 32, 0.06)'
          }}
        >
          <div className="row gap-2" style={{ marginBottom: 8 }}>
            <AlertTriangle size={14} color="var(--warning)" />
            <span style={{ fontSize: 13, color: 'var(--warning)' }}>Wrong network</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
            disabled={switching}
            onClick={() => switchChain({ chainId: xLayer.id })}
          >
            {switching ? 'Switching…' : 'Switch to X Layer'}
          </button>
        </div>
      )}

      {/* Links */}
      <div style={{ padding: 'var(--s-2)' }}>
        <DropLink href="/profile" Icon={User2} label="Profile · positions & P&L" />
        <DropLink
          href={`${xLayer.blockExplorers.default.url}/address/${address}`}
          Icon={ExternalLink}
          label="View on OKLink"
          external
        />
      </div>

      <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--s-2)' }}>
        <button
          onClick={() => { disconnect(); onClose(); }}
          className="row gap-3"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--r-sm)',
            color: 'var(--negative)',
            fontSize: 13,
            background: 'transparent',
            transition: 'background-color 160ms ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'var(--negative-soft)')}
          onMouseOut={(e)  => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={14} />
          Disconnect
        </button>
      </div>
    </div>
  );
}

function DropLink({
  href, Icon, label, external
}: { href: string; Icon: React.ComponentType<{ size?: number }>; label: string; external?: boolean }) {
  const inner = (
    <div
      className="row gap-3"
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--r-sm)',
        color: 'var(--text-dim)',
        fontSize: 13,
        transition: 'background-color 160ms ease, color 160ms ease'
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
        (e.currentTarget as HTMLDivElement).style.color = 'var(--text)';
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        (e.currentTarget as HTMLDivElement).style.color = 'var(--text-dim)';
      }}
    >
      <Icon size={14} />
      <span style={{ flex: 1 }}>{label}</span>
      {external && <ExternalLink size={11} />}
    </div>
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer">{inner}</a>
  ) : (
    <Link href={href}>{inner}</Link>
  );
}

/* ---------- Connect modal ---------- */

function ConnectModal({ onClose }: { onClose: () => void }) {
  const { connectors, connect, status, error } = useConnect();
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const wallets = detectWallets();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 5, 9, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card card-glow"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 0,
          background: 'rgba(17, 17, 24, 0.96)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)'
        }}
      >
        <div
          className="row"
          style={{
            justifyContent: 'space-between',
            padding: 'var(--s-5)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <strong style={{ fontSize: 16, letterSpacing: '-0.01em' }}>Connect a wallet</strong>
          <button
            onClick={onClose}
            aria-label="Close"
            className="btn-icon"
            style={{ width: 32, height: 32 }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: 'var(--s-5)' }} className="stack-3">
          {wallets.map((w) => (
            <button
              key={w.id}
              className="row"
              disabled={status === 'pending' && pending === w.id}
              onClick={() => {
                setPending(w.id);
                const c = connectors.find((c) => c.id === 'injected') ?? connectors[0];
                if (w.id !== 'injected' && typeof window !== 'undefined') {
                  // Hint to the injected connector by setting the preferred provider
                  (window as any).__preferredWallet = w.id;
                }
                connect({ connector: c });
              }}
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: 'var(--s-4)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-strong)',
                background: 'var(--surface)',
                transition: 'all 160ms ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.06)';
                e.currentTarget.style.borderColor = 'var(--accent-ring)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
            >
              <div className="row gap-3">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--r-sm)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: w.tint,
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16
                  }}
                >
                  {w.glyph}
                </div>
                <div className="stack-2" style={{ alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{w.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {w.detected ? 'Detected · ready to connect' : 'Not installed'}
                  </span>
                </div>
              </div>
              {status === 'pending' && pending === w.id ? (
                <span className="mono" style={{ fontSize: 12, color: 'var(--accent-bright)' }}>
                  connecting…
                </span>
              ) : (
                <span className={`badge ${w.detected ? 'badge-positive' : 'badge-neutral'}`}>
                  {w.detected ? 'ready' : 'install'}
                </span>
              )}
            </button>
          ))}

          {error && (
            <div
              style={{
                padding: 'var(--s-3) var(--s-4)',
                border: '1px solid rgba(255, 77, 109, 0.4)',
                background: 'var(--negative-soft)',
                borderRadius: 'var(--r-sm)',
                color: 'var(--negative)',
                fontSize: 13
              }}
            >
              {error.message}
            </div>
          )}

          <div
            className="mono"
            style={{
              fontSize: 11,
              color: 'var(--text-faint)',
              textAlign: 'center',
              marginTop: 4,
              letterSpacing: '0.06em'
            }}
          >
            By connecting you agree to the Terms · X Layer · zkEVM
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Wallet detection ---------- */

type WalletOpt = { id: string; name: string; glyph: string; tint: string; detected: boolean };

function detectWallets(): WalletOpt[] {
  if (typeof window === 'undefined') {
    return [
      { id: 'okxwallet', name: 'OKX Wallet', glyph: 'O', tint: '#000', detected: false },
      { id: 'metamask',  name: 'MetaMask',   glyph: 'M', tint: '#E2761B', detected: false },
      { id: 'injected',  name: 'Browser wallet', glyph: 'W', tint: '#7C3AED', detected: false }
    ];
  }
  const w = window as any;
  return [
    { id: 'okxwallet', name: 'OKX Wallet', glyph: 'O', tint: '#000',    detected: !!w.okxwallet },
    { id: 'metamask',  name: 'MetaMask',   glyph: 'M', tint: '#E2761B', detected: !!w.ethereum?.isMetaMask },
    { id: 'injected',  name: 'Browser wallet', glyph: 'W', tint: '#7C3AED', detected: !!w.ethereum }
  ];
}

/* ---------- Avatar ---------- */

function Avatar({ seed, size = 28 }: { seed: string; size?: number }) {
  const h1 = hashHue(seed);
  const h2 = (h1 + 80) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: `conic-gradient(from 40deg, hsl(${h1} 80% 60%), hsl(${h2} 75% 55%), hsl(${h1} 80% 60%))`,
        border: '1px solid var(--border-strong)'
      }}
    />
  );
}

function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}
