import { NextResponse } from "next/server";
import { inspectPayloadSize, inspectJsonDepth } from "@/lib/payload-guard";

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get("content-length");
    const rawBody = await req.text();

    const sizeInspection = inspectPayloadSize(contentLength, rawBody);

    if (!sizeInspection.isAllowed) {
      return NextResponse.json(
        { success: false, error: "413 Payload Too Large", sizeInspection },
        { status: 413 }
      );
    }

    let parsedJson = null;
    let depthInspection = null;

    if (rawBody && rawBody.trim().startsWith("{") || rawBody.trim().startsWith("[")) {
      try {
        parsedJson = JSON.parse(rawBody);
        depthInspection = inspectJsonDepth(parsedJson);

        if (!depthInspection.isSafe) {
          return NextResponse.json(
            { success: false, error: "400 JSON Recursion Depth Limit Exceeded", depthInspection },
            { status: 400 }
          );
        }
      } catch (jsonErr: any) {
        return NextResponse.json(
          { success: false, error: "400 Malformed JSON Payload", details: jsonErr?.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sizeInspection,
      depthInspection: depthInspection || { isSafe: true, status: "OK", maxCalculatedDepth: 1, message: "Non-JSON or simple payload" }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Payload inspection error" },
      { status: 500 }
    );
  }
}

