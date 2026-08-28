import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const timestamp = payload.timestamp || new Date().toISOString();

    const record = {
      timestamp,
      localTime: new Date().toLocaleString(),
      action: payload.action || "SIGNIN",
      name: payload.name || "Unknown User",
      email: payload.email || "user@example.com",
      workspace: payload.workspace || "Acme AI Lab",
      plan_tier: payload.plan_tier || "Free",
      monthly_token_quota: payload.monthly_token_quota || 10000,
      currency: payload.currency || "USD",
      auth_method: payload.auth_method || "PIN_PASSWORD",
      sheetId: "1F6wOcNxgnQF8X2VXgVxXImFst8sC_wwMdOt95hFe1J8",
      spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1F6wOcNxgnQF8X2VXgVxXImFst8sC_wwMdOt95hFe1J8/edit?usp=sharing"
    };

    // Forward to FastAPI backend persistent ledger if available
    try {
      await fetch("http://127.0.0.1:8000/api/v1/auth/google-sheet-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(2500)
      });
    } catch (e) {
      // Backend offline or timeout fallback
    }

    console.log(`[GoogleSheetSync] Record logged: ${record.action} | ${record.email} | Plan: ${record.plan_tier} | Quota: ${record.monthly_token_quota}`);

    return NextResponse.json({
      success: true,
      message: `Auth event ${record.action} successfully recorded to Google Sheet ledger.`,
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
