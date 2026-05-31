'use client';

import { useEffect, useState } from 'react';
import type { AgentPersona, AgentPick, AgentRecentResult } from '@/lib/arena';

function unwrap<T>(json: Record<string, unknown>, key: string): T[] {
  if (json.ok === true && json.data && typeof json.data === 'object') {
    const data = json.data as Record<string, unknown>;
    if (Array.isArray(data[key])) return data[key] as T[];
  }
  if (Array.isArray(json[key])) return json[key] as T[];
  return [];
}

function pickToResult(p: AgentPick): AgentRecentResult {
  return {
    id: p.id,
    agent: p.agent,
    title: p.title,
    outcome: p.status === 'won' ? 'win' : 'loss',
    pnl: p.stake * (p.status === 'won' ? 0.15 : -1),
    at: p.postedAt
  };
}

export function useArenaData() {
  const [agents, setAgents] = useState<AgentPersona[]>([]);
  const [picks, setPicks] = useState<AgentPick[]>([]);
  const [results, setResults] = useState<AgentRecentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [agentsRes, picksRes, wonRes, lostRes] = await Promise.all([
          fetch('/api/v1/agents?format=arena'),
          fetch('/api/v1/picks?format=arena&status=open'),
          fetch('/api/v1/picks?format=arena&status=won&limit=20'),
          fetch('/api/v1/picks?format=arena&status=lost&limit=20')
        ]);

        if (!agentsRes.ok) throw new Error('agents unavailable');

        const agentsJson = await agentsRes.json();
        const picksJson = picksRes.ok ? await picksRes.json() : { ok: true, data: { picks: [] } };
        const wonJson = wonRes.ok ? await wonRes.json() : { ok: true, data: { picks: [] } };
        const lostJson = lostRes.ok ? await lostRes.json() : { ok: true, data: { picks: [] } };

        if (cancelled) return;

        setAgents(unwrap<AgentPersona>(agentsJson, 'agents'));
        setPicks(unwrap<AgentPick>(picksJson, 'picks'));
        const settled = [
          ...unwrap<AgentPick>(wonJson, 'picks'),
          ...unwrap<AgentPick>(lostJson, 'picks')
        ].map(pickToResult);
        settled.sort((a, b) => +new Date(b.at) - +new Date(a.at));
        setResults(settled.slice(0, 12));
      } catch {
        if (!cancelled) {
          setAgents([]);
          setPicks([]);
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { agents, picks, results, loading, source: agents.length > 0 || picks.length > 0 ? 'live' as const : 'empty' as const };
}
