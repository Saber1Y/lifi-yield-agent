import { getQuote, createConfig, executeRoute, convertQuoteToRoute } from '@lifi/sdk';
import { createWalletClient, http, parseEther } from 'viem';
import { arbitrum, base, optimism } from 'viem/chains';

export const CHAIN_IDS: { [key: number]: string } = {
  1: 'ethereum',
  10: 'optimism',
  42161: 'arbitrum',
  8453: 'base',
  137: 'polygon',
  56: ' BSC',
  43114: 'avalanche',
  1151111081099710: 'solana'
};

export const USDC_ADDRESSES: { [chainId: number]: string } = {
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  10: '0x0b2C639c533813f4Aa9D7837CAf62653d997Ff932',
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
};

const SUPPORTED_CHAINS = [42161, 8453, 10];

export async function getCrossChainQuote(params: {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
}) {
  createConfig({
    integrator: 'lifi-yield-agent',
  });

  const quote = await getQuote({
    fromChain: params.fromChain,
    toChain: params.toChain,
    fromToken: params.fromToken,
    toToken: params.toToken,
    fromAmount: params.fromAmount,
    fromAddress: params.fromAddress,
    slippage: 0.005,
  });

  return quote;
}

export async function getBridgeQuote(params: {
  fromChainId: number;
  toChainId: number;
  fromAmount: string;
  fromAddress: string;
}) {
  const fromToken = USDC_ADDRESSES[params.fromChainId];
  const toToken = USDC_ADDRESSES[params.toChainId];

  if (!fromToken || !toToken) {
    throw new Error('Unsupported chain pair');
  }

  createConfig({
    integrator: 'lifi-yield-agent',
  });

  const quote = await getQuote({
    fromChain: params.fromChainId,
    toChain: params.toChainId,
    fromToken,
    toToken,
    fromAmount: params.fromAmount,
    fromAddress: params.fromAddress,
    slippage: 0.01,
  });

  return quote;
}

export function getSupportedChains() {
  return SUPPORTED_CHAINS;
}

export function getChainName(chainId: number): string {
  return CHAIN_IDS[chainId] || `Chain ${chainId}`;
}
