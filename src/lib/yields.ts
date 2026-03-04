export interface YieldData {
  chainId: number;
  chainName: string;
  symbol: string;
  supplyApr: number;
  liquidity: number;
}

export interface ChainYieldMap {
  [chainId: number]: YieldData;
}

const AAVE_CHAIN_IDS: { [key: string]: number } = {
  ethereum: 1,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
  avalanche: 43114,
  base: 8453,
  BSC: 56,
  Solana: 1151111081099710,
};

export async function fetchYields(): Promise<ChainYieldMap> {
  try {
    const response = await fetch('https://api.aavescan.com/v2/latest');
    const data = await response.json();
    
    const yields: ChainYieldMap = {};
    
    for (const [chainKey, chainId] of Object.entries(AAVE_CHAIN_IDS)) {
      const marketData = data[chainKey];
      if (marketData?.reserves?.USDC) {
        const usdcData = marketData.reserves.USDC;
        yields[chainId] = {
          chainId,
          chainName: chainKey.charAt(0).toUpperCase() + chainKey.slice(1),
          symbol: 'USDC',
          supplyApr: parseFloat(usdcData.supplyApr || '0') * 100,
          liquidity: parseFloat(usdcData.totalLiquidityUSD || '0'),
        };
      }
    }
    
    return yields;
  } catch (error) {
    console.error('Error fetching yields:', error);
    return {};
  }
}

export function findBestYield(yields: ChainYieldMap, currentChainId: number): {
  shouldRebalance: boolean;
  fromChain: number;
  toChain: number;
  fromYield: number;
  toYield: number;
  difference: number;
} | null {
  const currentYield = yields[currentChainId];
  if (!currentYield) return null;
  
  let bestChain: YieldData | null = null;
  
  for (const [chainId, yieldData] of Object.entries(yields)) {
    const id = parseInt(chainId);
    if (id !== currentChainId && yieldData.liquidity > 1000000) {
      if (!bestChain || yieldData.supplyApr > bestChain.supplyApr) {
        bestChain = yieldData;
      }
    }
  }
  
  if (!bestChain || bestChain.supplyApr <= currentYield.supplyApr) {
    return null;
  }
  
  return {
    shouldRebalance: true,
    fromChain: currentChainId,
    toChain: bestChain.chainId,
    fromYield: currentYield.supplyApr,
    toYield: bestChain.supplyApr,
    difference: bestChain.supplyApr - currentYield.supplyApr,
  };
}
