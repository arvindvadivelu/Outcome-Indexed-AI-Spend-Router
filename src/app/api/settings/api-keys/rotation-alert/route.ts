import { NextResponse } from "next/server";
import { auditApiKeyRotationSecurity } from "@/lib/key-rotation-guard";
import { findUserByEmail, getAllUsers } from "@/lib/auth-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const user = email ? findUserByEmail(email) : getAllUsers()[0];

    const keys = user?.apiKeys || [{ id: "key_default_primary", key_prefix: "oir_live_8f39...", full_key: "oir_live_8f39a7b92c41e82a934d" }];
    const audits = keys.map((k: any) => auditApiKeyRotationSecurity(k));
    const rotationRequiredCount = audits.filter((a: any) => a.rotationRecommended).length;

    return NextResponse.json({
      success: true,
      email,
      totalKeysAudited: audits.length,
      rotationRequiredCount,
      complianceStatus: rotationRequiredCount === 0 ? "SOC2_COMPLIANT" : "ROTATION_RECOMMENDED",
      keys: audits
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Key security audit failed" },
      { status: 500 }
    );
  }
}
