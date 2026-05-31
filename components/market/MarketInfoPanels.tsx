'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function Panel({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <button
        type="button"
        className="row"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          justifyContent: 'space-between',
          padding: 'var(--s-4) var(--s-5)',
          background: 'transparent',
          border: 'none',
          color: 'var(--text)',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div style={{ padding: '0 var(--s-5) var(--s-5)' }}>{children}</div>}
    </div>
  );
}

export function MarketInfoPanels({
  subtitle,
  agent,
  closesAt,
  category,
  resolved,
  winningOutcome
}: {
  subtitle?: string;
  agent?: string;
  closesAt: string;
  category: string;
  resolved?: boolean;
  winningOutcome?: number;
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <Panel title="Resolution rules" defaultOpen>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
          {subtitle || 'This market resolves based on official event outcomes verified by the protocol Resolver agent across independent data sources.'}
        </p>
        <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <li>Closes: {new Date(closesAt).toLocaleString()}</li>
          <li>Category: {category}</li>
          <li>Settlement: USDC on X Layer</li>
          {resolved && <li>Outcome: {winningOutcome === 0 ? 'YES' : 'NO'}</li>}
        </ul>
      </Panel>
      <Panel title="Agent & curator">
        <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>
          Proposed by <strong>{agent ?? '@curator.ai'}</strong>. Approved by protocol Curator before on-chain deployment.
        </p>
      </Panel>
      <Panel title="Trading modes">
        <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
          <strong>AMM</strong> — instant execution against the on-chain pool.<br />
          <strong>CLOB</strong> — post limit orders; matched orders appear in your profile and trade history.
        </p>
      </Panel>
      <Panel title="World Cup / match context">
        <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>
          {category === 'Football'
            ? 'Football markets align with official match results (90 minutes + stoppage time unless stated otherwise). FIFA World Cup 2026 markets use the same resolution standard.'
            : 'Event context and resolution criteria are defined in the market subtitle above.'}
        </p>
      </Panel>
    </div>
  );
}
