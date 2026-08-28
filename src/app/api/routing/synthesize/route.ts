import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ success: false, error: "Prompt is required." }, { status: 400 });
    }

    const lower = prompt.toLowerCase();
    
    // Extract task type
    let taskType = "general_instruction";
    let targetMetric = "user_satisfaction";
    let priorityModels = ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"];
    let fallbackModel = "GPT-4o";
    let maxLatency = 400;
    let maxCost = 0.0035;

    if (lower.includes("code") || lower.includes("refactor") || lower.includes("python") || lower.includes("typescript") || lower.includes("sql") || lower.includes("pr") || lower.includes("bug")) {
      taskType = "code_generation";
      targetMetric = "code_merged";
      priorityModels = ["DeepSeek Coder", "Claude 3.5 Sonnet", "GPT-4o Mini"];
      maxLatency = 250;
      maxCost = 0.0018;
    } else if (lower.includes("sales") || lower.includes("email") || lower.includes("outreach") || lower.includes("cold") || lower.includes("demo") || lower.includes("prospect")) {
      taskType = "sales_email";
      targetMetric = "demo_booked";
      priorityModels = ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"];
      maxLatency = 350;
      maxCost = 0.0034;
    } else if (lower.includes("support") || lower.includes("ticket") || lower.includes("customer") || lower.includes("faq") || lower.includes("help") || lower.includes("chat")) {
      taskType = "customer_support";
      targetMetric = "ticket_resolved";
      priorityModels = ["Groq Llama 3.3", "DeepSeek-V3", "GPT-4o Mini"];
      maxLatency = 120;
      maxCost = 0.0004;
    } else if (lower.includes("finance") || lower.includes("legal") || lower.includes("audit") || lower.includes("compliance") || lower.includes("contract")) {
      taskType = "complex_reasoning";
      targetMetric = "contract_verified";
      priorityModels = ["Claude 3.5 Sonnet", "GPT-4o", "DeepSeek-V3"];
      maxLatency = 500;
      maxCost = 0.0055;
    }

    // Extract latency if mentioned (e.g. "< 200ms", "under 150ms")
    const latencyMatch = lower.match(/(?:<|under|less than|within)\s*(\d+)\s*(?:ms|milliseconds)/);
    if (latencyMatch && latencyMatch[1]) {
      maxLatency = parseInt(latencyMatch[1]);
    }

    // Clean rule name
    let ruleName = prompt.trim();
    if (ruleName.length > 50) {
      ruleName = ruleName.slice(0, 47) + "...";
    }
    // Capitalize first letter
    ruleName = ruleName.charAt(0).toUpperCase() + ruleName.slice(1);

    const generatedRule = {
      id: `rule_syn_${Date.now()}`,
      name: ruleName,
      task_type: taskType,
      condition_pattern: `task == '${taskType}' && latency <= ${maxLatency}ms`,
      target_metric: targetMetric,
      is_active: true,
      enabled: true,
      priority_models: priorityModels,
      models_priority: priorityModels,
      fallback_model: fallbackModel,
      max_latency_ms: maxLatency,
      max_cost_usd: maxCost,
      min_win_rate: 0.92,
      strategy: "outcome_optimized",
      ai_synthesized: true,
      trigger_count: 0,
      total_saved_usd: 0.0,
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Routing policy synthesized successfully from natural language.",
      rule: generatedRule
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Synthesis failed" },
      { status: 500 }
    );
  }
}
