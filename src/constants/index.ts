export const COLORS = {
  lifi: {
    pink: '#F7C2FF',
    blue: '#5C67FF',
  },
  background: {
    primary: '#0A0A0F',
    secondary: '#12121A',
    card: '#1A1A24',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0B0',
    muted: '#606070',
  },
  border: {
    default: '#2A2A35',
    hover: '#3A3A48',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
  { id: 42161, name: 'Arbitrum', symbol: 'ARB', color: '#28A0F0' },
  { id: 8453, name: 'Base', symbol: 'BASE', color: '#0052FF' },
  { id: 10, name: 'Optimism', symbol: 'OP', color: '#FF0420' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', color: '#8247E5' },
  { id: 56, name: 'BNB Chain', symbol: 'BNB', color: '#F3BA2F' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', color: '#E84142' },
  { id: 1151111081099710, name: 'Solana', symbol: 'SOL', color: '#9945FF' },
];

export const FEATURES = [
  {
    icon: '💰',
    title: 'Yield Monitor',
    description: 'Real-time APY tracking across 8+ chains via AaveScan & Kamino',
  },
  {
    icon: '🌉',
    title: 'Cross-Chain Bridge',
    description: 'Seamless bridging powered by LI.FI SDK across 60+ chains',
  },
  {
    icon: '🤖',
    title: 'AI-Powered',
    description: 'Autonomous decision making to maximize your yields',
  },
  {
    icon: '⚡',
    title: 'Auto Rebalance',
    description: '24/7 automated portfolio rebalancing based on yield shifts',
  },
];

export const STEPS = [
  {
    number: '01',
    title: 'Connect Wallet',
    description: 'Link your wallet to let the agent manage your USDC positions',
  },
  {
    number: '02',
    title: 'AI Analysis',
    description: 'Agent fetches real-time yields from Aave & Kamino across all chains',
  },
  {
    number: '03',
    title: 'Bridge & Earn',
    description: 'Execute cross-chain transfers via LI.FI to highest yield destination',
  },
];
