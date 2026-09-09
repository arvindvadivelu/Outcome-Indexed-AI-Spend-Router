import { NextResponse } from "next/server";
import { globalMultiCloudDnsEngine } from "@/lib/multicloud-dns-probe";

export async function GET() {
  try {
    const probe = globalMultiCloudDnsEngine.probeAll();

    return NextResponse.json({
      success: true,
      timestamp: probe.timestamp,
      dnsProviders: probe.activeProviders,
      healthyCount: probe.healthyCount,
      failoverActive: probe.failoverActive
    }, {
      headers: {
        "X-DNS-Healthy-Providers": probe.healthyCount.toString(),
        "X-DNS-Failover-Active": probe.failoverActive ? "true" : "false"
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve DNS probe status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, providerId, healthy } = body;

    if (action === "SET_HEALTH") {
      if (!providerId || typeof healthy !== "boolean") {
        return NextResponse.json(
          { success: false, error: "Missing providerId or boolean healthy property" },
          { status: 400 }
        );
      }

      const updated = globalMultiCloudDnsEngine.setProviderHealth(providerId, healthy);
      const probe = globalMultiCloudDnsEngine.probeAll();

      return NextResponse.json({
        success: updated,
        action: "SET_HEALTH",
        providerId,
        healthy,
        probe
      });
    }

    if (action === "PROBE_ALL") {
      const probe = globalMultiCloudDnsEngine.probeAll();
      return NextResponse.json({
        success: true,
        action: "PROBE_ALL",
        probe
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: SET_HEALTH, PROBE_ALL"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Multi-cloud DNS operation failed" },
      { status: 500 }
    );
  }
}
