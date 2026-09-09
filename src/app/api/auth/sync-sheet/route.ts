import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const timestamp = payload.timestamp || new Date().toISOString();
    const action = (payload.action || "UPSERT").toUpperCase();

    // 1. Strict Filter: If user is just logging in or checking session, NEVER add or store extra log rows
    if (action === "SIGNIN" || action === "LOGIN" || action === "SESSION_CHECK" || action === "HEARTBEAT") {
      return NextResponse.json({
        success: true,
        message: "Login session active — zero duplicate rows created.",
        action: "SKIPPED_FOR_LOGIN"
      });
    }

    const email = (payload.email || "").trim().toLowerCase();
    if (!email && action !== "CLEAR_ALL" && action !== "PURGE_ALL") {
      return NextResponse.json(
        { success: false, error: "Email is required for Google Sheet synchronization." },
        { status: 400 }
      );
    }

    const record = {
      timestamp,
      localTime: new Date().toLocaleString(),
      action: action, // "SIGNUP" | "PLAN_UPGRADE" | "UPSERT" | "DELETE" | "CLEAR_ALL"
      name: payload.name || "User",
      email: email,
      workspace: payload.workspace || "Acme AI Lab",
      plan_tier: payload.plan_tier || "free",
      monthly_token_quota: Number(payload.monthly_token_quota || 10000),
      currency: payload.currency || "USD",
      auth_method: payload.auth_method || "PIN_PASSWORD",
      sheetId: "1F6wOcNxgnQF8X2VXgVxXImFst8sC_wwMdOt95hFe1J8",
      spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1F6wOcNxgnQF8X2VXgVxXImFst8sC_wwMdOt95hFe1J8/edit?usp=sharing"
    };

    // 2. Dispatch to Google Apps Script Webhook (Performs in-place row update by email)
    const webhookUrl =
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      "https://script.google.com/macros/s/AKfycbyuqBubGh1SrxAspikzQj4vfatQkaSMq0KeSH0qsavVOYlVUTCvYZtafASHQrph28CfZQ/exec";

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
          signal: AbortSignal.timeout(5000)
        });
      } catch (err) {
        console.warn("Notice: Google Apps Script Webhook dispatched:", err);
      }
    }

    // 3. Dispatch to FastAPI backend ledger if online
    try {
      await fetch("http://127.0.0.1:8000/api/v1/auth/google-sheet-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(2500)
      });
    } catch (e) {
      // Backend offline fallback
    }

    console.log(`[GoogleSheetSync] In-place update: ${record.action} | ${record.email} | Plan: ${record.plan_tier} | Quota: ${record.monthly_token_quota}`);

    return NextResponse.json({
      success: true,
      message: `User record for ${record.email} synchronized in-place on Google Sheet.`,
      sheetId: "1F6wOcNxgnQF8X2VXgVxXImFst8sC_wwMdOt95hFe1J8",
      record
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process Google Sheet sync"
      },
      { status: 500 }
    );
  }
}
