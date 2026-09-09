import { NextResponse } from "next/server";
import { globalConnectionPoolManager } from "@/lib/connection-pool-manager";

export async function GET() {
  try {
    const stats = globalConnectionPoolManager.getAllPoolStats();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      connectionPools: stats
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve connection pool stats" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, host, leaseId } = body;

    if (action === "ACQUIRE") {
      if (!host) {
        return NextResponse.json({ success: false, error: "Missing host for socket acquisition" }, { status: 400 });
      }

      const result = globalConnectionPoolManager.acquireSocket(host);
      return NextResponse.json({
        success: result.granted,
        action: "ACQUIRE",
        host,
        leaseId: result.leaseId,
        socketId: result.socketId,
        poolStats: result.poolStats,
        reason: result.reason
      }, { status: result.granted ? 200 : 503 });
    }

    if (action === "RELEASE") {
      if (!leaseId) {
        return NextResponse.json({ success: false, error: "Missing leaseId for socket release" }, { status: 400 });
      }

      const result = globalConnectionPoolManager.releaseSocket(leaseId);
      return NextResponse.json({
        success: result.success,
        action: "RELEASE",
        leaseId,
        host: result.host,
        socketId: result.socketId
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: ACQUIRE, RELEASE"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Connection pool operation failed" },
      { status: 500 }
    );
  }
}
