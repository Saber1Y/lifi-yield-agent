import { NextRequest, NextResponse } from "next/server";

import { runAutonomousRebalance } from "@/lib/automation";

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        status: "error",
        message: process.env.CRON_SECRET
          ? "Unauthorized cron request."
          : "CRON_SECRET is not configured.",
      },
      { status: process.env.CRON_SECRET ? 401 : 503 },
    );
  }

  try {
    const result = await runAutonomousRebalance("cron");
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
