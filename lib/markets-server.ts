import { createPublicClient, http } from 'viem';
import { xLayerTestnet } from '@/lib/chains';
import { FACTORY_ABI, PREDICTION_MARKET_ABI } from '@/lib/contracts';
import { getMarketMetaBatch } from '@/lib/db';

const publicClient = createPublicClient({
  chain: xLayerTestnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL ?? 'https://testrpc.xlayer.tech')
});

export type ServerMarket = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  closesAt: string;
  resolved: boolean;
  finalized: boolean;
  priceYes: number;
  agent: string;
  trending: boolean;
};

export async function listOnChainMarkets(): Promise<ServerMarket[]> {
  const factory = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}` | undefined;
  if (!factory) return [];

  const length = await publicClient.readContract({
    address: factory,
    abi: FACTORY_ABI,
    functionName: 'marketsLength'
  });

  const addresses: `0x${string}`[] = [];
  for (let i = 0; i < Number(length); i++) {
    const addr = await publicClient.readContract({
      address: factory,
      abi: FACTORY_ABI,
      functionName: 'markets',
      args: [BigInt(i)]
    });
    addresses.push(addr as `0x${string}`);
  }

  if (addresses.length === 0) return [];

  const meta = await getMarketMetaBatch(addresses);

  const markets = await Promise.all(
    addresses.map(async (address) => {
      const [question, closesAt, resolved, finalized, yesReserves, noReserves] =
        await Promise.all([
          publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'question' }),
          publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'closesAt' }),
          publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'resolved' }),
          publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'finalized' }),
          publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'yesReserves' }),
          publicClient.readContract({ address, abi: PREDICTION_MARKET_ABI, functionName: 'noReserves' })
        ]);

      const yes = Number(yesReserves);
      const no = Number(noReserves);
      const priceYes = yes + no > 0 ? no / (yes + no) : 0.5;
      const m = meta[address.toLowerCase()];

      return {
        id: address,
        category: m?.category ?? 'Football',
        title: question as string,
        subtitle: m?.subtitle ?? '',
        closesAt: new Date(Number(closesAt) * 1000).toISOString(),
        resolved: resolved as boolean,
        finalized: finalized as boolean,
        priceYes,
        agent: m?.agent_handle ?? '@curator.ai',
        trending: m?.trending ?? false
      } satisfies ServerMarket;
    })
  );

  return markets;
}
