import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { xLayer, xLayerTestnet } from './chains';

/**
 * Wagmi config. We use a single injected() connector and detect OKX vs MetaMask
 * at connect time via window.okxwallet / window.ethereum.isMetaMask.
 * This keeps the bundle slim and avoids hard-coding WalletConnect project IDs
 * for the hackathon demo.
 */
export const wagmiConfig = createConfig({
  chains: [xLayer, xLayerTestnet],
  connectors: [
    injected({ shimDisconnect: true })
  ],
  transports: {
    [xLayer.id]:        http('https://rpc.xlayer.tech'),
    [xLayerTestnet.id]: http('https://testrpc.xlayer.tech')
  },
  ssr: true
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
