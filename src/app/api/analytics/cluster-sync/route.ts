import { NextResponse } from "next/server";
import { clusterSyncEngine } from "@/lib/redis-cluster-sync";

export async function GET() {
  try {
    const cluster = clusterSyncEngine.getClusterStatus();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...cluster
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Cluster synchronization query failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { apiKeyId } = await req.json().catch(() => ({}));
    if (!apiKeyId) {
      return NextResponse.json(
        { success: false, error: "apiKeyId is required for cluster revocation broadcast." },
        { status: 400 }
      );
    }

    const broadcast = clusterSyncEngine.broadcastKeyRevocation(apiKeyId);

    return NextResponse.json({
      success: true,
      message: `Global revocation pulse for '${apiKeyId}' replicated across all ${broadcast.replicatedNodes} edge regions.`,
      broadcast
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Broadcast failed" },
      { status: 500 }
    );
  }
}
