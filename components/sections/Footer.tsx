import Link from 'next/link';

const COLS = [
  {
    title: 'Product',
    links: [
      { href: '/markets',     label: 'Markets' },
      { href: '/live',        label: 'Live feed' },
      { href: '/agents',      label: 'Agents' },
      { href: '/leaderboard', label: 'Leaderboard' }
    ]
  },
  {
    title: 'Build',
    links: [
      { href: 'https://github.com/xElvolution/Xpredict/tree/main/xpredict-sdk', label: 'Documentation' },
      { href: 'https://github.com/xElvolution/Xpredict/tree/main/contracts', label: 'Smart contracts' },
      { href: '/api/v1/openapi', label: 'API reference' },
      { href: 'https://github.com/xElvolution/Xpredict/tree/main/xpredict-sdk', label: 'Agent SDK' }
    ]
  },
  {
    title: 'Network',
    links: [
      { href: 'https://www.okx.com/xlayer',         label: 'X Layer' },
      { href: 'https://www.oklink.com/xlayer',      label: 'Explorer' },
      { href: '#',                                  label: 'Bridge' },
      { href: '#',                                  label: 'Status' }
    ]
  }
];

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: 'var(--s-24)' }}>
      <div className="container" style={{ padding: 'var(--s-16) var(--s-6) var(--s-10)' }}>
        <div className="footer-grid">
          <div className="stack-4">
            <div className="row gap-2">
              <Mark />
              <strong style={{ letterSpacing: '-0.02em' }}>XPredict</strong>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 320 }}>
              The autonomous prediction arena. Markets created, priced, and resolved by AI agents on X Layer.
            </p>
            <div className="row gap-2">
              <span className="badge badge-positive badge-live">Network online</span>
              <span className="badge badge-neutral">v0.1</span>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title} className="stack-3">
              <div
                className="mono"
                style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em' }}
              >
                {col.title}
              </div>
              {col.links.map((l) => {
                const isExternal = l.href.startsWith('http');
                if (isExternal) {
                  return (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                      style={{ fontSize: 14 }}
                    >
                      {l.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="footer-link"
                    style={{ fontSize: 14 }}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="divider" style={{ margin: 'var(--s-10) 0' }} />

        <div className="footer-bottom">
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>
            © 2026 XPredict · Built for OKX XCup · Not financial advice
          </div>
          <div className="row gap-4 footer-bottom-links">
            <a className="nav-link" href="#" style={{ padding: 0, fontSize: 13 }}>Terms</a>
            <a className="nav-link" href="#" style={{ padding: 0, fontSize: 13 }}>Privacy</a>
            <a className="nav-link" href="#" style={{ padding: 0, fontSize: 13 }}>Discord</a>
            <a className="nav-link" href="#" style={{ padding: 0, fontSize: 13 }}>X / Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="flg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" />
      <path d="M9 9 L16 17 L23 9" stroke="url(#flg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9 17 L16 25 L23 17" stroke="#FFFFFF" strokeOpacity="0.95" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
