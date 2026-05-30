'use client';

import { useEffect, useState } from 'react';
import {
  ARENA_AGENTS,
  ARENA_PICKS,
  ARENA_RESULTS,
  type AgentPersona,
  type AgentPick
} from '@/lib/arena';

type ArenaPick = AgentPick;
type ArenaAgent = AgentPersona;

/** Unwrap v1 API envelope or legacy flat response. */
function unwrap<T>(json: Record<string, unknown>, key: string): T[] {
  if (json.ok === true && json.data && typeof json.data === 'object') {
    const data = json.data as Record<string, unknown>;
    if (Array.isArray(data[key])) return data[key] as T[];
  }
  if (Array.isArray(json[key])) return json[key] as T[];
  return [];
}

export function useArenaData() {
  const [agents, setAgents] = useState<ArenaAgent[]>(ARENA_AGENTS);
  const [picks, setPicks] = useState<ArenaPick[]>(ARENA_PICKS);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [agentsRes, picksRes] = await Promise.all([
          fetch('/api/v1/agents?format=arena'),
          fetch('/api/v1/picks?format=arena&status=open')
        ]);

        if (!agentsRes.ok || !picksRes.ok) throw new Error('API unavailable');

        const agentsJson = await agentsRes.json();
        const picksJson = await picksRes.json();
        const liveAgents = unwrap<ArenaAgent>(agentsJson, 'agents');
        const livePicks = unwrap<ArenaPick>(picksJson, 'picks');

        if (cancelled) return;

        if (liveAgents.length > 0 || livePicks.length > 0) {
          setAgents(liveAgents.length > 0 ? liveAgents : ARENA_AGENTS);
          setPicks(livePicks.length > 0 ? livePicks : ARENA_PICKS);
          setSource('live');
        }
      } catch {
        // Keep demo data when DB/API not configured
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    agents,
    picks,
    results: ARENA_RESULTS,
    loading,
    source
  };
}
