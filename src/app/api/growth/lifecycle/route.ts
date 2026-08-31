import { NextResponse } from "next/server";
import { evaluateUserLifecycle } from "@/lib/lifecycle-engine";
import { findUserByEmail, getAllUsers } from "@/lib/auth-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const user = email ? findUserByEmail(email) : getAllUsers()[0];

    const funnel = evaluateUserLifecycle(user);

    return NextResponse.json({
      success: true,
      ...funnel
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
