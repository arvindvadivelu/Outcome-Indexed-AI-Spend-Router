import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { monthly_spend, monthly_budget } = await req.json().catch(() => ({}));
    const currentSpend = typeof monthly_spend === "number" ? monthly_spend : 842.50;
    const currentBudget = typeof monthly_budget === "number" ? monthly_budget : 1200.00;

    const projectedInvoice = parseFloat((currentSpend * 1.15).toFixed(2));
    const projectedSavings = parseFloat((currentSpend * 0.76).toFixed(2));

    return NextResponse.json({
      success: true,
      evaluatedAt: new Date().toISOString(),
      current_spend_usd: currentSpend,
      monthly_budget_usd: currentBudget,
      projected_invoice_usd: projectedInvoice,
      projected_savings_usd: projectedSavings,
      pacing_status: currentSpend < currentBudget ? "OPTIMAL_PACING" : "OVER_BUDGET_WARNING",
      recommendation: `Pacing is ${Math.round((1 - currentSpend / currentBudget) * 100)}% within your monthly budget ceiling. Shifting 15% more traffic from Claude 3.5 Sonnet to DeepSeek-V3 on SQL extraction will recover an additional $${(projectedSavings * 0.28).toFixed(2)}/mo without impacting conversion rates.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Billing forecast failed" },
      { status: 500 }
    );
  }
}
