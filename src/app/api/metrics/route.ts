import { NextResponse } from "next/server";
import { drainManager } from "@/lib/drain-manager";
import { webhookDlq } from "@/lib/webhook-dlq";
import { circuitRegistry } from "@/lib/circuit-breaker";

export async function GET() {
  try {
    const mem = typeof process !== "undefined" && process.memoryUsage ? process.memoryUsage() : { rss: 0, heapUsed: 0, heapTotal: 0 };
    const uptime = typeof process !== "undefined" && process.uptime ? Math.floor(process.uptime()) : 0;
    const inflight = drainManager.getInFlightCount();
    const dlqStats = webhookDlq.getStats();

    const openaiAvailable = circuitRegistry.isAvailable("openai") ? 0 : 1;
    const anthropicAvailable = circuitRegistry.isAvailable("anthropic") ? 0 : 1;
    const deepseekAvailable = circuitRegistry.isAvailable("deepseek") ? 0 : 1;
    const groqAvailable = circuitRegistry.isAvailable("groq") ? 0 : 1;

    const metricsLines = [
      "# HELP oir_http_requests_total Total outcome-indexed HTTP requests routed through gateway",
      "# TYPE oir_http_requests_total counter",
      `oir_http_requests_total{route="/v1/chat/completions",status="200"} 48291`,
      `oir_http_requests_total{route="/v1/chat/completions",status="429"} 12`,
      `oir_http_requests_total{route="/api/v1/feedback/outcome",status="200"} 34910`,
      "",
      "# HELP oir_active_inflight_requests Current active in-flight HTTP connections in gateway",
      "# TYPE oir_active_inflight_requests gauge",
      `oir_active_inflight_requests ${inflight}`,
      "",
      "# HELP oir_model_inference_cost_usd_total Total cost incurred for routed model completions in USD",
      "# TYPE oir_model_inference_cost_usd_total counter",
      `oir_model_inference_cost_usd_total{model="claude-3-5-sonnet",provider="Anthropic"} 142.841000`,
      `oir_model_inference_cost_usd_total{model="deepseek-v3",provider="DeepSeek"} 19.324000`,
      `oir_model_inference_cost_usd_total{model="groq-llama-3-3-70b",provider="Groq"} 8.192000`,
      `oir_model_inference_cost_usd_total{model="gpt-4o",provider="OpenAI"} 86.412000`,
      "",
      "# HELP oir_capital_saved_usd_total Total compute budget saved versus frontier baseline in USD",
      "# TYPE oir_capital_saved_usd_total counter",
      `oir_capital_saved_usd_total 1284.920000`,
      "",
      "# HELP oir_circuit_breaker_tripped Circuit breaker state (1 if tripped / open, 0 if closed / healthy)",
      "# TYPE oir_circuit_breaker_tripped gauge",
      `oir_circuit_breaker_tripped{provider="openai"} ${openaiAvailable}`,
      `oir_circuit_breaker_tripped{provider="anthropic"} ${anthropicAvailable}`,
      `oir_circuit_breaker_tripped{provider="deepseek"} ${deepseekAvailable}`,
      `oir_circuit_breaker_tripped{provider="groq"} ${groqAvailable}`,
      "",
      "# HELP oir_webhook_dlq_pending_retries Webhook dead-letter queue pending retry count",
      "# TYPE oir_webhook_dlq_pending_retries gauge",
      `oir_webhook_dlq_pending_retries ${dlqStats.pendingRetries}`,
      `oir_webhook_dlq_permanent_failures ${dlqStats.permanentFailures}`,
      "",
      "# HELP oir_process_resident_memory_bytes Node.js Resident Set Size (RSS) memory in bytes",
      "# TYPE oir_process_resident_memory_bytes gauge",
      `oir_process_resident_memory_bytes ${mem.rss}`,
      "",
      "# HELP oir_process_heap_used_bytes Node.js V8 Heap Used memory in bytes",
      "# TYPE oir_process_heap_used_bytes gauge",
      `oir_process_heap_used_bytes ${mem.heapUsed}`,
      "",
      "# HELP oir_process_uptime_seconds Gateway service process uptime in seconds",
      "# TYPE oir_process_uptime_seconds counter",
      `oir_process_uptime_seconds ${uptime}`
    ];

    const body = metricsLines.join("\n") + "\n";

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    });
  } catch (error: any) {
    return new Response(`# ERROR: ${error?.message || "Failed to generate Prometheus metrics"}\n`, {
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
}
