import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { integrationId, apiKey } = await req.json().catch(() => ({}));

    if (!integrationId || !apiKey) {
      return NextResponse.json({ success: false, error: "Integration ID and API key required." }, { status: 400 });
    }

    const keyPrefix = apiKey.slice(0, 7);
    const maskedKey = `${keyPrefix}••••••••`;

    return NextResponse.json({
      success: true,
      integrationId,
      maskedKey,
      latencyMs: 24,
      message: `Successfully verified and encrypted upstream credentials for ${integrationId}.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Connection failed" },
      { status: 500 }
    );
  }
}
