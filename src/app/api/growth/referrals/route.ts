import { NextResponse } from "next/server";
import { calculateReferralStats } from "@/lib/growth-engine";
import { findUserByEmail, getAllUsers, updateUserAccountState } from "@/lib/auth-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");
    const user = emailParam ? findUserByEmail(emailParam) : getAllUsers()[0];
    const email = user?.email || emailParam || "user@enterprise.ai";

    const stats = calculateReferralStats(email, user?.plan_tier || "growth");

    return NextResponse.json({
      success: true,
      email,
      ...stats
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, referralCode } = await req.json().catch(() => ({}));

    if (!email || !referralCode) {
      return NextResponse.json(
        { success: false, error: "Email and referralCode are required." },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);
    const bonusTokens = 50000;

    if (user) {
      const updatedQuota = (user.monthly_token_quota || 10000) + bonusTokens;
      updateUserAccountState(email, {
        monthly_token_quota: updatedQuota
      });
    }

    return NextResponse.json({
      success: true,
      email,
      appliedReferralCode: referralCode,
      bonusTokensAwarded: bonusTokens,
      message: `Referral code ${referralCode} applied! +50,000 monthly bonus tokens credited to ${email}.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process referral" },
      { status: 500 }
    );
  }
}
