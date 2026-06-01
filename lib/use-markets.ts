'use client';

import { useEffect, useState } from 'react';
import { useAllMarketsState, useMarketAddresses, toUiMarket } from './markets-onchain';
import type { Market } from './data';

type MetaMap = Record<string, {
  category?: string;
  subtitle?: string;
  agent_handle?: string;
  trending?: boolean;
  hidden?: boolean;
}>;

/**
 * Returns the full set of UI-ready Market objects merged from onchain state
 * and offchain metadata. This is the hook the markets browser, featured
 * markets section, and market detail page should use.
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
    fetch('/api/markets-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses })
    })
      .then((r) => r.json())
      .then((data) => setMeta(data.meta ?? {}))
      .catch(() => setMeta({}))
      .finally(() => setMetaLoading(false));
  }, [addresses.join(',')]);

  const markets: Market[] = states
    .map((s) => ({ s, m: meta[s.address.toLowerCase()] }))
    .filter(({ m }) => !m?.hidden)
    .map(({ s, m }) => toUiMarket(s, m));

  return {
    markets,
    isLoading: addrsLoading || statesLoading || metaLoading,
    refetch
  };
}
