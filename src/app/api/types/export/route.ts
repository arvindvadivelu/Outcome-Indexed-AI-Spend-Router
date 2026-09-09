import { NextResponse } from "next/server";

export async function GET() {
  const tsDefinitions = `/**
 * ⚡ Outcome-Indexed AI Spend Router Client Types
 * Generated automatically from the active API Gateway Schema.
 * Compatible with OpenAI, Anthropic, Groq, and DeepSeek Wire Protocols.
 */

export interface ChatCompletionMessage {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
}

export type OutcomeRoutingStrategy = "outcome_optimized" | "cost_minimal" | "quality_boost";

export type OutcomeTargetMetric =
  | "code_merged"
  | "demo_booked"
  | "first_contact_resolution"
  | "ticket_resolved"
  | "user_satisfaction"
  | string;

export interface OutcomeGatewayHeaders {
  "X-Outcome-Strategy"?: OutcomeRoutingStrategy;
  "X-Outcome-Target-Metric"?: OutcomeTargetMetric;
  "X-Outcome-SLA-Threshold-Ms"?: string | number;
  "X-Outcome-Semantic-Delta"?: "true" | "false";
  "X-Outcome-Speculative-Prewarm"?: "true" | "false";
  "Authorization"?: string;
  "x-api-key"?: string;
}

export interface OutcomeRouterRequest {
  model?: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  strategy?: OutcomeRoutingStrategy;
  target_metric?: OutcomeTargetMetric;
  semantic_delta?: boolean;
  speculative_prewarm?: boolean;
  idempotency_key?: string;
}

export interface OutcomeRouterMetadata {
  account_email?: string;
  plan_tier?: string;
  monthly_token_quota?: number;
  tokens_consumed?: number;
  tokens_remaining?: number;
  is_real_inference?: boolean;
  provider_status?: string;
  task_type?: string;
  target_metric?: string;
  strategy_applied?: string;
  model_routed?: string;
  provider?: string;
  baseline_model?: string;
  baseline_cost_usd?: number;
  actual_cost_usd?: number;
  capital_saved_usd?: number;
  spend_avoided_pct?: string;
  edge_ttft_ms?: number;
  sla_threshold_ms?: number;
  sla_status?: "SLA_COMPLIANT" | "FAILOVER_REFUNDED";
  sla_contract_nonce?: string;
  outcome_confidence_score?: number;
  gateway_execution_ms?: number;
  paid_features_active?: boolean;
  semantic_cache_hit?: boolean;
  tokens_avoided_by_cache?: number;
  speculative_prewarm_active?: boolean;
  ttft_speedup_factor?: string;
}

export interface OutcomeRouterResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatCompletionMessage;
    finish_reason: "stop" | "length" | string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _router_metadata: OutcomeRouterMetadata;
}

export interface OutcomeFeedbackPayload {
  request_id: string;
  outcome_success: boolean;
  user_email?: string;
  feedback_notes?: string;
}
`;

  return new NextResponse(tsDefinitions, {
    status: 200,
    headers: {
      "Content-Type": "application/typescript; charset=utf-8",
      "Content-Disposition": 'attachment; filename="outcome-router.d.ts"',
      "Cache-Control": "public, max-age=3600"
    }
  });
}
