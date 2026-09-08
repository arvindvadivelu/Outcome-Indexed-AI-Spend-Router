import { NextResponse } from "next/server";

const DEFAULT_BENCHMARKS = [
  {
    model_name: "DeepSeek-V3",
    provider: "DeepSeek",
    task_type: "general_instruction",
    total_requests: 18450,
    success_count: 17480,
    win_rate: 0.948,
    win_rate_pct: 94.8,
    avg_latency_ms: 64,
    avg_cost_usd: 0.00042,
    cost_per_1k_tokens: 0.00027,
    cost_per_outcome_usd: 0.00044,
    cost_per_positive_outcome: 0.00044,
    pareto_tier: "frontier",
    thompson_score: 0.965,
    critic_pass_rate: 0.96
  },
  {
    model_name: "Groq Llama 3.3 70B",
    provider: "Groq",
    task_type: "customer_support",
    total_requests: 14200,
    success_count: 13630,
    win_rate: 0.960,
    win_rate_pct: 96.0,
    avg_latency_ms: 38,
    avg_cost_usd: 0.00018,
    cost_per_1k_tokens: 0.00059,
    cost_per_outcome_usd: 0.00019,
    cost_per_positive_outcome: 0.00019,
    pareto_tier: "frontier",
    thompson_score: 0.978,
    critic_pass_rate: 0.95
  },
  {
    model_name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    task_type: "sales_email",
    total_requests: 8900,
    success_count: 8380,
    win_rate: 0.942,
    win_rate_pct: 94.2,
    avg_latency_ms: 140,
    avg_cost_usd: 0.0034,
    cost_per_1k_tokens: 0.0030,
    cost_per_outcome_usd: 0.0036,
    cost_per_positive_outcome: 0.0036,
    pareto_tier: "frontier",
    thompson_score: 0.958,
    critic_pass_rate: 0.98
  },
  {
    model_name: "DeepSeek Coder V2",
    provider: "DeepSeek",
    task_type: "code_generation",
    total_requests: 11200,
    success_count: 10500,
    win_rate: 0.938,
    win_rate_pct: 93.8,
    avg_latency_ms: 115,
    avg_cost_usd: 0.00065,
    cost_per_1k_tokens: 0.00014,
    cost_per_outcome_usd: 0.00069,
    cost_per_positive_outcome: 0.00069,
    pareto_tier: "frontier",
    thompson_score: 0.952,
    critic_pass_rate: 0.95
  },
  {
    model_name: "GPT-4o (Baseline Control)",
    provider: "OpenAI",
    task_type: "complex_reasoning",
    total_requests: 6400,
    success_count: 5390,
    win_rate: 0.842,
    win_rate_pct: 84.2,
    avg_latency_ms: 380,
    avg_cost_usd: 0.0052,
    cost_per_1k_tokens: 0.0025,
    cost_per_outcome_usd: 0.0062,
    cost_per_positive_outcome: 0.0062,
    pareto_tier: "suboptimal",
    thompson_score: 0.840,
    critic_pass_rate: 0.91
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskType = searchParams.get("task_type") || searchParams.get("task");
    const paretoTier = searchParams.get("pareto_tier") || searchParams.get("tier");
    const provider = searchParams.get("provider");

    let results = DEFAULT_BENCHMARKS;

    if (taskType && taskType !== "all") {
      results = results.filter((b) => b.task_type.toLowerCase().includes(taskType.toLowerCase()));
    }
    if (paretoTier && paretoTier !== "all") {
      results = results.filter((b) => b.pareto_tier.toLowerCase() === paretoTier.toLowerCase());
    }
    if (provider && provider !== "all") {
      results = results.filter((b) => b.provider.toLowerCase().includes(provider.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total_models: results.length,
      benchmarks: results
    }, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
        "X-Outcome-Benchmarks-Count": String(results.length)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch benchmarks" },
      { status: 500 }
    );
  }
}
