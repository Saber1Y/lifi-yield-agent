'use client';

import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import type { Wallet } from '@dynamic-labs/wallet-connector-core';

interface WalletAddressSyncProps {
  onChange: (payload: { address?: string; wallet: Wallet | null; chainId?: number }) => void;
}

export function WalletAddressSync({ onChange }: WalletAddressSyncProps) {
  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    const chainId = primaryWallet?.chain
      ? typeof primaryWallet.chain === 'number'
        ? primaryWallet.chain
        : Number(primaryWallet.chain)
      : undefined;
    
    onChange({
      address: primaryWallet?.address,
      wallet: primaryWallet,
      chainId,
    });
  }, [onChange, primaryWallet]);

  return null;
}
