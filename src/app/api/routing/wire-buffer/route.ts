import { NextResponse } from "next/server";
import { globalSseBufferPool } from "@/lib/sse-wire-buffer";

export async function GET() {
  try {
    const stats = globalSseBufferPool.getPoolStats();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      bufferPoolStats: stats
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve buffer pool stats" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { rawChunk } = body;

    const chunkToParse = rawChunk || [
      ": ping",
      'data: {"choices":[{"delta":{"content":"Outcome-Indexed "}}]}',
      ": keep-alive",
      'data: {"choices":[{"delta":{"content":"AI Spend Router "}}]}',
      'data: {"choices":[{"delta":{"content":"reduces LLM costs."}}]}',
      "data: [DONE]"
    ].join("\n");

    const result = globalSseBufferPool.parseChunk(chunkToParse);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        totalFrames: result.totalFrames,
        dataFramesCount: result.dataFramesCount,
        heartbeatsFiltered: result.heartbeatsFiltered,
        totalBytesProcessed: result.totalBytesProcessed,
        estimatedMemorySavedBytes: result.estimatedMemorySavedBytes,
        durationUs: result.durationUs,
        reconstructedMessage: result.extractedTokens.join("")
      },
      frames: result.frames,
      bufferPoolStats: globalSseBufferPool.getPoolStats()
    }, {
      headers: {
        "X-Wire-Tokens-Extracted": result.extractedTokens.length.toString(),
        "X-Wire-Bytes-Processed": result.totalBytesProcessed.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Wire parsing failed" },
      { status: 500 }
    );
  }
}
