import { NextRequest, NextResponse } from "next/server";

import {
  getAgentApiSecret,
  isAuthorizedAgentRequest,
} from "@/lib/agentApiAuth";
import { fetchYields } from "@/lib/yields";

export async function GET(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json(
      {
        status: "error",
        message: getAgentApiSecret()
          ? "Unauthorized agent request."
          : "AGENT_API_SECRET or CRON_SECRET is not configured.",
      },
      { status: getAgentApiSecret() ? 401 : 503 },
    );
  }

  const yields = await fetchYields();
  return NextResponse.json({
    status: "ok",
    yields,
  });
}

