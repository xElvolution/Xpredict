import { createPublicClient, http, encodeFunctionData } from 'viem';
import { xLayerTestnet } from '../../lib/chains';
import { FACTORY_ABI, PREDICTION_MARKET_ABI, ERC20_ABI, USDC_DECIMALS } from '../../lib/contracts';

export const publicClient = createPublicClient({
  chain: xLayerTestnet,
  transport: http('https://testrpc.xlayer.tech')
});

export async function getFactoryMarkets(): Promise<`0x${string}`[]> {
  const length = await publicClient.readContract({
    address: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'marketsLength'
  });
  const addresses: `0x${string}`[] = [];
  for (let i = 0; i < Number(length); i++) {
    const addr = await publicClient.readContract({
      address: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'markets',
      args: [BigInt(i)]
    });
    addresses.push(addr as `0x${string}`);
  }
  return addresses;
}

export async function getMarketState(address: `0x${string}`) {
  const [question, closesAt, resolved, finalized, yesReserves, noReserves] = await Promise.all([
    publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'question' }),
    publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'closesAt' }),
    publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'resolved' }),
    publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'finalized' }),
    publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'yesReserves' }),
    publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'noReserves' })
  ]);
  return { question, closesAt, resolved, finalized, yesReserves, noReserves };
}

export function encodeCreateMarket(question: string, closesAt: bigint, resolver: `0x${string}`) {
  return encodeFunctionData({ abi: FACTORY_ABI, functionName: 'createMarket', args: [question, closesAt, resolver] });
}

export function encodeApprove(spender: `0x${string}`, amount: bigint) {
  return encodeFunctionData({ abi: ERC20_ABI, functionName: 'approve', args: [spender, amount] });
}

export function encodeSeedLiquidity(amount: bigint) {
  return encodeFunctionData({ abi: PREDICTION_MARKET_ABI, functionName: 'seedLiquidity', args: [amount] });
}

export function encodeResolve(outcome: 0 | 1) {
  return encodeFunctionData({ abi: PREDICTION_MARKET_ABI, functionName: 'resolve', args: [outcome] });
}
