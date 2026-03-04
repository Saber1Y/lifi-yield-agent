#!/bin/bash

echo "=========================================="
echo "LI.FI Yield Agent - Setup Script"
echo "=========================================="

echo ""
echo "1. Installing dependencies..."
bun install

echo ""
echo "2. Installing LI.FI Agent Skills..."
echo "   This adds LI.FI knowledge to your AI assistant"
echo ""
echo "   Run this command to add LI.FI skills:"
echo "   npx skills add https://github.com/lifinance/lifi-agent-skills --skill li-fi-sdk"
echo ""

echo "3. MCP Server is already configured in mcp.json"
echo "   Add to your AI assistant (Claude/Cursor/Windsurf) MCP settings"
echo ""

echo "=========================================="
echo "Setup complete! Run: bun run dev"
echo "=========================================="
