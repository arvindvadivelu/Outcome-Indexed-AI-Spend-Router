import { NextResponse } from "next/server";
import { failureDomainEngine } from "@/lib/failure-domain-guard";

export async function GET() {
  try {
    const domains = failureDomainEngine.getAllDomains();
    const optimalRegion = failureDomainEngine.getOptimalHealthyRegion();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      optimalHealthyRegion: optimalRegion,
      totalDomainsCount: domains.length,
      domains
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to query failure domains" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, regionId, isHealthy, latencyMs, isolate } = body;

    if (!regionId) {
      return NextResponse.json(
        { success: false, error: "regionId is required" },
        { status: 400 }
      );
    }

    if (action === "probe_update") {
      const updated = failureDomainEngine.updateDomainHealth(
        regionId,
        typeof isHealthy === "boolean" ? isHealthy : true,
        typeof latencyMs === "number" ? latencyMs : 25
      );
      if (!updated) {
        return NextResponse.json({ success: false, error: `Region '${regionId}' not found` }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Health probe updated for ${regionId}`,
        domain: updated,
        allDomains: failureDomainEngine.getAllDomains()
      });
    }

    if (action === "set_isolation") {
      const updated = failureDomainEngine.manuallySetIsolation(regionId, Boolean(isolate));
      if (!updated) {
        return NextResponse.json({ success: false, error: `Region '${regionId}' not found` }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Isolation state updated for ${regionId} to ${isolate}`,
        domain: updated,
        allDomains: failureDomainEngine.getAllDomains()
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported actions: 'probe_update', 'set_isolation'" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failure domain operation failed" },
      { status: 500 }
    );
  }
}
