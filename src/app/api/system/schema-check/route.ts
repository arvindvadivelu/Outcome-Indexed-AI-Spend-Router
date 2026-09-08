import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/auth-db";

export async function GET() {
  try {
    const users = getAllUsers();
    const totalUsers = users.length;

    let validSchemaCount = 0;
    const missingFieldStats: Record<string, number> = {};

    const requiredFields = [
      "id",
      "email",
      "name",
      "workspace",
      "plan_tier",
      "monthly_token_quota",
      "pin",
      "currency",
      "created_at",
      "apiKeys",
      "rules",
      "teamMembers",
      "federationSettings"
    ];

    for (const u of users) {
      let isFullyValid = true;
      for (const field of requiredFields) {
        if ((u as any)[field] === undefined) {
          isFullyValid = false;
          missingFieldStats[field] = (missingFieldStats[field] || 0) + 1;
        }
      }
      if (isFullyValid) validSchemaCount++;
    }

    const integrityScorePct = totalUsers > 0 ? Math.round((validSchemaCount / totalUsers) * 100) : 100;

    return NextResponse.json({
      success: true,
      auditedAt: new Date().toISOString(),
      databaseEngine: "Atomic Multi-Tenant File-Backed JSON Store (SHA-256 Checksums)",
      totalTenants: totalUsers,
      validTenants: validSchemaCount,
      integrityScorePct,
      missingFieldStats,
      status: integrityScorePct === 100 ? "OPTIMAL_NORMALIZED" : "MIGRATION_REQUIRED"
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Schema health check failed" },
      { status: 500 }
    );
  }
}
