import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, role, tokenQuota } = await req.json().catch(() => ({}));

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email address required." }, { status: 400 });
    }

    const invitationToken = `inv_${Math.random().toString(36).slice(2, 12)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const inviteLink = `http://localhost:3000/auth/signup?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role || "Engineer")}&token=${invitationToken}`;

    return NextResponse.json({
      success: true,
      email,
      role: role || "Engineer",
      tokenQuota: tokenQuota || "100,000 / mo",
      invitationToken,
      inviteLink,
      expiresAt,
      message: `Invitation successfully queued for ${email} with role ${role || "Engineer"}.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Invitation failed" },
      { status: 500 }
    );
  }
}
