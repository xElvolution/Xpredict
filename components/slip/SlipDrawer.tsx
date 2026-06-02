'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, Check, ChevronDown, ChevronRight, Copy, Download, Layers, Link2,
  Loader2, Receipt, Send, Share2, Sparkles, Trash2, Wallet, X
} from 'lucide-react';
import { parseUnits } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useSlip } from './SlipContext';
import { formatUSD } from '@/lib/format';
import { encodeSlip } from '@/lib/slip-share';
import { ADDRESSES, ERC20_ABI, PREDICTION_MARKET_ABI, USDC_DECIMALS } from '@/lib/contracts';
import { recordTradeHistory } from '@/lib/platform/client';

export function SlipFab() {
  const { legs, isOpen, toggle, combinedOdds } = useSlip();
  if (legs.length === 0 || isOpen) return null;

  return (
    <button
      onClick={toggle}
      className="row gap-3"
      aria-label="Open slip"
      style={{
        position: 'fixed',
        right: 'max(var(--s-4), env(safe-area-inset-right))',
        bottom: 'max(var(--s-4), env(safe-area-inset-bottom))',
        zIndex: 80,
        padding: 'var(--s-3) var(--s-5)',
        background: 'var(--accent)',
        color: '#0A0A0F',
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: 'var(--r-pill)',
        boxShadow: '0 18px 40px rgba(124, 58, 237, 0.45), inset 0 1px 0 rgba(255,255,255,0.30)',
        fontWeight: 700,
        fontSize: 14,
        transition: 'transform 200ms ease'
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseOut={(e)  => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <span
        style={{
          width: 24, height: 24, borderRadius: 999,
          display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10, 10, 15, 0.20)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12
        }}
      >
        {legs.length}
      </span>
      <span>Slip</span>
      <span className="mono" style={{ fontSize: 12, opacity: 0.75 }}>
        ×{combinedOdds.toFixed(2)}
      </span>
    </button>
  );
}

export function SlipDrawer() {
  const {
    legs, stake, setStake, isOpen, close, clear,
    removeLeg, flipLeg, combinedOdds, potentialPayout, profit
  } = useSlip();

  const [stakeOpen, setStakeOpen] = useState(true);
  const [shareCode, setShareCode] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedKind, setCopiedKind] = useState<'code' | 'link' | null>(null);

  /* ---------------- placement state ---------------- */
  const { address, isConnected } = useAccount();
  const { authenticated, login, ready } = usePrivy();
  const { writeContractAsync } = useWriteContract();
  const [placeStatus, setPlaceStatus] = useState<'idle' | 'placing' | 'success' | 'error'>('idle');
  const [placeError, setPlaceError] = useState('');
  const [placeStep, setPlaceStep] = useState(0);

  const handlePlaceParlay = async () => {
    setPlaceError('');

    if (!ready) return;

    if (!authenticated || !isConnected || !address) {
      login();
      return;
    }

    if (legs.length === 0) {
      setPlaceError('Add at least one leg first.');
      return;
    }

    if (stake <= 0) {
      setPlaceError('Set a stake greater than zero.');
      return;
    }

    const validLegs = legs.filter((l) => /^0x[a-fA-F0-9]{40}$/.test(l.id));
    if (validLegs.length === 0) {
      setPlaceError('Slip contains demo-only markets. Open a live market to bet.');
      return;
    }

    const perLeg = stake / validLegs.length;
    const amountWei = parseUnits(perLeg.toFixed(6), USDC_DECIMALS);

    setPlaceStatus('placing');
    setPlaceStep(0);

    try {
      for (let i = 0; i < validLegs.length; i++) {
        const leg = validLegs[i];
        const marketAddress = leg.id as `0x${string}`;
        setPlaceStep(i + 1);

        await writeContractAsync({
          address: ADDRESSES.USDC,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [marketAddress, amountWei]
        });

        const hash = await writeContractAsync({
          address: marketAddress,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'buy',
          args: [leg.side === 'yes' ? 0 : 1, amountWei, 0n]
        });

        recordTradeHistory({
          wallet: address,
          marketAddress,
          marketTitle: leg.title,
          category: leg.category,
          side: leg.side,
          collateral: perLeg,
          hash
        }).catch(() => {});
      }

      setPlaceStatus('success');
      setTimeout(() => {
        clear();
        close();
        setPlaceStatus('idle');
        setPlaceStep(0);
      }, 1600);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Transaction failed.';
      setPlaceError(msg.split('\n')[0].slice(0, 140));
      setPlaceStatus('error');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  const handleShare = async () => {
    setGenerating(true);
    try {
      const code = await encodeSlip(legs);
      setShareCode(code);
      setShowShareModal(true);
    } catch (error) {
      console.error('Failed to generate share code:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopiedKind('code');
    setTimeout(() => setCopiedKind(null), 1800);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/slip/${shareCode}`;
    navigator.clipboard.writeText(url);
    setCopiedKind('link');
    setTimeout(() => setCopiedKind(null), 1800);
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/slip/${shareCode}` : '';
  const shareText = `My XPredict parlay · ×${combinedOdds.toFixed(2)} combined odds · ${legs.length} ${legs.length === 1 ? 'pick' : 'picks'}. Load it:`;

  const openTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const openTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const openWhatsappShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop: dim on mobile, transparent on desktop, click closes either way */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90
            }}
            className="slip-backdrop"
          />

          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(420px, 100vw)',
              zIndex: 95,
              background: 'rgba(14, 14, 21, 0.96)',
              backdropFilter: 'blur(20px) saturate(140%)',
              borderLeft: '1px solid var(--border-strong)',
              boxShadow: '-24px 0 60px rgba(0,0,0,0.45)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div
              className="row"
              style={{
                justifyContent: 'space-between',
                padding: 'var(--s-5)',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div className="row gap-3">
                <div
                  style={{
                    width: 36, height: 36,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-ring)',
                    color: 'var(--accent-bright)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Layers size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
                    Parlay slip
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em' }}>
                    {legs.length} {legs.length === 1 ? 'LEG' : 'LEGS'} · X LAYER
                  </div>
                </div>
              </div>
              <div className="slip-header-actions">
                {legs.length > 0 && (
                  <>
                    <button
                      onClick={handleShare}
                      className="slip-header-btn"
                      aria-label="Share slip"
                      title="Share slip"
                      disabled={generating}
                    >
                      <Share2 size={14} />
                    </button>
                    <button
                      onClick={clear}
                      className="slip-header-btn danger"
                      aria-label="Clear slip"
                      title="Clear all legs"
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className="slip-header-divider" aria-hidden />
                  </>
                )}
                <button
                  onClick={close}
                  className="slip-header-btn"
                  aria-label="Close slip"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s-4)' }}>
              {legs.length === 0 ? (
                <Empty />
              ) : (
                <div className="stack-3">
                  <AnimatePresence initial={false}>
                    {legs.map((l) => (
                      <motion.div
                        key={l.id}
                        layout
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.22 }}
                      >
                        <LegRow
                          leg={l}
                          onRemove={() => removeLeg(l.id)}
                          onFlip={() => flipLeg(l.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {legs.length > 0 && (
              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  padding: 'var(--s-5)',
                  background: 'rgba(255,255,255,0.02)'
                }}
                className="stack-4"
              >
                <button
                  onClick={() => setStakeOpen((v) => !v)}
                  className="row"
                  aria-expanded={stakeOpen}
                  aria-controls="slip-stake-panel"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: '4px 2px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text)'
                  }}
                >
                  <div className="row gap-3">
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: 'var(--text-faint)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase'
                      }}
                    >
                      Stake & payout
                    </span>
                    {!stakeOpen && (
                      <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {formatUSD(stake)} · ×{combinedOdds.toFixed(2)} · {formatUSD(potentialPayout)}
                      </span>
                    )}
                  </div>
                  <motion.span
                    animate={{ rotate: stakeOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'inline-flex', color: 'var(--text-muted)' }}
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {stakeOpen && (
                    <motion.div
                      id="slip-stake-panel"
                      key="stake-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="stack-4">
                        <div className="stack-2">
                          <div style={{ position: 'relative' }}>
                            <input
                              className="input input-mono"
                              value={Number.isFinite(stake) ? String(stake) : ''}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value.replace(/[^\d.]/g, ''));
                                setStake(Number.isFinite(v) ? v : 0);
                              }}
                              inputMode="decimal"
                              style={{ paddingRight: 70, fontSize: 18, fontWeight: 600 }}
                            />
                            <span
                              className="mono"
                              style={{
                                position: 'absolute',
                                right: 14, top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: 13,
                                color: 'var(--text-muted)'
                              }}
                            >
                              USDC
                            </span>
                          </div>
                          <div className="row gap-2" style={{ marginTop: 4 }}>
                            {[10, 25, 100, 500].map((v) => (
                              <button
                                key={v}
                                onClick={() => setStake(v)}
                                className="btn btn-sm btn-ghost"
                                style={{ flex: 1, height: 32, fontSize: 12, padding: '0 8px' }}
                              >
                                ${v}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-md)',
                            padding: 'var(--s-4)'
                          }}
                          className="stack-3"
                        >
                          <Line k="Combined odds" v={`×${combinedOdds.toFixed(2)}`} mono />
                          <Line k="Implied probability" v={`${(100 / combinedOdds).toFixed(1)}%`} mono />
                          <Line k="Potential payout"   v={formatUSD(potentialPayout)} highlight />
                          <Line k="If all hit"         v={`+${formatUSD(profit)}`} tone="positive" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', height: 52, fontSize: 15 }}
                  onClick={handlePlaceParlay}
                  disabled={
                    !ready ||
                    placeStatus === 'placing' ||
                    placeStatus === 'success' ||
                    (authenticated && isConnected && stake <= 0)
                  }
                >
                  {placeStatus === 'placing' ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Placing leg {placeStep} of {legs.length}…
                    </>
                  ) : placeStatus === 'success' ? (
                    <>
                      <Check size={16} />
                      Parlay placed
                    </>
                  ) : !authenticated || !isConnected ? (
                    <>
                      <Wallet size={16} />
                      Connect wallet to place
                    </>
                  ) : (
                    <>
                      <Wallet size={16} />
                      Place parlay · {formatUSD(stake)}
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>

                {placeError && (
                  <div
                    className="row gap-2"
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--r-md)',
                      background: 'rgba(255, 77, 109, 0.08)',
                      border: '1px solid rgba(255, 77, 109, 0.35)',
                      color: 'var(--negative)',
                      fontSize: 12,
                      lineHeight: 1.4
                    }}
                  >
                    <AlertTriangle size={13} />
                    <span>{placeError}</span>
                  </div>
                )}

                {!authenticated || !isConnected ? (
                  <div
                    className="row gap-2"
                    style={{ justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}
                  >
                    <Wallet size={12} color="var(--accent-bright)" />
                    <span>Wallet required to settle onchain.</span>
                  </div>
                ) : (
                  <div
                    className="row gap-2"
                    style={{ justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}
                  >
                    <Sparkles size={12} color="var(--accent-bright)" />
                    <span>
                      {legs.length > 1
                        ? `${legs.length} legs · stake split evenly · ≈ $0.001 gas`
                        : 'One transaction · ≈ $0.001 gas'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <style jsx>{`
              :global(.slip-backdrop) {
                background: rgba(5, 5, 9, 0.6);
                backdrop-filter: blur(6px);
              }
              @media (min-width: 769px) {
                :global(.slip-backdrop) {
                  background: transparent;
                  backdrop-filter: none;
                }
              }

              /* ---------- Header action cluster ---------- */
              :global(.slip-header-actions) {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid var(--border);
                border-radius: var(--r-md);
              }
              :global(.slip-header-btn) {
                width: 32px; height: 32px;
                display: inline-flex; align-items: center; justify-content: center;
                background: transparent;
                border: none;
                border-radius: var(--r-sm);
                color: var(--text-muted);
                cursor: pointer;
                transition: background 140ms ease, color 140ms ease;
              }
              :global(.slip-header-btn:hover) {
                background: rgba(255, 255, 255, 0.07);
                color: var(--text);
              }
              :global(.slip-header-btn.danger:hover) {
                background: rgba(255, 77, 109, 0.10);
                color: var(--negative);
              }
              :global(.slip-header-btn:disabled) { opacity: 0.45; cursor: not-allowed; }
              :global(.slip-header-divider) {
                width: 1px; height: 18px;
                background: var(--border);
                margin: 0 2px;
              }
            `}</style>
          </motion.aside>

          {/* Share modal */}
          <AnimatePresence>
            {showShareModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowShareModal(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 100,
                  background: 'rgba(5, 5, 9, 0.8)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--s-4)'
                }}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.96, opacity: 0, y: 8 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  onClick={(e) => e.stopPropagation()}
                  className="card"
                  style={{
                    width: '100%',
                    maxWidth: 460,
                    padding: 0,
                    background: 'rgba(14, 14, 21, 0.98)',
                    backdropFilter: 'blur(20px)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 'var(--s-4)',
                      padding: 'var(--s-6)',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 6 }}>
                        Share your slip
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Anyone with this code can load the exact same picks.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowShareModal(false)}
                      aria-label="Close"
                      style={{
                        width: 32, height: 32, flexShrink: 0,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-sm)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'background 140ms ease'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'var(--surface)')}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Body */}
                  <div style={{ padding: 'var(--s-6)', display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
                    {/* Code hero */}
                    <div
                      style={{
                        background: 'linear-gradient(180deg, rgba(124,58,237,0.12), rgba(124,58,237,0.02))',
                        border: '1px solid var(--accent-ring)',
                        borderRadius: 'var(--r-md)',
                        padding: 'var(--s-5) var(--s-4)',
                        textAlign: 'center'
                      }}
                    >
                      <div
                        className="mono"
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          letterSpacing: '0.14em',
                          color: 'var(--accent-bright)',
                          marginBottom: 6,
                          textShadow: '0 2px 16px rgba(124,58,237,0.40)'
                        }}
                      >
                        {shareCode}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em' }}>
                        {legs.length} {legs.length === 1 ? 'LEG' : 'LEGS'} · ×{combinedOdds.toFixed(2)} COMBINED
                      </div>
                    </div>

                    {/* Copy actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-3)' }}>
                      <button
                        onClick={copyCode}
                        className="btn btn-primary"
                        style={{ height: 44, transition: 'background 200ms ease' }}
                      >
                        {copiedKind === 'code' ? <Check size={14} /> : <Copy size={14} />}
                        {copiedKind === 'code' ? 'Copied!' : 'Copy code'}
                      </button>
                      <button
                        onClick={copyLink}
                        className="btn btn-ghost"
                        style={{ height: 44 }}
                      >
                        {copiedKind === 'link' ? <Check size={14} /> : <Link2 size={14} />}
                        {copiedKind === 'link' ? 'Copied!' : 'Copy link'}
                      </button>
                    </div>

                    {/* Social share */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', marginTop: 'var(--s-2)' }}>
                      <div
                        className="mono"
                        style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.14em', textTransform: 'uppercase' }}
                      >
                        Share to
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-2)' }}>
                        <SocialButton label="X" onClick={openTwitterShare} brand="#000" />
                        <SocialButton label="Telegram" onClick={openTelegramShare} brand="#229ED9" icon={<Send size={14} />} />
                        <SocialButton label="WhatsApp" onClick={openWhatsappShare} brand="#25D366" />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      padding: 'var(--s-4) var(--s-6)',
                      borderTop: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.02)',
                      fontSize: 12,
                      color: 'var(--text-faint)',
                      textAlign: 'center',
                      lineHeight: 1.5
                    }}
                  >
                    Friends paste the code in the slip drawer to load these picks.
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

/* -------- Empty state -------- */

function Empty() {
  const { loadLegs } = useSlip();
  const [importCode, setImportCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setError('');
    const code = importCode.trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    try {
      const { decodeSlip } = await import('@/lib/slip-share');
      const { MARKETS } = await import('@/lib/data');

      const decoded = await decodeSlip(code);
      if (!decoded) {
        setError('Invalid or expired code');
        setLoading(false);
        return;
      }

      const legs = decoded.legs
        .map((leg) => {
          const market = MARKETS.find((m) => m.id === leg.m);
          if (!market) return null;
          return {
            id: leg.m,
            marketId: leg.m,
            title: market.title,
            category: market.category,
            side: leg.s,
            probability: leg.p
          };
        })
        .filter((l) => l !== null);

      if (legs.length === 0) {
        setError('No valid markets found');
        setLoading(false);
        return;
      }

      loadLegs(legs);
      setImportCode('');
    } catch {
      setError('Failed to load slip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        textAlign: 'center',
        padding: 'var(--s-12) var(--s-4)'
      }}
    >
      <div
        style={{
          width: 56, height: 56,
          borderRadius: 'var(--r-lg)',
          margin: '0 auto var(--s-4)',
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-ring)',
          color: 'var(--accent-bright)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Receipt size={22} />
      </div>
      <h3 style={{ fontSize: 17, marginBottom: 6 }}>Your slip is empty.</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 auto var(--s-6)', maxWidth: 280 }}>
        Add Yes or No to any market, or paste a shared slip code below.
      </p>

      <div style={{ maxWidth: 320, margin: '0 auto' }} className="stack-2">
        <div style={{ position: 'relative' }}>
          <input
            className="input input-mono"
            placeholder="XPABC123"
            value={importCode}
            onChange={(e) => {
              setImportCode(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleImport()}
            style={{ fontSize: 14, textAlign: 'center', textTransform: 'uppercase' }}
            disabled={loading}
          />
        </div>
        {error && (
          <div style={{ fontSize: 12, color: 'var(--negative)', textAlign: 'center' }}>
            {error}
          </div>
        )}
        <button
          onClick={handleImport}
          disabled={!importCode.trim() || loading}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%' }}
        >
          <Download size={14} />
          {loading ? 'Loading...' : 'Load slip'}
        </button>
      </div>
    </div>
  );
}

/* -------- Leg row -------- */

function LegRow({
  leg, onRemove, onFlip
}: { leg: import('./SlipContext').SlipLeg; onRemove: () => void; onFlip: () => void }) {
  const color = leg.side === 'yes' ? 'var(--positive)' : 'var(--negative)';
  const soft  = leg.side === 'yes' ? 'var(--positive-soft)' : 'var(--negative-soft)';
  const pct = Math.round(leg.probability * 100);
  const dec = (1 / Math.max(0.01, leg.probability));

  return (
    <div
      className="card"
      style={{ padding: 'var(--s-4)', borderColor: 'var(--border)' }}
    >
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: 'var(--text-faint)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}
        >
          {leg.category}
        </span>
        <button
          onClick={onRemove}
          aria-label="Remove leg"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 'var(--s-3)' }}>
        {leg.title}
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button
          onClick={onFlip}
          className="row gap-2"
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--r-sm)',
            background: soft,
            border: `1px solid ${color}40`,
            color,
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
          title="Flip side"
        >
          {leg.side}
          <span style={{ opacity: 0.6 }}>{pct}¢</span>
        </button>
        <div className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>
          ×{dec.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

function Line({ k, v, mono, highlight, tone }: {
  k: string; v: string; mono?: boolean; highlight?: boolean; tone?: 'positive';
}) {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k}</span>
      <span
        className={mono || highlight ? 'mono' : undefined}
        style={{
          fontSize: highlight ? 15 : 13,
          fontWeight: highlight ? 700 : 500,
          color: tone === 'positive' ? 'var(--positive)' : 'var(--text)'
        }}
      >
        {v}
      </span>
    </div>
  );
}

function SocialButton({
  label, onClick, brand, icon
}: { label: string; onClick: () => void; brand: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 40,
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--r-md)',
        color: 'var(--text)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 140ms ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = brand;
        e.currentTarget.style.background = `${brand}1f`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.background = 'var(--surface)';
      }}
    >
      {icon}
      {label}
    </button>
  );
}
