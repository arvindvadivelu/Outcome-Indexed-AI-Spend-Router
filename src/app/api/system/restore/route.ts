import { NextResponse } from "next/server";
import { restoreProductionSnapshot, listAvailableSnapshots } from "@/lib/backup-recovery-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { snapshotId } = body;

    if (!snapshotId) {
      const available = listAvailableSnapshots();
      return NextResponse.json(
        {
          success: false,
          error: "snapshotId is required for point-in-time recovery",
          availableSnapshots: available
        },
        { status: 400 }
      );
    }

    const result = restoreProductionSnapshot(snapshotId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Snapshot restoration failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Snapshot '${snapshotId}' successfully restored to live ledger`,
      restoredTables: result.restoredTables,
      restoredAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal snapshot restore error" },
      { status: 500 }
    );
  }
}
