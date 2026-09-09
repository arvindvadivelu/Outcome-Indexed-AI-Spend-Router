import { NextResponse } from "next/server";
import { globalSchemaMutationGuard } from "@/lib/schema-mutation-guard";

export async function GET() {
  try {
    const fuzzVectors = globalSchemaMutationGuard.generateFuzzVectors();
    const fuzzResults = fuzzVectors.map(vec => ({
      name: vec.name,
      result: globalSchemaMutationGuard.inspectPayload(vec.payload)
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      fuzzVectorCount: fuzzVectors.length,
      fuzzResults
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute schema mutation fuzzing" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const rawText = await req.text();
    let rawBody: any = {};
    try {
      rawBody = JSON.parse(rawText || "{}");
    } catch {
      rawBody = {};
    }

    const result = globalSchemaMutationGuard.inspectPayload(rawBody, 32, rawText);
    const statusCode = result.safe ? 200 : (result.threatLevel === "CRITICAL" ? 403 : 400);

    return NextResponse.json({
      success: result.safe,
      timestamp: new Date().toISOString(),
      threatLevel: result.threatLevel,
      violations: result.violations,
      keysInspected: result.keysInspected,
      sanitizedPayload: result.sanitizedPayload
    }, {
      status: statusCode,
      headers: {
        "X-Mutation-Threat-Level": result.threatLevel,
        "X-Mutation-Safe": result.safe ? "true" : "false"
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Schema inspection failed" },
      { status: 500 }
    );
  }
}
