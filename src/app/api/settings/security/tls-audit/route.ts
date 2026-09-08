import { NextResponse } from "next/server";
import { performTlsSecurityAudit } from "@/lib/tls-transport-auditor";

export async function GET() {
  try {
    const report = performTlsSecurityAudit();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      report
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to perform TLS audit" },
      { status: 500 }
    );
  }
}
