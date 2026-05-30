'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { Copy, ExternalLink, LogOut, ChevronDown, User2, Wallet, AlertTriangle } from 'lucide-react';
import { xLayerTestnet } from '@/lib/chains';
import { formatAddress } from '@/lib/format';

export function ConnectButton({ compact = false }: { compact?: boolean }) {
  const { ready, authenticated, login } = usePrivy();
  const { address, isConnected } = useAccount();
  const [dropOpen, setDropOpen] = useState(false);

  if (!ready) {
    return (
      <button
        className={compact ? 'btn btn-ghost btn-sm' : 'btn btn-ghost'}
        disabled
        style={{ opacity: 0.5 }}
      >
        <Wallet size={14} />
        Loading...
      </button>
    );
  }

  if (!authenticated || !isConnected) {
    return (
      <button
        className={compact ? 'btn btn-primary btn-sm' : 'btn btn-primary'}
        onClick={login}
      >
        <Wallet size={14} />
        Connect Wallet
      </button>
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
  const { data: bal } = useBalance({ address, chainId: xLayerTestnet.id });
  const chainId = useChainId();
  const wrongNet = chainId !== xLayerTestnet.id;

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
  const { logout, user } = usePrivy();
  const { wallets } = useWallets();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: bal } = useBalance({ address, chainId: xLayerTestnet.id });
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

  const wrongNet = chainId !== xLayerTestnet.id;
  const activeWallet = wallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
  const walletKind = activeWallet?.walletClientType ?? 'wallet';

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
              {bal ? `${Number(bal.formatted).toFixed(4)} ${bal.symbol}` : 'N/A'} · {walletKind}
            </span>
            {user?.email?.address && (
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                {user.email.address}
              </span>
            )}
          </div>
        </div>
      </div>

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
            onClick={() => switchChain({ chainId: xLayerTestnet.id })}
          >
            {switching ? 'Switching…' : 'Switch to X Layer Testnet'}
          </button>
        </div>
      )}

      <div style={{ padding: 'var(--s-2)' }}>
        <DropLink href="/profile" Icon={User2} label="Profile · positions & P&L" />
        <DropLink
          href={`${xLayerTestnet.blockExplorers!.default.url}/address/${address}`}
          Icon={ExternalLink}
          label="View on explorer"
          external
        />
      </div>

      <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--s-2)' }}>
        <button
          onClick={() => { logout(); onClose(); }}
          className="row gap-3"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--r-sm)',
            color: 'var(--negative)',
            fontSize: 13,
            transition: 'background 120ms ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,77,109,0.08)')}
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
}: { href: string; Icon: typeof User2; label: string; external?: boolean }) {
  const props = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <Link
      href={href}
      {...props}
      className="row gap-3"
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--r-sm)',
        color: 'var(--text-dim)',
        fontSize: 13,
        transition: 'background 120ms ease'
      }}
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}

/* ---------- Avatar ---------- */

function Avatar({ seed, size }: { seed: string; size: number }) {
  const hue = parseInt(seed.slice(2, 8), 16) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 60) % 360}, 70%, 45%))`,
        border: '1px solid rgba(255,255,255,0.15)',
        flexShrink: 0
      }}
    />
  );
}
