'use client';

import { useEffect, useState } from 'react';
import { useWatchContractEvent, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { ADDRESSES, FACTORY_ABI, PREDICTION_MARKET_ABI, USDC_DECIMALS } from './contracts';
import { useMarketAddresses } from './markets-onchain';

export type LiveEvent = {
  id: string;
  kind: 'bet' | 'create' | 'resolve';
  at: string;
  who: string;
  text: string;
  amount?: number;
  marketAddress?: `0x${string}`;
  txHash?: `0x${string}`;
};

const MAX_EVENTS = 40;

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Watch onchain events across all markets and the factory in real time.
 */
export function useLiveEvents() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const { addresses } = useMarketAddresses();
  const client = usePublicClient();

  // Backfill: pull recent historical events on mount so the feed isn't empty
  useEffect(() => {
    if (!client || addresses.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const blockNumber = await client.getBlockNumber();
        const fromBlock = blockNumber > 5000n ? blockNumber - 5000n : 0n;

        const factoryLogs = await client.getLogs({
          address: ADDRESSES.FACTORY,
          event: FACTORY_ABI.find((e) => e.type === 'event' && e.name === 'MarketCreated') as any,
          fromBlock,
          toBlock: 'latest'
        });

        const created: LiveEvent[] = factoryLogs.slice(-10).map((log: any) => ({
          id: `${log.transactionHash}-${log.logIndex}`,
          kind: 'create',
          at: new Date().toISOString(),
          who: '@curator.ai',
          text: `New market: ${log.args?.question ?? 'unknown'}`,
          marketAddress: log.args?.market,
          txHash: log.transactionHash
        }));

        if (!cancelled && created.length > 0) {
          setEvents((prev) => [...created, ...prev].slice(0, MAX_EVENTS));
        }
      } catch (err) {
        console.warn('live feed backfill failed:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [client, addresses.join(',')]);

  // New market created
  useWatchContractEvent({
    address: ADDRESSES.FACTORY,
    abi: FACTORY_ABI,
    eventName: 'MarketCreated',
    onLogs(logs) {
      const newEvents: LiveEvent[] = logs.map((log: any) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        kind: 'create',
        at: new Date().toISOString(),
        who: '@curator.ai',
        text: `New market: ${log.args?.question ?? 'unknown'}`,
        marketAddress: log.args?.market,
        txHash: log.transactionHash
      }));
      setEvents((prev) => [...newEvents, ...prev].slice(0, MAX_EVENTS));
    }
  });

  // Watch all markets for Bought events. Note: useWatchContractEvent only takes one address,
  // so we set up one watcher per market via a custom effect.
  useEffect(() => {
    if (!client || addresses.length === 0) return;

    const unwatchers = addresses.map((addr) =>
      client.watchContractEvent({
        address: addr,
        abi: PREDICTION_MARKET_ABI,
        eventName: 'Bought',
        onLogs(logs) {
          const newEvents: LiveEvent[] = logs.map((log: any) => {
            const args = log.args as { buyer?: `0x${string}`; outcome?: number; collateralIn?: bigint };
            return {
              id: `${log.transactionHash}-${log.logIndex}`,
              kind: 'bet',
              at: new Date().toISOString(),
              who: args.buyer ? shortAddr(args.buyer) : 'unknown',
              text: `${args.outcome === 0 ? 'YES' : 'NO'} on market`,
              amount: args.collateralIn ? Number(formatUnits(args.collateralIn, USDC_DECIMALS)) : 0,
              marketAddress: addr,
              txHash: log.transactionHash
            };
          });
          setEvents((prev) => [...newEvents, ...prev].slice(0, MAX_EVENTS));
        }
      })
    );

    const resolverWatchers = addresses.map((addr) =>
      client.watchContractEvent({
        address: addr,
        abi: PREDICTION_MARKET_ABI,
        eventName: 'Resolved',
        onLogs(logs) {
          const newEvents: LiveEvent[] = logs.map((log: any) => {
            const args = log.args as { winningOutcome?: number };
            return {
              id: `${log.transactionHash}-${log.logIndex}`,
              kind: 'resolve',
              at: new Date().toISOString(),
              who: '@resolver.ai',
              text: `Settled: ${args.winningOutcome === 0 ? 'YES' : 'NO'} won`,
              marketAddress: addr,
              txHash: log.transactionHash
            };
          });
          setEvents((prev) => [...newEvents, ...prev].slice(0, MAX_EVENTS));
        }
      })
    );

    return () => {
      unwatchers.forEach((u) => u());
      resolverWatchers.forEach((u) => u());
    };
  }, [client, addresses.join(',')]);

  return events;
}
