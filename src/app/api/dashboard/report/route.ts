import { NextResponse } from "next/server";

import { getAutomationReport } from "@/lib/automation";

export async function GET() {
  const report = await getAutomationReport();

  return NextResponse.json({
    status: "ok",
    report,
  });
}
