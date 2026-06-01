'use client';

import { useState, type ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi';
import { xLayer, xLayerTestnet } from '@/lib/chains';
import { SlipProvider } from '@/components/slip/SlipContext';
import { SlipDrawer, SlipFab } from '@/components/slip/SlipDrawer';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })
  );

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#7C3AED',
          logo: '/logo.png',
          showWalletLoginFirst: false
        },
        loginMethods: ['email', 'wallet', 'google', 'twitter'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false
        },
        defaultChain: xLayerTestnet,
        supportedChains: [xLayer, xLayerTestnet]
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <SlipProvider>
            {children}
            <SlipFab />
            <SlipDrawer />
          </SlipProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
