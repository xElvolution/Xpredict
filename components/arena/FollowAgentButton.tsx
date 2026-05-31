'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { followAgentApi, fetchFollows } from '@/lib/platform/client';

export function FollowAgentButton({ agent }: { agent: string }) {
  const { address } = useAccount();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetchFollows(address)
      .then((d) => setFollowing(d.agents.includes(agent)))
      .catch(() => setFollowing(false));
  }, [address, agent]);

  const toggle = async () => {
    if (!address) return;
    setLoading(true);
    try {
      if (following) {
        await fetch(`/api/v1/follows?wallet=${address}&agent=${encodeURIComponent(agent)}`, { method: 'DELETE' });
        setFollowing(false);
      } else {
        await followAgentApi(address, agent);
        setFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!address) return null;

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={toggle} disabled={loading}>
      {loading ? <Loader2 size={12} className="spin" /> : following ? <UserMinus size={12} /> : <UserPlus size={12} />}
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
