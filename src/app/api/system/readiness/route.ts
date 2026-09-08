import { NextResponse } from "next/server";
import { validateProductionEnvironment } from "@/lib/env-validator";

export async function GET() {
  try {
    const report = validateProductionEnvironment();
    return NextResponse.json({
      success: report.isValid,
      checkedAt: new Date().toISOString(),
      report
    }, {
      status: report.isValid ? 200 : 503
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Readiness probe failed" },
      { status: 500 }
    );
  }
}
