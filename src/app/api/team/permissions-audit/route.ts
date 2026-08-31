import { NextResponse } from "next/server";
import { evaluateRolePermission, getAllRoleCapabilities } from "@/lib/rbac-matrix-guard";

export async function POST(req: Request) {
  try {
    const { role, action } = await req.json().catch(() => ({}));
    const targetRole = role || "STAFF_ML_ENGINEER";
    const targetAction = action || "MODIFY_BUDGET_CEILING";

    const audit = evaluateRolePermission(targetRole, targetAction);

    return NextResponse.json({
      success: audit.allowed,
      evaluatedAt: new Date().toISOString(),
      audit,
      matrixDirectory: getAllRoleCapabilities()
    }, {
      status: audit.allowed ? 200 : 403
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "RBAC audit failed" },
      { status: 500 }
    );
  }
}
