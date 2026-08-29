/**
 * Real-Time Enterprise Workload Definitions & API Payload Generators
 */

export const REAL_TIME_ENGINEERING_PROMPTS = [
  "Refactor this TypeScript API route in Next.js to handle high concurrency with zero race conditions.",
  "Write an optimized PostgreSQL pgvector index query for cosine similarity with < 10ms latency.",
  "Review this GitHub pull request: Ensure memory leak safety in WebSocket connection pools.",
  "Debug Python FastAPI async worker timeout when parsing large multipart payloads.",
  "Generate a Rust FFI binding for SHA-256 micro-SLA cryptographic escrow nonce verification.",
  "Create an automated Docker compose configuration with Redis Sentinel and zero downtime rolling deploys."
];

export const REAL_TIME_SALES_PROMPTS = [
  "Draft a personalized cold outreach email to VP of Engineering at a fintech startup spending $40k/mo on OpenAI.",
  "Generate a concise 3-touch SDR follow-up email sequence addressing pricing objections for enterprise LLM gateway.",
  "Summarize key value propositions for AI FinOps margin recovery into 3 bullet points for a C-suite deck.",
  "Draft an email to schedule a 15-minute architecture demonstration for 50-engineer team."
];

export const REAL_TIME_SUPPORT_PROMPTS = [
  "How do I configure custom SLA latency thresholds in OutcomeRouter using X-Outcome-SLA-Threshold-Ms?",
  "User reported 401 Unauthorized error: Verify API key prefix format and active team seat assignment.",
  "Explain the difference between Thompson Sampling and simple round-robin LLM load balancing.",
  "How does the Micro-SLA auto-refund escrow guarantee zero failover loss when Anthropic returns 503?",
  "Can our team export CSV audit telemetry logs for SOC2 compliance?"
];

export const REAL_TIME_FINOPS_TASKS = [
  { action: "token_audit", path: "/api/analytics/token-audit" },
  { action: "logs_inspect", path: "/api/logs/inspect" },
  { action: "api_keys_audit", path: "/api/settings/api-keys/audit" },
  { action: "team_audit", path: "/api/team/audit" },
  { action: "billing_forecast", path: "/api/billing/forecast" },
  { action: "integrations_diagnostics", path: "/api/integrations/diagnostics" }
];
