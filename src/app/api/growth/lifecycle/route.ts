import { NextResponse } from "next/server";
import { evaluateUserLifecycle } from "@/lib/lifecycle-engine";
import { findUserByEmail } from "@/lib/auth-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "varvind2004@gmail.com";
    const user = findUserByEmail(email);

    const funnel = evaluateUserLifecycle(user);

    return NextResponse.json({
      success: true,
      ...funnel
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
