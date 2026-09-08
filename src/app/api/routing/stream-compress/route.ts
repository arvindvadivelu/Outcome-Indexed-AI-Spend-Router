import { NextResponse } from "next/server";
import { compressResponseChunk } from "@/lib/stream-compressor";

export async function POST(req: Request) {
  try {
    const { payloadText } = await req.json().catch(() => ({}));
    const textToCompress = payloadText || "Outcome-Indexed AI Spend Router reduces LLM spend by 40% while guaranteeing SLA outcome fidelity across Claude 3.5 Sonnet, DeepSeek-V3, and Groq Llama 3.3 models.".repeat(5);

    const { metrics } = compressResponseChunk(textToCompress);

    return NextResponse.json({
      success: true,
      compressedAt: new Date().toISOString(),
      metrics,
      savingsPct: `${Math.round((1 - metrics.compressionRatio) * 100)}% wire bandwidth reduced`
    }, {
      headers: {
        "X-Stream-Compression-Ratio": metrics.compressionRatio.toString(),
        "X-Stream-Algorithm": metrics.algorithmUsed
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Stream compression failed" },
      { status: 500 }
    );
  }
}
