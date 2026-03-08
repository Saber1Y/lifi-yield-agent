import { createPublicClient, http, type Address } from "viem";

const AAVE_MARKETS = [
  {
    chainId: 1,
    chainName: "Ethereum",
    poolAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" as Address,
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
    rpcs: [
      "https://eth.drpc.org",
      "https://ethereum-rpc.publicnode.com",
      "https://eth.llamarpc.com",
    ],
  },
  {
    chainId: 42161,
    chainName: "Arbitrum",
    poolAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD" as Address,
    usdcAddress: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8" as Address,
    rpcs: [
      "https://arbitrum-one-rpc.publicnode.com",
      "https://arb1.arbitrum.io/rpc",
      "https://arbitrum.drpc.org",
    ],
  },
  {
    chainId: 10,
    chainName: "Optimism",
    poolAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD" as Address,
    usdcAddress: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607" as Address,
    rpcs: [
      "https://optimism.drpc.org",
      "https://mainnet.optimism.io",
      "https://optimism-rpc.publicnode.com",
    ],
  },
  {
    chainId: 137,
    chainName: "Polygon",
    poolAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD" as Address,
    usdcAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as Address,
    rpcs: [
      "https://polygon.drpc.org",
      "https://polygon-rpc.publicnode.com",
      "https://polygon-bor-rpc.publicnode.com",
    ],
  },
  {
    chainId: 8453,
    chainName: "Base",
    poolAddress: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5" as Address,
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
    rpcs: [
      "https://base.drpc.org",
      "https://base-rpc.publicnode.com",
      "https://mainnet.base.org",
    ],
  },
  {
    chainId: 43114,
    chainName: "Avalanche",
    poolAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD" as Address,
    usdcAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" as Address,
    rpcs: [
      "https://avax.drpc.org",
      "https://api.avax.network/ext/bc/C/rpc",
      "https://avalanche-c-chain-rpc.publicnode.com",
    ],
  },
] as const;

const RESERVE_DATA_ABI = [
  {
    name: "getReserveData",
    type: "function",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      { name: "configuration", type: "uint256" },
      { name: "liquidityIndex", type: "uint128" },
      { name: "currentLiquidityRate", type: "uint128" },
      { name: "variableBorrowIndex", type: "uint128" },
      { name: "currentVariableBorrowRate", type: "uint128" },
      { name: "currentStableBorrowRate", type: "uint128" },
      { name: "lastUpdateTimestamp", type: "uint40" },
      { name: "id", type: "uint16" },
      { name: "aTokenAddress", type: "address" },
      { name: "stableDebtTokenAddress", type: "address" },
      { name: "variableDebtTokenAddress", type: "address" },
      { name: "interestRateStrategyAddress", type: "address" },
      { name: "accruedToTreasury", type: "uint128" },
      { name: "unbacked", type: "uint128" },
      { name: "isolationModeTotalDebt", type: "uint128" },
    ],
    stateMutability: "view",
  },
] as const;

const ERC20_TOTAL_SUPPLY_ABI = [
  {
    name: "totalSupply",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

type ReserveDataResult = readonly [
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  number,
  number,
  Address,
  Address,
  Address,
  Address,
  bigint,
  bigint,
  bigint,
];

export interface YieldResult {
  chainId: number;
  chainName: string;
  supplyRate: number;
  liquidity: number;
}

function rayToAprPercent(rayValue: bigint): number {
  return Number(rayValue) / 1e25;
}

async function fetchWithFallback(rpcs: readonly string[]): Promise<string> {
  let lastError: Error | null = null;
  for (const rpc of rpcs) {
    try {
      const response = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) return rpc;
    } catch (error) {
      lastError = error as Error;
    }
  }
  throw lastError || new Error("All RPCs failed");
}

export async function fetchAaveYields(): Promise<YieldResult[]> {
  const results = await Promise.all(
    AAVE_MARKETS.map(async (market): Promise<YieldResult | null> => {
      try {
        const workingRpc = await fetchWithFallback(market.rpcs);
        const client = createPublicClient({
          chain: {
            id: market.chainId,
            name: market.chainName,
            nativeCurrency: { name: "Native", symbol: "NATIVE", decimals: 18 },
            rpcUrls: { default: { http: [workingRpc] } },
          },
          transport: http(workingRpc, { timeout: 15000 }),
        });

        const data = (await client.readContract({
          address: market.poolAddress,
          abi: RESERVE_DATA_ABI,
          functionName: "getReserveData",
          args: [market.usdcAddress],
        })) as ReserveDataResult;
        const totalSupply = await client.readContract({
          address: data[8],
          abi: ERC20_TOTAL_SUPPLY_ABI,
          functionName: "totalSupply",
        });

        return {
          chainId: market.chainId,
          chainName: market.chainName,
          supplyRate: rayToAprPercent(data[2]),
          liquidity: Number(totalSupply) / 1e6,
        };
      } catch (error) {
        console.error(`Error fetching ${market.chainName} yield`, error);
        return null;
      }
    }),
  );

  return results
    .filter((result): result is YieldResult => result !== null)
    .sort((a, b) => b.supplyRate - a.supplyRate);
}
