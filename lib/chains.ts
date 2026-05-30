import { defineChain } from 'viem';

/**
 * X Layer mainnet — OKX zkEVM L2 built on Polygon CDK.
 * Chain ID: 196
 * Native gas token: OKB
 * Explorer: https://www.oklink.com/xlayer
 */
export const xLayer = defineChain({
  id: 196,
  name: 'X Layer',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.xlayer.tech'] },
    public:  { http: ['https://rpc.xlayer.tech'] }
  },
  blockExplorers: {
    default: { name: 'OKLink', url: 'https://www.oklink.com/xlayer' }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 47416
    }
  }
});

export const xLayerTestnet = defineChain({
  id: 1952,
  name: 'X Layer Testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testrpc.xlayer.tech'] },
    public:  { http: ['https://testrpc.xlayer.tech'] }
  },
  blockExplorers: {
    default: { name: 'OKLink', url: 'https://www.oklink.com/xlayer-test' }
  },
  testnet: true
});
