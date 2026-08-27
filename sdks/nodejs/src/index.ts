export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface RoutePreferences {
  strategy?: "outcome_optimized" | "cost_minimum" | "latency_prioritized" | "balanced_pareto";
  max_latency_ms?: number;
  max_cost_usd?: number;
  target_metric?: string;
  task_type?: string;
  fallback_model?: string;
  enable_cache?: boolean;
  enable_compression?: boolean;
}

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  routing_preferences?: RoutePreferences;
  metadata?: Record<string, any>;
}

export interface RouterMetadata {
  requestId: string | null;
  modelUsed: string | null;
  costUsd: number;
  savedUsd: number;
  latencyMs: number;
  cached: boolean;
}

export interface ChatCompletionResult {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _routerMetadata: RouterMetadata;
}

export class OutcomeRouterClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config?: { apiKey?: string; baseUrl?: string }) {
    this.apiKey = config?.apiKey || (typeof process !== "undefined" ? process.env.OUTCOME_ROUTER_API_KEY || "oir_demo_key" : "oir_demo_key");
    this.baseUrl = config?.baseUrl || (typeof process !== "undefined" ? process.env.OUTCOME_ROUTER_BASE_URL || "http://localhost:8000/api/v1" : "http://localhost:8000/api/v1");
  }

  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const payload = {
      model: options.model || "auto",
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1000,
      stream: options.stream ?? false,
      routing_preferences: options.routing_preferences || { strategy: "outcome_optimized" },
      metadata: options.metadata || {}
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        "User-Agent": "outcome-router-node/1.0.0"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Outcome Router API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const metadata: RouterMetadata = {
      requestId: response.headers.get("X-Outcome-Request-Id"),
      modelUsed: response.headers.get("X-Outcome-Router-Model"),
      costUsd: parseFloat(response.headers.get("X-Outcome-Router-Cost-USD") || "0.0"),
      savedUsd: parseFloat(response.headers.get("X-Outcome-Router-Saved-USD") || "0.0"),
      latencyMs: parseInt(response.headers.get("X-Outcome-Router-Latency-MS") || "0", 10),
      cached: response.headers.get("X-Outcome-Router-Cached") === "true"
    };

    return {
      ...data,
      _routerMetadata: metadata
    };
  }

  async recordOutcome(params: {
    requestId: string;
    outcomeSuccess: boolean;
    metricName?: string;
    revenueImpactUsd?: number;
  }): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/outcomes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        request_id: params.requestId,
        outcome_success: params.outcomeSuccess,
        metric_name: params.metricName || "conversion",
        revenue_impact_usd: params.revenueImpactUsd || 0.0
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to record outcome: ${response.statusText}`);
    }

    return response.json();
  }
}
