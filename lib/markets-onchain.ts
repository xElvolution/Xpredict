'use client';

import { useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { ADDRESSES, FACTORY_ABI, PREDICTION_MARKET_ABI, USDC_DECIMALS } from './contracts';
import type { Category, Market } from './data';

/**
 * Read the list of all market addresses from the factory.
 */
export function useMarketAddresses() {
  const { data: marketsLength } = useReadContract({
    address: ADDRESSES.FACTORY,
    abi: FACTORY_ABI,
    functionName: 'marketsLength'
  });

  const length = marketsLength ? Number(marketsLength) : 0;

  const { data: addresses, isLoading } = useReadContracts({
    contracts: Array.from({ length }).map((_, i) => ({
      address: ADDRESSES.FACTORY,
      abi: FACTORY_ABI,
      functionName: 'markets',
      args: [BigInt(i)]
    })),
    query: { enabled: length > 0 }
  });

  const list = (addresses ?? [])
    .map((r) => r.result as `0x${string}` | undefined)
    .filter((a): a is `0x${string}` => !!a && a !== '0x0000000000000000000000000000000000000000');

  return { addresses: list, isLoading };
}

type OnchainMarketState = {
  address: `0x${string}`;
  question: string;
  closesAt: bigint;
  priceYes: bigint;
  priceNo: bigint;
  yesReserves: bigint;
  noReserves: bigint;
  resolved: boolean;
  finalized: boolean;
  winningOutcome: number;
};

/**
 * Read the state of a single market.
 */
export function useMarketState(address?: `0x${string}`) {
  const enabled = !!address;
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address, abi: PREDICTION_MARKET_ABI, functionName: 'question' },
      { address, abi: PREDICTION_MARKET_ABI, functionName: 'closesAt' },
      { address, abi: PREDICTION_MARKET_ABI, functionName: 'priceYes' },
      { address, abi: PREDICTION_MARKET_ABI, functionName: 'priceNo' },
      { address, abi: PREDICTION_MARKET_ABI, functionName: 'yesReserves' },
      { address, abi: PREDICTION_MARKET_ABI, functionName: 'noReserves' },
      { address, abi: PREDICTION_MARKET_ABI, functionName: 'resolved' },
      { address, abi: PREDICTION_MARKET_ABI, functionName: 'finalized' },
      { address, abi: PREDICTION_MARKET_ABI, functionName: 'winningOutcome' }
    ],
    query: { enabled }
  });

  const state: OnchainMarketState | null = useMemo(() => {
    if (!address || !data) return null;
    const [question, closesAt, priceYes, priceNo, yesReserves, noReserves, resolved, finalized, winningOutcome] = data;
    if (!question.result || closesAt.result == null) return null;
    return {
      address,
      question:       question.result as string,
      closesAt:       closesAt.result as bigint,
      priceYes:       (priceYes.result as bigint) ?? 0n,
      priceNo:        (priceNo.result as bigint) ?? 0n,
      yesReserves:    (yesReserves.result as bigint) ?? 0n,
      noReserves:     (noReserves.result as bigint) ?? 0n,
      resolved:       (resolved.result as boolean) ?? false,
      finalized:      (finalized.result as boolean) ?? false,
      winningOutcome: Number((winningOutcome.result as bigint) ?? 0n)
    };
  }, [address, data]);

  return { state, isLoading, refetch };
}

/**
 * Read state for many markets in one batched multicall.
 */
export function useAllMarketsState(addresses: `0x${string}`[]) {
  const contracts = addresses.flatMap((addr) => [
    { address: addr, abi: PREDICTION_MARKET_ABI, functionName: 'question' },
    { address: addr, abi: PREDICTION_MARKET_ABI, functionName: 'closesAt' },
    { address: addr, abi: PREDICTION_MARKET_ABI, functionName: 'priceYes' },
    { address: addr, abi: PREDICTION_MARKET_ABI, functionName: 'yesReserves' },
    { address: addr, abi: PREDICTION_MARKET_ABI, functionName: 'noReserves' },
    { address: addr, abi: PREDICTION_MARKET_ABI, functionName: 'resolved' }
  ] as const);

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: addresses.length > 0 }
  });

  const states: OnchainMarketState[] = useMemo(() => {
    if (!data) return [];
    const out: OnchainMarketState[] = [];
    for (let i = 0; i < addresses.length; i++) {
      const base = i * 6;
      const question = data[base]?.result as string | undefined;
      const closesAt = data[base + 1]?.result as bigint | undefined;
      if (!question || closesAt == null) continue;
      out.push({
        address: addresses[i],
        question,
        closesAt,
        priceYes:       (data[base + 2]?.result as bigint) ?? 0n,
        priceNo:        0n,
        yesReserves:    (data[base + 3]?.result as bigint) ?? 0n,
        noReserves:     (data[base + 4]?.result as bigint) ?? 0n,
        resolved:       (data[base + 5]?.result as boolean) ?? false,
        finalized:      false,
        winningOutcome: 0
      });
    }
    return out;
  }, [addresses, data]);

  return { states, isLoading, refetch };
}

/**
 * Convert onchain state + offchain metadata into the `Market` shape the UI expects.
 */
export function toUiMarket(
  state: OnchainMarketState,
  meta?: { category?: string; subtitle?: string; agent_handle?: string; trending?: boolean }
): Market {
  const yesProb = Number(formatUnits(state.priceYes, 18));
  const noProb  = 1 - yesProb;
  const reserves = Number(formatUnits(state.yesReserves + state.noReserves, USDC_DECIMALS));

  return {
    id:        state.address,
    category:  (meta?.category as Category) ?? 'Football',
    title:     state.question,
    subtitle:  meta?.subtitle ?? '',
    closesAt:  new Date(Number(state.closesAt) * 1000).toISOString(),
    volume:    reserves, // approximate: AMM TVL as proxy for activity
    liquidity: reserves,
    traders:   0, // would need indexer for unique trader count
    agent:     meta?.agent_handle ?? '@curator',
    trending:  meta?.trending ?? false,
    resolved:  state.resolved,
    outcomes: [
      { label: 'Yes', probability: yesProb, volume: Number(formatUnits(state.yesReserves, USDC_DECIMALS)) },
      { label: 'No',  probability: noProb,  volume: Number(formatUnits(state.noReserves, USDC_DECIMALS)) }
    ]
  };
}
