'use client';

import { useState, type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi';
import { SlipProvider } from '@/components/slip/SlipContext';
import { SlipDrawer, SlipFab } from '@/components/slip/SlipDrawer';

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
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SlipProvider>
          {children}
          <SlipFab />
          <SlipDrawer />
        </SlipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
