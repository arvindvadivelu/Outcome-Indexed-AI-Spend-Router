import { NextResponse } from "next/server";
import { checkAndRelieveMemoryPressure, forcePurgeAllCachesAndQueues } from "@/lib/gc-pressure-guard";

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

export async function POST() {
  try {
    const purgeResult = forcePurgeAllCachesAndQueues();
    const freshStatus = checkAndRelieveMemoryPressure();
    return NextResponse.json({
      success: true,
      message: "Proactive memory purge and buffer flush completed successfully",
      purgeResult,
      freshStatus
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute proactive memory purge" },
      { status: 500 }
    );
  }
}

