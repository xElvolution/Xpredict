import { Bot, Activity, ShieldCheck, MessageSquare, ArrowRight } from 'lucide-react';
import { AGENTS } from '@/lib/data';
import { formatNumber, formatUSD, formatPct } from '@/lib/format';

const ROLE_ICON: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Curator: Bot,
  Pricing: Activity,
  Resolver: ShieldCheck,
  Coach: MessageSquare
};

const ROLE_HUE: Record<string, string> = {
  Curator:  '#8B5CF6',
  Pricing:  '#5EEAD4',
  Resolver: '#00FF87',
  Coach:    '#FFB020'
};

export default function AgentsPage() {
  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container">
        {/* Hero block */}
        <div className="stack-4" style={{ maxWidth: 760, marginBottom: 'var(--s-12)' }}>
          <span className="eyebrow">Agent stack</span>
          <h1 style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)' }}>
            <span className="gradient-text">Autonomous from prompt to payout.</span>
          </h1>
          <p>
            Four specialized agents run XPredict end-to-end on X Layer. They are open-source,
            replaceable, and every decision they make is verifiable onchain.
          </p>
        </div>

        {/* Flow diagram */}
        <div
          className="card"
          style={{ padding: 'var(--s-8)', marginBottom: 'var(--s-12)', overflow: 'hidden' }}
        >
          <div
            className="row"
            style={{ justifyContent: 'space-between', gap: 'var(--s-4)', flexWrap: 'wrap' }}
          >
            <FlowStep
              n="1"
              hue={ROLE_HUE.Curator}
              label="Ingest fixtures"
              sub="API-Football · Sportradar"
            />
            <Arrow />
            <FlowStep n="2" hue={ROLE_HUE.Curator} label="Draft market" sub="Curator agent" />
            <Arrow />
            <FlowStep n="3" hue={ROLE_HUE.Pricing} label="Open trading" sub="LMSR pricing agent" />
            <Arrow />
            <FlowStep n="4" hue={ROLE_HUE.Resolver} label="Settle outcome" sub="Resolver consensus" />
          </div>
        </div>

        {/* Agent cards */}
        <div className="stack-3" style={{ marginBottom: 'var(--s-8)' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>Meet the roster</h2>
          <p>Each agent runs as a discrete service. Anyone can fork or replace them via the SDK.</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 'var(--s-6)',
            marginBottom: 'var(--s-12)'
          }}
          className="agents-grid"
        >
          {AGENTS.map((a) => {
            const Icon = ROLE_ICON[a.role];
            const hue  = ROLE_HUE[a.role];
            return (
              <div key={a.handle} className="card card-glow">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div className="row gap-3">
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--r-md)',
                        background: `${hue}1a`,
                        border: `1px solid ${hue}33`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: hue
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <div className="stack-2">
                      <div
                        className="mono"
                        style={{ fontSize: 11, color: hue, letterSpacing: '0.14em', textTransform: 'uppercase' }}
                      >
                        {a.role}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
                        {a.name}
                      </div>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {a.handle}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-positive badge-live">{a.status}</span>
                </div>

                <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 'var(--s-5)' }}>
                  {describe(a.role)}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 0,
                    marginTop: 'var(--s-5)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    overflow: 'hidden'
                  }}
                >
                  <Metric k={a.role === 'Curator' ? 'Markets' : 'Decisions'} v={formatNumber(a.marketsCreated || 18_440)} />
                  <Metric k="Accuracy" v={a.accuracy > 0 ? formatPct(a.accuracy, 1) : 'N/A'} border />
                  <Metric k="Routed"   v={formatUSD(a.volumeRouted)} border />
                </div>

                <div className="row gap-2" style={{ marginTop: 'var(--s-5)' }}>
                  <button className="btn btn-ghost btn-sm">
                    View logs
                    <ArrowRight size={13} />
                  </button>
                  <button className="btn btn-ghost btn-sm">View spec</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SDK call to build */}
        <div
          className="card card-glow"
          style={{
            padding: 'var(--s-10)',
            position: 'relative',
            overflow: 'hidden',
            borderColor: 'var(--accent-ring)'
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(420px 240px at 90% 10%, rgba(124, 58, 237, 0.20), transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
            <div className="stack-3" style={{ maxWidth: 520 }}>
              <span className="eyebrow">Agent SDK</span>
              <h3 style={{ fontSize: 'clamp(1.5rem, 2vw, 2rem)' }}>Run your own agent on XPredict.</h3>
              <p>
                Plug in a new pricing model, write a smarter resolver, or build a Coach that
                specializes in one sport. Agents earn protocol fees proportional to volume they
                route or settle.
              </p>
            </div>
            <div className="stack-3" style={{ minWidth: 240 }}>
              <a className="btn btn-primary" href="https://github.com/xElvolution/Xpredict/tree/main/xpredict-sdk">
                Read the SDK docs
                <ArrowRight size={14} />
              </a>
              <a className="btn btn-ghost" href="https://github.com/xElvolution/Xpredict">View on GitHub</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .agents-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function describe(role: string): string {
  switch (role) {
    case 'Curator':
      return 'Ingests live fixtures across football, basketball, UFC, tennis, esports, and macro feeds. Drafts new prediction markets every few minutes, with seed liquidity sourced from the protocol vault.';
    case 'Pricing':
      return 'Runs a logarithmic market scoring rule (LMSR) onchain. Continuously rebalances Yes/No odds as orders fill, ensuring there is always a quotable price on either side.';
    case 'Resolver':
      return 'Cross-references three independent data sources after each event closes. Posts an attestation that requires 2-of-3 source consensus before settling the contract.';
    case 'Coach':
      return 'Conversational agent that shares head-to-head stats, form, and historical context but never directs your prediction.';
    default:
      return '';
  }
}

function FlowStep({ n, hue, label, sub }: { n: string; hue: string; label: string; sub: string }) {
  return (
    <div className="stack-2" style={{ alignItems: 'center', textAlign: 'center', minWidth: 140 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--r-lg)',
          background: `${hue}1a`,
          border: `1px solid ${hue}55`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: hue,
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          fontSize: 18
        }}
      >
        {n}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{label}</div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div aria-hidden style={{ flex: 1, minWidth: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
      <svg width="100%" height="14" viewBox="0 0 80 14" preserveAspectRatio="none">
        <line x1="0" y1="7" x2="74" y2="7" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
        <polyline points="68,2 76,7 68,12" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

function Metric({ k, v, border }: { k: string; v: string; border?: boolean }) {
  return (
    <div style={{ padding: 'var(--s-4)', borderLeft: border ? '1px solid var(--border)' : 'none' }}>
      <div
        className="mono"
        style={{ fontSize: 10, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em' }}
      >
        {k}
      </div>
      <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{v}</div>
    </div>
  );
}
