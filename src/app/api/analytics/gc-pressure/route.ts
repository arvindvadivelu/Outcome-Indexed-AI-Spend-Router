import { NextResponse } from "next/server";
import { checkAndRelieveMemoryPressure } from "@/lib/gc-pressure-guard";

export async function GET() {
  try {
    const memoryStatus = checkAndRelieveMemoryPressure();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      memoryStatus
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "GC pressure check failed" },
      { status: 500 }
    );
  }
}
