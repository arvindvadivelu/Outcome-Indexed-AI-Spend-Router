import { NextResponse } from "next/server";
import { validateRoutingRule } from "@/lib/validation-schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = validateRoutingRule(body);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation schema failed",
          issues: result.issues
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      sanitizedRule: result.sanitizedPayload,
      message: "Routing policy passed strict schema validation and sanitization."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Validation processing error" },
      { status: 500 }
    );
  }
}
