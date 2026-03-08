'use client';

import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import type { Wallet } from '@dynamic-labs/wallet-connector-core';

interface WalletAddressSyncProps {
  onChange: (payload: { address?: string; wallet: Wallet | null; chainId?: number }) => void;
}

export function WalletAddressSync({ onChange }: WalletAddressSyncProps) {
  const { primaryWallet, network } = useDynamicContext();

  useEffect(() => {
    let chainId: number | undefined;
    
    if (network) {
      chainId = typeof network === 'number' ? network : Number(network);
    }
    
    console.log('Dynamic network:', network);
    console.log('Primary wallet:', primaryWallet?.address);
    
    onChange({
      address: primaryWallet?.address,
      wallet: primaryWallet,
      chainId,
    });
  }, [onChange, primaryWallet, network]);

  return null;
}
