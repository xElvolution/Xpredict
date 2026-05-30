'use client';

import { useEffect, useState } from 'react';
import { useAllMarketsState, useMarketAddresses, toUiMarket } from '../../lib/markets-onchain';
import type { Market } from '../../lib/data';
import { env } from './env';

type MetaMap = Record<string, { category?: string; subtitle?: string; agent_handle?: string; trending?: boolean }>;

/**
 * Mobile version of useMarkets — fetches offchain metadata from the web app's API.
 * The shared markets-onchain.ts works fine because it only depends on wagmi hooks.
 */
export function useMarkets() {
  const { addresses, isLoading: addrsLoading } = useMarketAddresses();
  const { states, isLoading: statesLoading, refetch } = useAllMarketsState(addresses);
  const [meta, setMeta] = useState<MetaMap>({});
  const [metaLoading, setMetaLoading] = useState(false);

  useEffect(() => {
    if (addresses.length === 0) {
      setMeta({});
      return;
    }
    setMetaLoading(true);
    fetch(`${env.API_BASE_URL}/api/markets-meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses })
    })
      .then((r) => r.json())
      .then((data) => setMeta(data.meta ?? {}))
      .catch(() => setMeta({}))
      .finally(() => setMetaLoading(false));
  }, [addresses.join(',')]);

  const markets: Market[] = states.map((s) => toUiMarket(s, meta[s.address.toLowerCase()]));

  return {
    markets,
    isLoading: addrsLoading || statesLoading || metaLoading,
    refetch
  };
}
