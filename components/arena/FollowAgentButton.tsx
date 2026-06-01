'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

export function FollowAgentButton({ agent }: { agent: string }) {
  const { address } = useAccount();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Backend normalises everything with @ — ensure we compare apples to apples.
  const normalizedAgent = agent.startsWith('@') ? agent : `@${agent}`;

  useEffect(() => {
    if (!address) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    fetch(`/api/v1/follows?wallet=${address}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const agents: string[] = data?.data?.agents ?? data?.agents ?? [];
        setFollowing(agents.includes(normalizedAgent));
      })
      .catch((err) => {
        console.error('[follow] hydrate failed', err);
        if (!cancelled) setFollowing(false);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => { cancelled = true; };
  }, [address, normalizedAgent]);

  const toggle = async () => {
    if (!address || loading) return;
    setLoading(true);

    // Optimistic update
    const next = !following;
    setFollowing(next);

    try {
      if (next) {
        const res = await fetch('/api/v1/follows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: address, agent: normalizedAgent })
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`POST failed ${res.status}: ${txt}`);
        }
      } else {
        const res = await fetch(
          `/api/v1/follows?wallet=${address}&agent=${encodeURIComponent(normalizedAgent)}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`DELETE failed ${res.status}: ${txt}`);
        }
      }
    } catch (err) {
      console.error('[follow] toggle failed', err);
      // Rollback on error
      setFollowing(!next);
    } finally {
      setLoading(false);
    }
  };

  if (!address) return null;

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={toggle}
      disabled={loading || !hydrated}
      title={following ? 'Unfollow' : 'Follow'}
    >
      {loading || !hydrated
        ? <Loader2 size={12} className="spin" />
        : following ? <UserMinus size={12} /> : <UserPlus size={12} />}
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
