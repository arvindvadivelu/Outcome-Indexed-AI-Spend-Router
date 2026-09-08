import { NextResponse } from "next/server";
import { scanAndSanitizePrompt } from "@/lib/prompt-sanitizer";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json().catch(() => ({}));
    const testPrompt = prompt || "Draft a warm introduction email to our new enterprise customer.";

    const scan = scanAndSanitizePrompt(testPrompt);

    return NextResponse.json({
      success: scan.isSafe,
      scannedAt: new Date().toISOString(),
      scan
    }, {
      status: scan.isSafe ? 200 : 422
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Prompt security scan failed" },
      { status: 500 }
    );
  }
}
