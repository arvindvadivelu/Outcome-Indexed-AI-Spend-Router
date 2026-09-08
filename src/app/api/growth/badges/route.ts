import { NextResponse } from "next/server";
import { getUserBadgeNotifications } from "@/lib/badge-notification-engine";
import { findUserByEmail, getAllUsers } from "@/lib/auth-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const user = email ? findUserByEmail(email) : getAllUsers()[0];

    const report = getUserBadgeNotifications(user);

    return NextResponse.json({
      success: true,
      email,
      ...report
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch badge notifications" },
      { status: 500 }
    );
  }
}
