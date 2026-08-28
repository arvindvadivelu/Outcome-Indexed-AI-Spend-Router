import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, rules } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ success: false, error: "Prompt is required." }, { status: 400 });
    }

    const lower = prompt.toLowerCase();
    const activeRules = Array.isArray(rules) && rules.length > 0 ? rules : [];

    let matchedRule: any = null;
    let matchedReason = "Default fallback routing";

    for (const rule of activeRules) {
      if (!rule.is_active && !rule.enabled) continue;

      const ruleTask = (rule.task_type || "").toLowerCase();
      const pattern = (rule.condition_pattern || "").toLowerCase();

      if (ruleTask === "code_generation" || pattern.includes("code")) {
        if (lower.includes("code") || lower.includes("typescript") || lower.includes("python") || lower.includes("refactor") || lower.includes("def ") || lower.includes("function") || lower.includes("api") || lower.includes("bug") || lower.includes("sql")) {
          matchedRule = rule;
          matchedReason = `Matched code condition (${rule.condition_pattern})`;
          break;
        }
      }

      if (ruleTask === "sales_email" || pattern.includes("sales")) {
        if (lower.includes("sales") || lower.includes("email") || lower.includes("outreach") || lower.includes("prospect") || lower.includes("lead") || lower.includes("demo") || lower.includes("follow up")) {
          matchedRule = rule;
          matchedReason = `Matched sales outreach condition (${rule.condition_pattern})`;
          break;
        }
      }

      if (ruleTask === "customer_support" || pattern.includes("support")) {
        if (lower.includes("support") || lower.includes("ticket") || lower.includes("help") || lower.includes("faq") || lower.includes("customer") || lower.includes("issue") || lower.includes("refund")) {
          matchedRule = rule;
          matchedReason = `Matched customer support condition (${rule.condition_pattern})`;
          break;
        }
      }

      if (ruleTask === "complex_reasoning" || pattern.includes("reasoning")) {
        if (lower.includes("audit") || lower.includes("contract") || lower.includes("legal") || lower.includes("compliance") || lower.includes("analysis") || lower.includes("calculate")) {
          matchedRule = rule;
          matchedReason = `Matched complex reasoning condition (${rule.condition_pattern})`;
          break;
        }
      }

      // Check if prompt words match rule name
      const nameWords = rule.name.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
      if (nameWords.some((w: string) => lower.includes(w))) {
        matchedRule = rule;
        matchedReason = `Semantic keyword match on policy "${rule.name}"`;
        break;
      }
    }

    if (!matchedRule && activeRules.length > 0) {
      matchedRule = activeRules[0];
      matchedReason = `Default priority policy "${matchedRule.name}"`;
    }

    const primaryModel = matchedRule?.priority_models?.[0] || "DeepSeek-V3";
    const secondaryModel = matchedRule?.priority_models?.[1] || "Claude 3.5 Sonnet";
    const fallbackModel = matchedRule?.fallback_model || "GPT-4o";
    const targetMetric = matchedRule?.target_metric || "user_satisfaction";
    const maxLatency = matchedRule?.max_latency_ms || 400;

    const estimatedCost = primaryModel.includes("DeepSeek") ? 0.00065 : (primaryModel.includes("Groq") ? 0.00018 : 0.0034);
    const baselineGpt4oCost = 0.0052;
    const estimatedSavingsPct = Math.round(((baselineGpt4oCost - estimatedCost) / baselineGpt4oCost) * 100);

    return NextResponse.json({
      success: true,
      matchedRule: matchedRule ? matchedRule.name : "Default Fallback Policy",
      ruleId: matchedRule?.id || "fallback_default",
      matchedReason,
      primaryModel,
      secondaryModel,
      fallbackModel,
      targetMetric,
      maxLatencySla: `${maxLatency}ms`,
      estimatedCostUSD: estimatedCost,
      estimatedSavingsPct: `${estimatedSavingsPct}%`,
      decisionTrace: [
        { step: "Pattern Match", detail: matchedReason, status: "PASS" },
        { step: "Model Arbitration", detail: `Rank #1: ${primaryModel} | Rank #2: ${secondaryModel}`, status: "SELECTED" },
        { step: "SLA Circuit Breaker", detail: `Max latency ceiling: ${maxLatency}ms · Fallback: ${fallbackModel}`, status: "ARMED" }
      ]
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Dry-run evaluation failed" },
      { status: 500 }
    );
  }
}
