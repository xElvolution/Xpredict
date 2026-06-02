'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import {
  User,
  Bell,
  Network,
  Droplet,
  Sun,
  Moon,
  ChevronDown,
  Save,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Copy
} from 'lucide-react';
import { xLayer, xLayerTestnet } from '@/lib/chains';
import { formatAddress } from '@/lib/format';

type SettingsSection = 'profile' | 'notifications' | 'theme' | 'network';

type SettingsData = {
  name: string;
  username: string;
  email: string;
  orderNotifications: boolean;
  marketNotifications: boolean;
};

const STORAGE_KEY = 'xpredict.settings.v1';

const SIDEBAR_ITEMS: { id: SettingsSection; label: string; icon: typeof User }[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'theme',         label: 'Theme',         icon: Droplet },
  { id: 'network',       label: 'Network',       icon: Network }
];

function loadSettings(): SettingsData {
  if (typeof window === 'undefined') {
    return { name: '', username: '', email: '', orderNotifications: true, marketNotifications: true };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { name: '', username: '', email: '', orderNotifications: true, marketNotifications: true };
    return JSON.parse(raw);
  } catch {
    return { name: '', username: '', email: '', orderNotifications: true, marketNotifications: true };
  }
}

function loadTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('xpredict.theme') as 'dark' | 'light') ?? 'dark';
}

function SettingsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, user, ready } = usePrivy();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();

  const initialSection = useMemo<SettingsSection>(() => {
    const param = searchParams.get('section');
    if (param === 'profile' || param === 'notifications' || param === 'theme' || param === 'network') return param;
    return 'profile';
  }, [searchParams]);

  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [settings, setSettings] = useState<SettingsData>(loadSettings);
  const [theme, setTheme] = useState<'dark' | 'light'>(loadTheme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [showMainnetConfirm, setShowMainnetConfirm] = useState(false);
  const [pendingNetwork, setPendingNetwork] = useState<'mainnet' | 'testnet' | null>(null);

  const [isMobileDropdownOpen, setMobileOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Sync section to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('section') !== activeSection) {
      params.set('section', activeSection);
      router.replace(`/settings?${params.toString()}`, { scroll: false });
    }
  }, [activeSection, router]);

  // Pull email from Privy user
  useEffect(() => {
    if (user?.email?.address && !settings.email) {
      setSettings((s) => ({ ...s, email: user.email!.address }));
    }
  }, [user]);

  // Close mobile dropdown on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Redirect if not signed in
  useEffect(() => {
    if (ready && !authenticated) router.push('/');
  }, [ready, authenticated, router]);

  const selectedNetwork: 'mainnet' | 'testnet' = chainId === xLayer.id ? 'mainnet' : 'testnet';

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      await new Promise((r) => setTimeout(r, 400));
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (next: 'dark' | 'light') => {
    setTheme(next);
    localStorage.setItem('xpredict.theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleNetworkChange = (next: 'mainnet' | 'testnet') => {
    if (next === selectedNetwork) return;
    if (next === 'mainnet') {
      setPendingNetwork('mainnet');
      setShowMainnetConfirm(true);
      return;
    }
    switchChain({ chainId: xLayerTestnet.id });
  };

  const confirmNetworkSwitch = () => {
    if (pendingNetwork === 'mainnet') switchChain({ chainId: xLayer.id });
    setShowMainnetConfirm(false);
    setPendingNetwork(null);
  };

  const copyAddress = () => {
    if (address) navigator.clipboard.writeText(address);
  };

  if (!ready) {
    return (
      <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading…
        </div>
      </section>
    );
  }

  if (!authenticated) return null;

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-8))' }}>
      <div className="container">
        <div className="settings-layout">
          {/* Mobile dropdown */}
          <div className="settings-mobile-nav" ref={mobileDropdownRef}>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="settings-mobile-toggle"
            >
              <span className="row gap-3">
                {(() => {
                  const Icon = SIDEBAR_ITEMS.find((i) => i.id === activeSection)?.icon ?? User;
                  return <Icon size={18} />;
                })()}
                <span>{SIDEBAR_ITEMS.find((i) => i.id === activeSection)?.label}</span>
              </span>
              <ChevronDown
                size={18}
                style={{ transition: 'transform 200ms', transform: isMobileDropdownOpen ? 'rotate(180deg)' : undefined, color: 'var(--text-muted)' }}
              />
            </button>
            {isMobileDropdownOpen && (
              <div className="settings-mobile-list">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileOpen(false);
                      }}
                      className={`settings-mobile-item${isActive ? ' active' : ''}`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <aside className="settings-sidebar">
            <nav className="stack-1">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`settings-side-item${isActive ? ' active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <div className="settings-content-wrap">
            <div className="settings-content card">
              <div className="settings-content-body">
                {activeSection === 'profile' && (
                  <Section title="Profile">
                    <Field label="Name">
                      <input
                        className="input"
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        placeholder="Your name"
                      />
                    </Field>

                    <Field label="Username" hint="Your unique handle (without @)">
                      <input
                        className="input"
                        type="text"
                        value={settings.username}
                        onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                        placeholder="your_username"
                      />
                    </Field>

                    <Field label="Email" hint="Email comes from your sign-in provider and cannot be changed here">
                      <input
                        className="input"
                        type="email"
                        value={settings.email}
                        disabled
                        style={{ opacity: 0.7 }}
                      />
                    </Field>

                    {address && (
                      <Field label="Connected wallet" hint="Tap to copy">
                        <button
                          onClick={copyAddress}
                          className="row gap-2 settings-wallet-pill"
                        >
                          <span style={{ flex: 1 }}>{formatAddress(address)}</span>
                          <Copy size={14} color="var(--text-muted)" />
                        </button>
                      </Field>
                    )}
                  </Section>
                )}

                {activeSection === 'notifications' && (
                  <Section title="Notifications">
                    <Toggle
                      title="Trade notifications"
                      description="Ping me when my approve, buy, or claim transactions confirm onchain."
                      checked={settings.orderNotifications}
                      onChange={(v) => setSettings({ ...settings, orderNotifications: v })}
                    />
                    <Toggle
                      title="New market alerts"
                      description="Let me know when the Curator agent posts a new market in a category I follow."
                      checked={settings.marketNotifications}
                      onChange={(v) => setSettings({ ...settings, marketNotifications: v })}
                    />
                  </Section>
                )}

                {activeSection === 'theme' && (
                  <Section title="Theme" description="XPredict ships dark-first. Light mode is on the roadmap.">
                    <ThemeOption
                      icon={Sun}
                      title="Light Mode"
                      description="Bright and clean. Coming soon"
                      active={theme === 'light'}
                      onClick={() => handleThemeChange('light')}
                      disabled
                    />
                    <ThemeOption
                      icon={Moon}
                      title="Dark Mode"
                      description="Easy on the eyes, optimized for late-night sport-watching"
                      active={theme === 'dark'}
                      onClick={() => handleThemeChange('dark')}
                    />
                  </Section>
                )}

                {activeSection === 'network' && (
                  <Section
                    title="Network"
                    description="Choose which X Layer network to use for trades, claims, and market creation."
                  >
                    <NetworkOption
                      title="Mainnet (X Layer)"
                      network="mainnet"
                      selected={selectedNetwork}
                      onSelect={() => handleNetworkChange('mainnet')}
                      bullets={['Real funds, real USDC', 'All transactions are final']}
                      accent="positive"
                    />
                    <NetworkOption
                      title="Testnet (X Layer Testnet)"
                      network="testnet"
                      selected={selectedNetwork}
                      onSelect={() => handleNetworkChange('testnet')}
                      bullets={[
                        'Testnet funds are not real money',
                        'Testnet profits are not withdrawable',
                        'Use the faucet to claim 10k test USDC'
                      ]}
                      accent="warning"
                      showFaucetCta
                    />
                  </Section>
                )}
              </div>

              {(activeSection === 'profile' || activeSection === 'notifications') && (
                <div className="settings-save-bar">
                  <button onClick={handleSave} disabled={saving} className="btn btn-primary settings-save-btn">
                    {saving ? <Loader2 size={14} className="spin" /> : saved ? <Save size={14} /> : <Save size={14} />}
                    {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mainnet switch confirmation */}
      {showMainnetConfirm && (
        <div
          onClick={() => { setShowMainnetConfirm(false); setPendingNetwork(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(5,5,9,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-4)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 440, padding: 'var(--s-6)' }}
          >
            <div className="row gap-2" style={{ marginBottom: 'var(--s-4)' }}>
              <AlertTriangle size={18} color="var(--warning)" />
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Switch to Mainnet?</h3>
            </div>
            <p style={{ color: 'var(--text-dim)', marginBottom: 'var(--s-5)', fontSize: 14 }}>
              You are switching to X Layer mainnet. Trades will use real USDC and OKB. All transactions are final and cannot be reversed.
            </p>
            <div className="row gap-2">
              <button
                onClick={() => { setShowMainnetConfirm(false); setPendingNetwork(null); }}
                className="btn btn-ghost"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button onClick={confirmNetworkSwitch} className="btn btn-primary" style={{ flex: 1 }} disabled={switching}>
                {switching ? 'Switching…' : 'Switch to Mainnet'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ============================================================
           SETTINGS LAYOUT
           Spacing system: every gap derives from --s-* tokens.
           No hardcoded pixels. Container = .settings-content (card).
           ============================================================ */

        .settings-layout {
          display: grid;
          grid-template-columns: 256px minmax(0, 1fr);
          gap: var(--s-8);
          align-items: flex-start;
        }
        .settings-mobile-nav { display: none; position: relative; }

        @media (max-width: 900px) {
          .settings-layout { grid-template-columns: 1fr; gap: var(--s-4); }
          .settings-sidebar { display: none; }
          .settings-mobile-nav { display: block; }
        }

        /* ---------- Mobile dropdown ---------- */
        .settings-mobile-toggle {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          padding: var(--s-3) var(--s-4);
          background: var(--surface);
          border: 1px solid var(--border-strong);
          border-radius: var(--r-md);
          color: var(--text);
          font-weight: 600;
          font-size: 14px;
        }
        .settings-mobile-list {
          position: absolute; z-index: 10;
          top: calc(100% + var(--s-2));
          left: 0; right: 0;
          background: var(--card);
          border: 1px solid var(--border-strong);
          border-radius: var(--r-md);
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.55);
        }
        .settings-mobile-item {
          width: 100%; display: flex; align-items: center; gap: var(--s-3);
          padding: var(--s-3) var(--s-4);
          text-align: left;
          color: var(--text-dim);
          font-size: 14px;
          transition: background 120ms ease;
        }
        .settings-mobile-item:hover { background: rgba(255,255,255,0.04); }
        .settings-mobile-item.active {
          background: var(--accent-soft);
          color: var(--accent-bright);
          font-weight: 600;
        }

        /* ---------- Desktop sidebar ---------- */
        .settings-sidebar { position: sticky; top: calc(var(--nav-h) + var(--s-6)); }
        .settings-side-item {
          width: 100%;
          display: flex; align-items: center; gap: var(--s-3);
          padding: var(--s-3) var(--s-4);
          text-align: left;
          color: var(--text-dim);
          font-size: 14px;
          font-weight: 500;
          border-radius: var(--r-md);
          transition: background 140ms ease, color 140ms ease;
        }
        .settings-side-item:hover { background: rgba(255,255,255,0.03); color: var(--text); }
        .settings-side-item.active {
          background: var(--accent-soft);
          color: var(--accent-bright);
          font-weight: 600;
        }

        /* ---------- Content card — single source of truth for padding ---------- */
        .settings-content {
          padding: 0;
          overflow: hidden;
        }
        .settings-content-body {
          padding: var(--s-6);
        }
        @media (min-width: 900px) {
          .settings-content-body { padding: var(--s-8); }
        }

        /* ---------- Save bar lives INSIDE the card, divided by border-top ---------- */
        .settings-save-bar {
          display: flex;
          justify-content: flex-end;
          padding: var(--s-5) var(--s-6);
          background: rgba(255,255,255,0.02);
          border-top: 1px solid var(--border);
        }
        @media (min-width: 900px) {
          .settings-save-bar { padding: var(--s-5) var(--s-8); }
        }
        @media (max-width: 640px) {
          .settings-save-bar > :global(button) { width: 100%; }
        }
        .settings-save-btn { min-width: 180px; }

        /* ---------- Wallet pill (profile section) ---------- */
        .settings-wallet-pill {
          width: 100%;
          padding: var(--s-3) var(--s-4);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 13px;
          text-align: left;
          transition: border-color 140ms ease;
        }
        .settings-wallet-pill:hover { border-color: var(--border-strong); }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}

/* ---------- helpers ---------- */

function Section({
  title, description, children
}: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="stack-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h1>
        {description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{description}</p>
        )}
      </div>
      <div className="stack-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="stack-2">
      <label
        className="mono"
        style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
      >
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  );
}

function Toggle({
  title, description, checked, onChange
}: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1px auto',
        alignItems: 'center',
        gap: 'var(--s-5)',
        padding: 'var(--s-5)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)'
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
          {description}
        </div>
      </div>
      <div style={{ width: 1, height: 36, background: 'var(--border)' }} aria-hidden />
      <button
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        aria-label={title}
        style={{
          width: 48, height: 26, borderRadius: 999,
          background: checked ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${checked ? 'var(--accent-bright)' : 'rgba(255,255,255,0.10)'}`,
          position: 'relative', flexShrink: 0,
          transition: 'background 200ms ease, border-color 200ms ease',
          boxShadow: checked ? '0 4px 14px rgba(124,58,237,0.40)' : 'none'
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2, left: checked ? 24 : 2,
            width: 20, height: 20, borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.30)',
            transition: 'left 200ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </button>
    </div>
  );
}

