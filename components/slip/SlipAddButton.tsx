'use client';

import { Check, Plus } from 'lucide-react';
import { useSlip, type SlipLeg } from './SlipContext';

/**
 * Compact Yes/No button used by market cards and the arena to push legs onto the slip.
 * If the same market is already on the slip, clicking again removes it.
 */
export function SlipAddButton({
  leg, full = false
}: { leg: SlipLeg; full?: boolean }) {
  const { addLeg, removeLeg, hasLeg } = useSlip();
  const onSlip = hasLeg(leg.marketId, leg.side);
  const color  = leg.side === 'yes' ? 'var(--positive)' : 'var(--negative)';
  const soft   = leg.side === 'yes' ? 'var(--positive-soft)' : 'var(--negative-soft)';
  const pct    = Math.round(leg.probability * 100);
  const label  = leg.side === 'yes' ? 'Yes' : 'No';

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSlip) removeLeg(leg.marketId);
        else addLeg(leg);
      }}
      className="row"
      style={{
        flex: full ? 1 : undefined,
        justifyContent: 'space-between',
        gap: 8,
        padding: full ? '10px 14px' : '8px 12px',
        borderRadius: 'var(--r-md)',
        background: onSlip ? color : soft,
        border: `1px solid ${onSlip ? color : color + '40'}`,
        color: onSlip ? '#0A0A0F' : color,
        fontFamily: 'var(--font-mono)',
        fontSize: full ? 13 : 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        transition: 'all 180ms ease'
      }}
    >
      <span className="row gap-2">
        {onSlip ? <Check size={13} /> : <Plus size={13} />}
        {label}
      </span>
      <span style={{ opacity: 0.75 }}>{pct}¢</span>
    </button>
  );
}
