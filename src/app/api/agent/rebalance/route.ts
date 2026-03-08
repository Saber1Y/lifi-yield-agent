import { NextRequest, NextResponse } from "next/server";

import {
  getAgentApiSecret,
  isAuthorizedAgentRequest,
} from "@/lib/agentApiAuth";
import { runAutonomousRebalance } from "@/lib/automation";

export async function GET() {
  return NextResponse.json(
    {
      status: "error",
      message: "Use POST for manual rebalance runs.",
    },
    { status: 405 },
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json(
      {
        status: "error",
        message: getAgentApiSecret()
          ? "Unauthorized agent request."
          : "AGENT_API_SECRET or CRON_SECRET is not configured.",
      },
      {
        status: getAgentApiSecret() ? 401 : 503,
      },
    );
  }

  try {
    const result = await runAutonomousRebalance("manual");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        mode: "analysis",
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
