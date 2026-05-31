import { http } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';
import { xLayer, xLayerTestnet } from './chains';

/**
 * Wagmi config wired through Privy. `createConfig` comes from `@privy-io/wagmi`
 * (Privy's wrapper that injects its embedded wallet connector). `http` transports
 * come from wagmi core — Privy's package doesn't re-export them.
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
