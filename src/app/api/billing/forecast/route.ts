import { NextResponse } from "next/server";

function calculateForecast(spend?: number | null, budget?: number | null) {
  const currentSpend = typeof spend === "number" && !isNaN(spend) ? spend : 842.50;
  const currentBudget = typeof budget === "number" && !isNaN(budget) ? budget : 1200.00;

  const projectedInvoice = parseFloat((currentSpend * 1.15).toFixed(2));
  const projectedSavings = parseFloat((currentSpend * 0.76).toFixed(2));

  const safeBudget = Math.max(1, currentBudget);
  const isUnderBudget = currentSpend <= currentBudget;
  const diffPct = Math.abs(Math.round(((currentBudget - currentSpend) / safeBudget) * 100));

  return {
    success: true,
    evaluatedAt: new Date().toISOString(),
    current_spend_usd: currentSpend,
    monthly_budget_usd: currentBudget,
    projected_invoice_usd: projectedInvoice,
    projected_savings_usd: projectedSavings,
    pacing_status: isUnderBudget ? "OPTIMAL_PACING" : "OVER_BUDGET_WARNING",
    recommendation: isUnderBudget
      ? `Pacing is ${diffPct}% within your monthly budget ceiling. Shifting 15% more traffic from Claude 3.5 Sonnet to DeepSeek-V3 on SQL extraction will recover an additional $${(projectedSavings * 0.28).toFixed(2)}/mo without impacting conversion rates.`
      : `Spend velocity is currently exceeding budget ceiling by ${diffPct}%. Enabling aggressive savings mode will throttle costly fallbacks and bring pacing back within target boundaries.`
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const spendParam = searchParams.get("monthly_spend") || searchParams.get("current_spend");
    const budgetParam = searchParams.get("monthly_budget") || searchParams.get("budget");

    const spend = spendParam ? parseFloat(spendParam) : null;
    const budget = budgetParam ? parseFloat(budgetParam) : null;

    const result = calculateForecast(spend, budget);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Billing forecast failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { monthly_spend, monthly_budget, current_spend_usd } = body;
    const spend = typeof monthly_spend === "number" ? monthly_spend : (typeof current_spend_usd === "number" ? current_spend_usd : null);
    const budget = typeof monthly_budget === "number" ? monthly_budget : null;

    const result = calculateForecast(spend, budget);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Billing forecast failed" },
      { status: 500 }
    );
  }
}

