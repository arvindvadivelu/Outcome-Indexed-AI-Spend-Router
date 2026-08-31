import { NextResponse } from "next/server";
import { evaluateDripCampaignForUser } from "@/lib/email-drip-engine";
import { findUserByEmail } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}));
    const targetEmail = email || "varvind2004@gmail.com";
    const user = findUserByEmail(targetEmail);

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
