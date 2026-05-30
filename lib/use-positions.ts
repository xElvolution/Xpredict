'use client';

import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { PREDICTION_MARKET_ABI, USDC_DECIMALS } from './contracts';
import { useMarketAddresses, useAllMarketsState } from './markets-onchain';

export type OnchainPosition = {
  marketAddress: `0x${string}`;
  question: string;
  closesAt: bigint;
  resolved: boolean;
  winningOutcome: number;
  yesShares: number;
  noShares: number;
  yesProb: number;
  estimatedValue: number;
  claimable: boolean;
};

/**
 * Read the connected user's positions across all deployed markets.
 */
export function useUserPositions() {
  const { address } = useAccount();
  const { addresses } = useMarketAddresses();
  const { states } = useAllMarketsState(addresses);

  // For each market, fetch sharesOf(YES, user), sharesOf(NO, user), finalized, winningOutcome
  const contracts = addresses.flatMap((addr) => [
    { address: addr, abi: PREDICTION_MARKET_ABI, functionName: 'sharesOf', args: [0, address!] },
    { address: addr, abi: PREDICTION_MARKET_ABI, functionName: 'sharesOf', args: [1, address!] },
    { address: addr, abi: PREDICTION_MARKET_ABI, functionName: 'finalized' },
    { address: addr, abi: PREDICTION_MARKET_ABI, functionName: 'winningOutcome' }
  ] as const);

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: !!address && addresses.length > 0 }
  });

  const positions: OnchainPosition[] = useMemo(() => {
    if (!data || !address) return [];
    const out: OnchainPosition[] = [];
    for (let i = 0; i < addresses.length; i++) {
      const base = i * 4;
      const yesShares = (data[base]?.result as bigint) ?? 0n;
      const noShares  = (data[base + 1]?.result as bigint) ?? 0n;
      const finalized = (data[base + 2]?.result as boolean) ?? false;
      const winningOutcome = Number((data[base + 3]?.result as bigint) ?? 0n);

      if (yesShares === 0n && noShares === 0n) continue;

      const state = states[i];
      if (!state) continue;

      const yesProb = Number(formatUnits(state.priceYes, 18));
      const yesNum = Number(formatUnits(yesShares, USDC_DECIMALS));
      const noNum  = Number(formatUnits(noShares, USDC_DECIMALS));

      const estimatedValue = state.resolved && finalized
        ? (winningOutcome === 0 ? yesNum : noNum)
        : yesNum * yesProb + noNum * (1 - yesProb);

      const claimable = finalized && (winningOutcome === 0 ? yesShares > 0n : noShares > 0n);

      out.push({
        marketAddress: addresses[i],
        question: state.question,
        closesAt: state.closesAt,
        resolved: state.resolved,
        winningOutcome,
        yesShares: yesNum,
        noShares:  noNum,
        yesProb,
        estimatedValue,
        claimable
      });
    }
    return out;
  }, [data, address, addresses, states]);

  return { positions, isLoading, refetch };
}
