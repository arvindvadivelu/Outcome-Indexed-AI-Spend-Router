import { NextResponse } from "next/server";
import { scanAndSanitizePrompt, scanCompletionForCanaryLeak } from "@/lib/prompt-sanitizer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const testPrompt = body.prompt || "Draft a warm introduction email to our new enterprise customer.";
    const canaries = Array.isArray(body.knownCanaries) ? body.knownCanaries : [];

    const scan = scanAndSanitizePrompt(testPrompt, canaries);

    return NextResponse.json({
      success: scan.isSafe,
      scannedAt: new Date().toISOString(),
      threatLevel: scan.threatLevel,
      canaryLeakDetected: scan.canaryLeakDetected,
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
