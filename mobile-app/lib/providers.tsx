import { type ReactNode } from 'react';
import { PrivyProvider, PrivyElements } from '@privy-io/expo';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './wagmi';
import { env } from './env';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1
    }
  }
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider appId={env.PRIVY_APP_ID} clientId={env.PRIVY_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
          <PrivyElements />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
