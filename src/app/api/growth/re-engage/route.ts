import { NextResponse } from "next/server";
import { evaluateDripCampaignForUser } from "@/lib/email-drip-engine";
import { findUserByEmail, getAllUsers } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}));
    const user = email ? findUserByEmail(email) : getAllUsers()[0];
    const targetEmail = user?.email || email || "user@enterprise.ai";

    const campaign = evaluateDripCampaignForUser(user);

    return NextResponse.json({
      success: true,
      campaign,
      message: `Automated lifecycle drip campaign '${campaign.triggerReason}' dispatched to ${targetEmail}.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Drip evaluation failed" },
      { status: 500 }
    );
  }
}
