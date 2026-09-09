import { NextResponse } from "next/server";
import { globalCircuitMeshEngine } from "@/lib/circuit-mesh-sync";

export async function GET() {
  try {
    const status = globalCircuitMeshEngine.getMeshStatus();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      mesh: status
    }, {
      headers: {
        "X-Mesh-Node": status.localNodeId,
        "X-Mesh-Gossip-Version": status.gossipVersion.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve circuit mesh status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, provider, reason, peerId, peerCircuits } = body;

    if (action === "TRIP") {
      if (!provider) {
        return NextResponse.json({ success: false, error: "Missing provider for TRIP action" }, { status: 400 });
      }

      const telemetry = globalCircuitMeshEngine.tripLocalCircuit(provider, reason);
      return NextResponse.json({
        success: true,
        action: "TRIP",
        provider,
        telemetry
      });
    }

    if (action === "RESET") {
      if (!provider) {
        return NextResponse.json({ success: false, error: "Missing provider for RESET action" }, { status: 400 });
      }

      const telemetry = globalCircuitMeshEngine.resetLocalCircuit(provider);
      return NextResponse.json({
        success: true,
        action: "RESET",
        provider,
        telemetry
      });
    }

    if (action === "GOSSIP_SYNC") {
      if (!peerId || !peerCircuits) {
        return NextResponse.json(
          { success: false, error: "Missing peerId or peerCircuits map for GOSSIP_SYNC" },
          { status: 400 }
        );
      }

      const syncResult = globalCircuitMeshEngine.receivePeerGossip(peerId, peerCircuits);
      return NextResponse.json({
        success: true,
        action: "GOSSIP_SYNC",
        peerId,
        updatedProviders: syncResult.updatedProviders,
        localState: syncResult.localState
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: TRIP, RESET, GOSSIP_SYNC"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Circuit mesh operation failed" },
      { status: 500 }
    );
  }
}
