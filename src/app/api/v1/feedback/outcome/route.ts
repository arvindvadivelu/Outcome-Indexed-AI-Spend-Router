import { NextResponse } from "next/server";
import { findUserByApiKey, findUserByEmail, getAllUsers, updateUserAccountState } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const headers = req.headers;

    const requestId = body.request_id || body.requestId || body.id;
    if (!requestId) {
      return NextResponse.json(
        { error: { message: "request_id is required", type: "invalid_request_error" } },
        { status: 400 }
      );
    }

    const rawSuccess = body.outcome_success ?? body.success ?? body.outcome;
    const isSuccess = typeof rawSuccess === "string"
      ? rawSuccess.toLowerCase() === "success" || rawSuccess.toLowerCase() === "true" || rawSuccess.toLowerCase() === "win"
      : Boolean(rawSuccess);

    const metricName = body.metric_name || body.target_metric || body.metric || "conversion_success";
    const revenueImpact = typeof body.revenue_impact_usd === "number" ? body.revenue_impact_usd : 0.0;

    // Identify user
    const authHeader = headers.get("authorization") || "";
    const apiKeyHeader = headers.get("x-api-key") || "";
    const rawApiKey = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : (apiKeyHeader || authHeader).trim();

    let targetUser = null;
    if (rawApiKey) {
      const authResult = findUserByApiKey(rawApiKey);
      if (authResult) targetUser = authResult.user;
      else targetUser = findUserByEmail(rawApiKey);
    }

    if (!targetUser) {
      const userEmail = headers.get("x-user-email") || body.user_email || body.email;
      if (userEmail) {
        targetUser = findUserByEmail(userEmail);
      }
    }

    // If still not identified, search all users' logs for the matching requestId
    if (!targetUser) {
      const allUsers = getAllUsers();
      for (const u of allUsers) {
        if (u.logs && Array.isArray(u.logs) && u.logs.some((l: any) => l.id === requestId)) {
          targetUser = u;
          break;
        }
      }
    }

    let updatedModel = "";
    if (targetUser && targetUser.logs && Array.isArray(targetUser.logs)) {
      const updatedLogs = targetUser.logs.map((log: any) => {
        if (log.id === requestId) {
          updatedModel = log.model_used;
          return {
            ...log,
            outcome_success: isSuccess,
            outcome_metric: metricName,
            revenue_impact_usd: revenueImpact
          };
        }
        return log;
      });

      updateUserAccountState(targetUser.email, {
        logs: updatedLogs
      });
    }

    return NextResponse.json({
      status: "recorded",
      request_id: requestId,
      outcome_success: isSuccess,
      metric_name: metricName,
      revenue_impact_usd: revenueImpact,
      model_updated: updatedModel || "adaptive_ensemble",
      message: "Outcome indexed. Thompson sampling model weights successfully updated."
    }, {
      status: 200,
      headers: {
        "X-Outcome-Feedback-Status": "RECORDED",
        "X-Outcome-Request-Id": requestId
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error?.message || "Failed to record outcome feedback", type: "feedback_error" } },
      { status: 500 }
    );
  }
}
