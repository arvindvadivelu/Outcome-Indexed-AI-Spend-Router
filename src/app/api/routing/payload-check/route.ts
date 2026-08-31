import { NextResponse } from "next/server";
import { inspectPayloadSize } from "@/lib/payload-guard";

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get("content-length");
    const rawBody = await req.text();

    const inspection = inspectPayloadSize(contentLength, rawBody);

    if (!inspection.isAllowed) {
      return NextResponse.json(
        { success: false, error: "413 Payload Too Large", inspection },
        { status: 413 }
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      inspection
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Payload inspection error" },
      { status: 500 }
    );
  }
}
