import { NextResponse } from "next/server";
import { globalUpstreamBudgetGuard } from "@/lib/upstream-budget-guard";

export async function GET() {
  try {
    const status = globalUpstreamBudgetGuard.getStatus();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      providerBudgets: status
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve upstream budgets" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, provider, estimatedTokens, leaseId, actualTokens } = body;

    if (action === "RESERVE") {
      if (!provider || typeof estimatedTokens !== "number") {
        return NextResponse.json(
          { success: false, error: "Missing provider or valid estimatedTokens number" },
          { status: 400 }
        );
      }

      const result = globalUpstreamBudgetGuard.reserveBudget(provider, estimatedTokens);
      const statusCode = result.granted ? 200 : 429;

      return NextResponse.json({
        success: result.granted,
        action: "RESERVE",
        provider,
        leaseId: result.leaseId,
        tpmRemaining: result.tpmRemaining,
        rpmRemaining: result.rpmRemaining,
        utilizationPct: result.utilizationPct,
        reason: result.reason
      }, { status: statusCode });
    }

    if (action === "COMMIT") {
      if (!leaseId || typeof actualTokens !== "number") {
        return NextResponse.json(
          { success: false, error: "Missing leaseId or valid actualTokens number" },
          { status: 400 }
        );
      }

      const result = globalUpstreamBudgetGuard.commitLease(leaseId, actualTokens);
      return NextResponse.json({
        success: result.success,
        action: "COMMIT",
        leaseId,
        variance: result.variance
      });
    }

    if (action === "RELEASE") {
      if (!leaseId) {
        return NextResponse.json(
          { success: false, error: "Missing leaseId for RELEASE operation" },
          { status: 400 }
        );
      }

      const result = globalUpstreamBudgetGuard.releaseLease(leaseId);
      return NextResponse.json({
        success: result.success,
        action: "RELEASE",
        leaseId,
        releasedTokens: result.releasedTokens
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: RESERVE, COMMIT, RELEASE"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Upstream budget operation failed" },
      { status: 500 }
    );
  }
}
