import { http, createConfig } from 'wagmi';
import { xLayerTestnet, xLayer } from '../../lib/chains';

/**
 * Wagmi config for the mobile app. Privy handles wallet connection;
 * wagmi handles chain reads/writes.
 */
export const wagmiConfig = createConfig({
  chains: [xLayerTestnet, xLayer],
  transports: {
    [xLayer.id]:        http('https://rpc.xlayer.tech'),
    [xLayerTestnet.id]: http('https://testrpc.xlayer.tech')
  }
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
