'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Copy, Download, Layers, Receipt, Share2, Sparkles, Trash2, Wallet, X
} from 'lucide-react';
import { useSlip } from './SlipContext';
import { formatUSD } from '@/lib/format';
import { encodeSlip } from '@/lib/slip-share';

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
        right: 20,
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        zIndex: 80,
        padding: '12px 18px',
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
  };

  const copyLink = () => {
    const url = `${window.location.origin}/slip/${shareCode}`;
    navigator.clipboard.writeText(url);
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
              <div className="row gap-1">
                {legs.length > 0 && (
                  <>
                    <button
                      onClick={handleShare}
                      className="btn-icon"
                      aria-label="Share slip"
                      style={{ width: 32, height: 32 }}
                      disabled={generating}
                    >
                      <Share2 size={14} />
                    </button>
                    <button
                      onClick={clear}
                      className="btn-icon"
                      aria-label="Clear slip"
                      style={{ width: 32, height: 32 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
                <button
                  onClick={close}
                  className="btn-icon"
                  aria-label="Close slip"
                  style={{ width: 32, height: 32 }}
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
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', height: 52, fontSize: 15 }}
                >
                  <Wallet size={16} />
                  Place parlay · {formatUSD(stake)}
                  <ChevronRight size={14} />
                </button>

                <div
                  className="row gap-2"
                  style={{ justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}
                >
                  <Sparkles size={12} color="var(--accent-bright)" />
                  <span>One transaction · all legs must hit · ≈ $0.001 gas</span>
                </div>
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
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="card"
                  style={{
                    width: '100%',
                    maxWidth: 440,
                    padding: 'var(--s-6)',
                    background: 'rgba(14, 14, 21, 0.98)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  <div className="stack-5">
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                          Share slip
                        </h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          Anyone with this code can load your parlay
                        </p>
                      </div>
                      <button
                        onClick={() => setShowShareModal(false)}
                        className="btn-icon"
                        style={{ width: 32, height: 32 }}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                        padding: 'var(--s-4)',
                        textAlign: 'center'
                      }}
                    >
                      <div
                        className="mono"
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          color: 'var(--accent-bright)',
                          marginBottom: 'var(--s-2)'
                        }}
                      >
                        {shareCode}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                        {legs.length} {legs.length === 1 ? 'leg' : 'legs'} · ×{combinedOdds.toFixed(2)} odds
                      </div>
                    </div>

                    <div className="row gap-2">
                      <button
                        onClick={copyCode}
                        className="btn btn-primary"
                        style={{ flex: 1, height: 44 }}
                      >
                        <Copy size={14} />
                        Copy code
                      </button>
                      <button
                        onClick={copyLink}
                        className="btn btn-ghost"
                        style={{ flex: 1, height: 44 }}
                      >
                        <Download size={14} />
                        Copy link
                      </button>
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-faint)',
                        textAlign: 'center',
                        lineHeight: 1.4
                      }}
                    >
                      Share this code with friends. They can paste it in the slip drawer to load the same picks.
                    </div>
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
