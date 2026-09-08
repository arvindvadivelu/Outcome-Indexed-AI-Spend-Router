import { NextResponse } from "next/server";

export async function GET() {
  const tsDefinitions = `/**
 * ⚡ Outcome-Indexed AI Spend Router Client Types
 * Generated automatically from the active API Gateway Schema.
 */

export interface ChatCompletionMessage {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
}

export type OutcomeRoutingStrategy = "outcome_optimized" | "cost_minimum" | "latency_prioritized";

export type OutcomeTargetMetric = "demo_booked" | "code_merged" | "ticket_resolved" | "conversion_high";

export interface OutcomeRouterRequest {
  model?: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  routing_preferences?: {
    strategy?: OutcomeRoutingStrategy;
    target_metric?: OutcomeTargetMetric;
    max_cost_usd?: number;
    max_latency_ms?: number;
    speculative_mode?: boolean;
  };
}

export interface OutcomeRouterMetadata {
  modelUsed: string;
  provider: string;
  latencyMs: number;
  costUsd: number;
  savedUsd: number;
  winProbability: number;
  slaEscrowNonce: string;
}

export interface OutcomeRouterResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatCompletionMessage;
    finish_reason: "stop" | "length";
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cached_tokens_avoided: number;
  };
  _router_metadata: OutcomeRouterMetadata;
}
`;

  return new NextResponse(tsDefinitions, {
    status: 200,
    headers: {
      "Content-Type": "application/typescript; charset=utf-8",
      "Content-Disposition": 'attachment; filename="outcome-router.d.ts"'
    }
  });
}