function ThemeOption({
  icon: Icon, title, description, active, onClick, disabled
}: {
  icon: typeof Sun; title: string; description: string;
  active: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'var(--s-4)',
        alignItems: 'flex-start',
        padding: 'var(--s-5)',
        background: active ? 'var(--accent-soft)' : 'var(--surface)',
        border: `2px solid ${active ? 'var(--accent-bright)' : 'var(--border)'}`,
        borderRadius: 'var(--r-md)',
        width: '100%',
        textAlign: 'left',
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'border-color 160ms ease, background 160ms ease'
      }}
    >
      <span
        style={{
          marginTop: 4, width: 18, height: 18, borderRadius: 999,
          border: `2px solid ${active ? 'var(--accent-bright)' : 'var(--border-strong)'}`,
          background: active ? 'var(--accent-bright)' : 'transparent',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'all 160ms ease'
        }}
      >
        {active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
      </span>
      <div>
        <div className="row gap-2" style={{ marginBottom: 6 }}>
          <Icon size={16} color={active ? 'var(--accent-bright)' : 'var(--text-muted)'} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
          {active && (
            <span
              style={{
                background: 'rgba(124,58,237,0.18)',
                color: 'var(--accent-bright)',
                border: '1px solid var(--accent-ring)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '3px 8px',
                borderRadius: 999,
                textTransform: 'uppercase'
              }}
            >
              Current
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</div>
      </div>
    </button>
  );
}

function NetworkOption({
  title, network, selected, onSelect, bullets, accent, showFaucetCta
}: {
  title: string;
  network: 'mainnet' | 'testnet';
  selected: 'mainnet' | 'testnet';
  onSelect: () => void;
  bullets: string[];
  accent: 'positive' | 'warning';
  showFaucetCta?: boolean;
}) {
  const active = selected === network;
  const accentColor = accent === 'positive' ? 'var(--positive)' : 'var(--warning)';
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'var(--s-4)',
        alignItems: 'flex-start',
        padding: 'var(--s-5)',
        background: active ? 'var(--accent-soft)' : 'var(--surface)',
        border: `2px solid ${active ? accentColor : 'var(--border)'}`,
        borderRadius: 'var(--r-md)',
        cursor: 'pointer',
        transition: 'border-color 160ms ease, background 160ms ease'
      }}
    >
      <span
        style={{
          marginTop: 4, width: 18, height: 18, borderRadius: 999,
          border: `2px solid ${active ? accentColor : 'var(--border-strong)'}`,
          background: active ? accentColor : 'transparent',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'all 160ms ease'
        }}
      >
        {active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
      </span>
      <div>
        <div className="row gap-2" style={{ marginBottom: 'var(--s-3)' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          {active && (
            <span
              style={{
                background: `${accentColor}1f`,
                color: accentColor,
                border: `1px solid ${accentColor}55`,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '3px 8px',
                borderRadius: 999,
                textTransform: 'uppercase'
              }}
            >
              Current
            </span>
          )}
        </div>
        <div className="stack-2">
          {bullets.map((b) => (
            <div key={b} className="row gap-2" style={{ alignItems: 'flex-start' }}>
              <AlertCircle size={13} color={accentColor} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>
        {showFaucetCta && active && (
          <a
            href="/markets"
            onClick={(e) => e.stopPropagation()}
            className="btn btn-primary"
            style={{ marginTop: 'var(--s-4)', width: '100%' }}
          >
            <Droplet size={14} />
            Claim 10k test USDC
          </a>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
          <div className="container" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading settings…
          </div>
        </section>
      }
    >
      <SettingsPageInner />
    </Suspense>
  );
}
