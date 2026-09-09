import { NextResponse } from "next/server";
import { globalProviderQuarantineEngine, QuarantineState } from "@/lib/provider-quarantine";

export async function GET() {
  try {
    const profiles = globalProviderQuarantineEngine.getAllProfiles();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      providerProfiles: profiles
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve provider quarantine profiles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, provider, success: eventSuccess, latencyMs, isAnomaly, errorMessage, state, reason } = body;

    if (action === "RECORD_EVENT") {
      if (!provider || typeof latencyMs !== "number") {
        return NextResponse.json(
          { success: false, error: "Missing provider or valid latencyMs number" },
          { status: 400 }
        );
      }

      const profile = globalProviderQuarantineEngine.recordEvent({
        provider,
        success: eventSuccess !== false,
        latencyMs,
        isAnomaly: Boolean(isAnomaly),
        errorMessage
      });

      return NextResponse.json({
        success: true,
        action: "RECORD_EVENT",
        profile
      });
    }

    if (action === "OVERRIDE") {
      if (!provider || !state) {
        return NextResponse.json(
          { success: false, error: "Missing provider or state for OVERRIDE action" },
          { status: 400 }
        );
      }

      const updated = globalProviderQuarantineEngine.overrideState(provider, state as QuarantineState, reason);
      const profiles = globalProviderQuarantineEngine.getAllProfiles();

      return NextResponse.json({
        success: updated,
        action: "OVERRIDE",
        provider,
        state,
        profiles
      });
    }

    if (action === "PROBATION") {
      if (!provider) {
        return NextResponse.json({ success: false, error: "Missing provider for PROBATION action" }, { status: 400 });
      }

      const updated = globalProviderQuarantineEngine.setProbation(provider);
      return NextResponse.json({
        success: updated,
        action: "PROBATION",
        provider
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: RECORD_EVENT, OVERRIDE, PROBATION"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Quarantine operation failed" },
      { status: 500 }
    );
  }
}
