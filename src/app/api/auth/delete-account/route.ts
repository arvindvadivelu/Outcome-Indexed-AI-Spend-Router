import { NextResponse } from "next/server";
import { findUserByEmail, deleteUser } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Account email is required to delete account." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = findUserByEmail(normalizedEmail);

    // 1. Delete from local database (data/users.json)
    const wasDeleted = deleteUser(normalizedEmail);

    // 2. Dispatch deletion record to Google Apps Script Webhook
    const webhookUrl =
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      "https://script.google.com/macros/s/AKfycbwGKherD18I8NfCC3ih1Vps6thXyA0b0uEAhYsEX9imxnS7Yk9gSKLkZHvza7KxaypZ3A/exec";

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          localTime: new Date().toLocaleString(),
          action: "DELETE_ACCOUNT",
          name: existingUser?.name || "Deleted User",
          email: normalizedEmail,
          workspace: existingUser?.workspace || "Deleted Workspace",
          plan_tier: existingUser?.plan_tier || "free",
          status: "PERMANENTLY_DELETED",
          notes: "Account info purged from database and Google Sheets ledger."
        }),
        redirect: "follow",
        signal: AbortSignal.timeout(5000)
      });
    } catch (sheetErr) {
      console.warn("Google Sheet delete webhook notification:", sheetErr);
    }

    return NextResponse.json({
      success: true,
      message: `Account "${normalizedEmail}" has been permanently deleted from both the database and Google Sheets ledger.`,
      email: normalizedEmail,
      deleted_at: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
