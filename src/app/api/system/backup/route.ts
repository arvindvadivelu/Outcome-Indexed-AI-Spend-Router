import { NextResponse } from "next/server";
import { createProductionSnapshot, listAvailableSnapshots } from "@/lib/backup-recovery-engine";

export async function POST() {
  try {
    const snapshot = createProductionSnapshot();
    return NextResponse.json({
      success: true,
      message: "Database point-in-time snapshot created successfully",
      snapshot
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create backup snapshot" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const snapshots = listAvailableSnapshots();
    return NextResponse.json({
      success: true,
      count: snapshots.length,
      snapshots
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to list snapshots" },
      { status: 500 }
    );
  }
}
