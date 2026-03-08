'use client';

import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || '';

  if (!environmentId) {
    return <>{children}</>;
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [
          EthereumWalletConnectors,
          SolanaWalletConnectors,
        ],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
