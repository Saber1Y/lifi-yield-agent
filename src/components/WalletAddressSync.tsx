'use client';

import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import type { Wallet } from '@dynamic-labs/wallet-connector-core';

interface WalletAddressSyncProps {
  onChange: (payload: { address?: string; wallet: Wallet | null }) => void;
}

export function WalletAddressSync({ onChange }: WalletAddressSyncProps) {
  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    onChange({
      address: primaryWallet?.address,
      wallet: primaryWallet,
    });
  }, [onChange, primaryWallet]);

  return null;
}
