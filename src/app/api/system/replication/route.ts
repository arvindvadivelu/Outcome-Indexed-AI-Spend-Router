import { NextResponse } from "next/server";
import { globalCrdtEngine, CrdtRecord } from "@/lib/crdt-replication";

export async function GET() {
  try {
    const snapshot = globalCrdtEngine.getFullSnapshot();
    const records = globalCrdtEngine.getAllRecords();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      nodeId: snapshot.nodeId,
      lamportClock: snapshot.lamportClock,
      vectorClock: snapshot.vectorClock,
      recordCount: Object.keys(records).length,
      activeRecords: records,
      tombstoneCount: snapshot.tombstones.length
    }, {
      headers: {
        "X-Replication-Node": snapshot.nodeId,
        "X-Lamport-Clock": snapshot.lamportClock.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve replication state" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, key, value, remoteRecord, remoteRecords } = body;

    if (action === "SET") {
      if (!key) {
        return NextResponse.json({ success: false, error: "Missing key for SET operation" }, { status: 400 });
      }
      const record = globalCrdtEngine.setRecord(key, value);
      return NextResponse.json({
        success: true,
        action: "SET",
        record,
        vectorClock: globalCrdtEngine.getVectorClock()
      });
    }

    if (action === "DELETE") {
      if (!key) {
        return NextResponse.json({ success: false, error: "Missing key for DELETE operation" }, { status: 400 });
      }
      const tombstone = globalCrdtEngine.deleteRecord(key);
      return NextResponse.json({
        success: true,
        action: "DELETE",
        tombstone,
        vectorClock: globalCrdtEngine.getVectorClock()
      });
    }

    if (action === "RECONCILE") {
      const recordsToReconcile: CrdtRecord[] = remoteRecords || (remoteRecord ? [remoteRecord] : []);
      if (!recordsToReconcile.length) {
        return NextResponse.json({ success: false, error: "No remote records provided for reconciliation" }, { status: 400 });
      }

      const results = recordsToReconcile.map(rec => globalCrdtEngine.reconcileRecord(rec));

      return NextResponse.json({
        success: true,
        action: "RECONCILE",
        reconciledCount: results.length,
        results,
        currentVectorClock: globalCrdtEngine.getVectorClock()
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: SET, DELETE, RECONCILE"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Replication operation failed" },
      { status: 500 }
    );
  }
}
