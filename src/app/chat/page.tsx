"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { COLORS, CHAINS } from '@/constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0fAb1";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your Yield Rebalancing Agent powered by LI.FI.

I can help you:
• Check yields across 8+ chains
• Compare APY rates from Aave & Kamino
• Get bridge quotes via LI.FI
• Recommend rebalancing opportunities

What would you like to do?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in real app, this would call your agent)
    setTimeout(() => {
      const responses: { [key: string]: string } = {
        yields: `📊 Current USDC Yields:

• Solana (Kamino): 8.2% APY 🟢 Highest
• Base (Aave): 4.5% APY
• Arbitrum (Aave): 4.1% APY
• Optimism (Aave): 4.0% APY
• Polygon (Aave): 3.8% APY
• Avalanche (Aave): 3.6% APY
• Ethereum (Aave): 3.5% APY
• BNB Chain (Aave): 3.2% APY

Would you like me to check if rebalancing makes sense?`,
        rebalance: `🔄 Rebalance Analysis:

Current: Arbitrum (4.1% APY)
Best: Solana (8.2% APY)
Difference: +4.1% APY

LI.FI Bridge Quote (1000 USDC):
• Estimated time: ~3 minutes
• Fee: ~$2.50
• Route: Stargate

Shall I proceed with the bridge?`,
        bridge: `🌉 LI.FI Bridge Quote:

From: Arbitrum (42161)
To: Solana (1151111081099710)
Amount: 1000 USDC

Options:
1. Stargate - ~3 min - $2.50 fee
2. Across - ~7 min - $1.80 fee
3. Hop - ~5 min - $2.20 fee

Which route would you prefer?`,
        default: `I can help you with:

• "check yields" - View current APY across all chains
• "rebalance" - Analyze if moving funds makes sense
• "bridge [amount] to [chain]" - Get a bridge quote
• "help" - Show all commands

What would you like to do?`,
      };

      const lowerInput = input.toLowerCase();
      let response = responses.default;
      
      if (lowerInput.includes('yield') || lowerInput.includes('apy')) {
        response = responses.yields;
      } else if (lowerInput.includes('rebalance')) {
        response = responses.rebalance;
      } else if (lowerInput.includes('bridge') || lowerInput.includes('swap')) {
        response = responses.bridge;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      {/* Header */}
      <header className="bg-[#12121A] border-b border-[#2A2A35] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                <span className="text-black font-bold text-sm">LF</span>
              </div>
            </Link>
            <div>
              <h1 className="text-white font-semibold">Yield Agent</h1>
              <p className="text-xs text-[#22C55E]">Online • LI.FI Powered</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-[#606070] font-mono hidden sm:block">
              {WALLET_ADDRESS.slice(0, 6)}...{WALLET_ADDRESS.slice(-4)}
            </div>
            <Link 
              href="/" 
              className="text-sm text-[#A0A0B0] hover:text-white transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                    message.role === 'user'
                      ? 'bg-[#5C67FF] text-white'
                      : 'bg-[#1A1A24] text-[#E0E0E0] border border-[#2A2A35]'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
                        <span className="text-black text-xs font-bold">LF</span>
                      </div>
                      <span className="text-xs font-medium text-[#A0A0B0]">Yield Agent</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1A1A24] rounded-2xl px-5 py-4 border border-[#2A2A35]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
                      <span className="text-black text-xs font-bold">LF</span>
                    </div>
                    <span className="text-xs text-[#A0A0B0]">Thinking...</span>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#5C67FF] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-[#5C67FF] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-[#5C67FF] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-[#12121A] border-t border-[#2A2A35] px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-[#1A1A24] rounded-2xl border border-[#2A2A35] px-4 py-3 focus-within:border-[#5C67FF] transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask the agent... (e.g., 'check yields', 'rebalance')"
              className="flex-1 bg-transparent text-white placeholder-[#606070] outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 rounded-xl gradient-bg text-black font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-[#606070] mt-2 text-center">
            Powered by LI.FI SDK • Yields from AaveScan & Kamino
          </p>
        </div>
      </footer>
    </div>
  );
}
