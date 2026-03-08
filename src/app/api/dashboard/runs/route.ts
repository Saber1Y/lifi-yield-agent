import { NextResponse } from "next/server";

import { getRecentAutomationRuns } from "@/lib/persistence";

export async function GET() {
  const runs = await getRecentAutomationRuns(20);

  return NextResponse.json({
    status: "ok",
    runs,
  });
}
