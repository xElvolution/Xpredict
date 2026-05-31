'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Settings, Bell, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { fetchSettings, patchSettings } from '@/lib/platform/client';
import { formatAddress } from '@/lib/format';

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyResolves, setNotifyResolves] = useState(true);
  const [notifyAgents, setNotifyAgents] = useState(true);
  const [notifyDeposits, setNotifyDeposits] = useState(true);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }
    fetchSettings(address)
      .then(({ settings }) => {
        setDisplayName((settings.display_name as string) ?? '');
        setEmail((settings.email as string) ?? '');
        setNotifyOrders(settings.notify_orders !== false);
        setNotifyResolves(settings.notify_resolves !== false);
        setNotifyAgents(settings.notify_agents !== false);
        setNotifyDeposits(settings.notify_deposits !== false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [address]);

  const save = async () => {
    if (!address) return;
    setSaving(true);
    setSaved(false);
    try {
      await patchSettings(address, {
        display_name: displayName || null,
        email: email || null,
        notify_orders: notifyOrders,
        notify_resolves: notifyResolves,
        notify_agents: notifyAgents,
        notify_deposits: notifyDeposits
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-16))' }}>
        <div className="container" style={{ maxWidth: 520 }}>
          <div className="card card-glow" style={{ padding: 'var(--s-10)', textAlign: 'center' }}>
            <Settings size={40} style={{ margin: '0 auto var(--s-4)', color: 'var(--accent-bright)' }} />
            <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--s-3)' }}>Connect to manage settings</h1>
            <ConnectButton />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + var(--s-10))' }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="stack-3" style={{ marginBottom: 'var(--s-8)' }}>
          <span className="eyebrow">Account</span>
          <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)' }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>{formatAddress(address)}</p>
        </div>

        {loading ? (
          <div className="card" style={{ padding: 'var(--s-10)', textAlign: 'center' }}>
            <Loader2 size={24} className="spin" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div className="stack-6">
            <div className="card stack-4" style={{ padding: 'var(--s-6)' }}>
              <h2 style={{ fontSize: 16 }}>Profile</h2>
              <div className="stack-2">
                <label className="label">Display name</label>
                <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="stack-2">
                <label className="label">Email (for notifications)</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>

            <div className="card stack-4" style={{ padding: 'var(--s-6)' }}>
              <div className="row gap-2">
                <Bell size={16} color="var(--accent-bright)" />
                <h2 style={{ fontSize: 16 }}>Notifications</h2>
              </div>
              <Toggle label="Order fills & limit matches" checked={notifyOrders} onChange={setNotifyOrders} />
              <Toggle label="Market resolutions" checked={notifyResolves} onChange={setNotifyResolves} />
              <Toggle label="New agent picks in Arena" checked={notifyAgents} onChange={setNotifyAgents} />
              <Toggle label="Deposits & claims" checked={notifyDeposits} onChange={setNotifyDeposits} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Push delivery ships with Notifier agent in Phase 2. Preferences are saved now.
              </p>
            </div>

            <div className="row gap-3">
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <Loader2 size={14} className="spin" /> : saved ? <Check size={14} /> : null}
                {saved ? 'Saved' : 'Save settings'}
              </button>
              <Link href="/profile" className="btn btn-ghost">View profile</Link>
            </div>
          </div>
        )}
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="row" style={{ justifyContent: 'space-between', cursor: 'pointer', padding: 'var(--s-2) 0' }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
