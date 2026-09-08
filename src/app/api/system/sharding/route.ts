import { NextResponse } from "next/server";
import { defaultHashRing } from "@/lib/consistent-hash-ring";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const testKey = searchParams.get("key");

    const nodes = defaultHashRing.getNodes();
    const totalVnodes = defaultHashRing.getTotalVnodes();

    let assignedShard = null;
    if (testKey) {
      assignedShard = defaultHashRing.getNode(testKey);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      activeNodes: nodes,
      totalPhysicalNodes: nodes.length,
      totalVirtualNodes: totalVnodes,
      queryKey: testKey || null,
      assignedShard
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to query sharding status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, nodeId, keys } = body;

    if (action === "add_shard" && nodeId) {
      defaultHashRing.addNode(nodeId);
      return NextResponse.json({
        success: true,
        message: `Shard node '${nodeId}' added to hash ring`,
        activeNodes: defaultHashRing.getNodes()
      });
    }

    if (action === "remove_shard" && nodeId) {
      defaultHashRing.removeNode(nodeId);
      return NextResponse.json({
        success: true,
        message: `Shard node '${nodeId}' removed from hash ring`,
        activeNodes: defaultHashRing.getNodes()
      });
    }

    if (action === "map_keys" && Array.isArray(keys)) {
      const mapping: Record<string, string> = {};
      for (const k of keys) {
        mapping[k] = defaultHashRing.getNode(k);
      }
      return NextResponse.json({
        success: true,
        mapping
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported: 'add_shard', 'remove_shard', 'map_keys'" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Sharding operation failed" },
      { status: 500 }
    );
  }
}
