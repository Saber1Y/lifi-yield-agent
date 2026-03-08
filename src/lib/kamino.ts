import { SOLANA_CHAIN_ID } from "./lifi";

export interface SolanaYield {
  chainId: number;
  chainName: string;
  protocol: string;
  supplyApr: number;
  liquidity: number;
}

const KAMINO_MARKET = "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF";
const SOLANA_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function fetchSolanaYields(): Promise<SolanaYield[]> {
  try {
    const response = await fetch(
      `https://api.kamino.finance/kamino-market/${KAMINO_MARKET}/reserves/metrics`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error(`Kamino API error: ${response.status}`);
    }

    const data = await response.json();
    const usdcReserve = data.find(
      (r: { liquidityToken: string; liquidityTokenMint: string }) =>
        r.liquidityToken === "USDC" && r.liquidityTokenMint === SOLANA_USDC_MINT
    );

    if (!usdcReserve) {
      throw new Error("USDC reserve not found in Kamino response");
    }

    return [
      {
        chainId: SOLANA_CHAIN_ID,
        chainName: "Solana",
        protocol: "Kamino",
        supplyApr: Number(usdcReserve.supplyApy) * 100,
        liquidity: Number(usdcReserve.totalSupplyUsd),
      },
    ];
  } catch (error) {
    console.error("Error fetching Solana yields:", error);
    return [];
  }
}
