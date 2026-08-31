// ==============================================================================
// 🚀 CONTINUOUS SCALE & GROWTH ENGINE — RUN 04 TEST SUITE
// Tests: SCAL-003 (Token Bucket), SEC-004 (Zod Validation), GRO-003 (Email Drips),
//        REL-003 (Anomaly Tripper), DEV-003 (SDK Generator)
// ==============================================================================

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message, detail = "") {
  if (condition) {
    console.log(`✅ [PASS] ${message}${detail ? ` — ${detail}` : ""}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function runScaleRun04TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING SCALE & GROWTH ENGINE RUN 04 TEST SUITE");
  console.log("================================================================\n");

  // 1. Test SCAL-003: Distributed Token Bucket Limiter & Telemetry
  console.log("--- Testing SCAL-003: Distributed Token Bucket Limiter ---");
  const rateLimitRes = await fetch(`${BASE_URL}/api/analytics/rate-limits?email=varvind2004@gmail.com`);
  const rateLimitData = await rateLimitRes.json();
  assert(rateLimitRes.status === 200, "GET /api/analytics/rate-limits returns HTTP 200 OK", `Status: ${rateLimitRes.status}`);
  assert(rateLimitData.success === true, "Token bucket rate limits reported", `Plan: ${rateLimitData.planTier}`);
  assert(rateLimitData.rateLimits?.burstCapacity > 0, "Burst capacity configured", `${rateLimitData.rateLimits?.burstCapacity} burst tokens`);
  assert(rateLimitData.rateLimits?.refillRatePerSec > 0, "Refill rate per second configured", `${rateLimitData.rateLimits?.refillRatePerSec} tokens/sec`);

  // 2. Test SEC-004: Strict Zod Input Validation & Schema Sanitization
  console.log("\n--- Testing SEC-004: Strict Zod Input Validation & Schema Sanitization ---");
  const validRuleRes = await fetch(`${BASE_URL}/api/routing/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "SDR Outreach Optimizer",
      target_task: "sales_email",
      max_cost_usd: 0.003,
      max_latency_ms: 250,
      priority_models: ["Claude 3.5 Sonnet", "DeepSeek-V3"]
    })
  });
  const validRuleData = await validRuleRes.json();
  assert(validRuleRes.status === 200 && validRuleData.success === true, "Valid routing rule passed strict schema validation", validRuleData.message);

  const invalidRuleRes = await fetch(`${BASE_URL}/api/routing/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "X", // too short
      target_task: "unsupported_task_xyz",
      max_cost_usd: -5.0
    })
  });
  const invalidRuleData = await invalidRuleRes.json();
  assert(invalidRuleRes.status === 422 && invalidRuleData.success === false, "Rejected invalid routing rule with HTTP 422 Unprocessable Entity", `Issues: ${invalidRuleData.issues?.length}`);

  // 3. Test GRO-003: Inactive Tenant Re-engagement & Email Drip Dispatcher
  console.log("\n--- Testing GRO-003: Re-engagement Drip Campaign Dispatcher ---");
  const dripRes = await fetch(`${BASE_URL}/api/growth/re-engage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "varvind2004@gmail.com" })
  });
  const dripData = await dripRes.json();
  assert(dripData.success === true, "Lifecycle drip campaign evaluated", `Trigger: ${dripData.campaign?.triggerReason}`);
  assert(dripData.campaign?.potentialMonthlySavingsUsd > 0, "Calculated monthly dollar savings recommendation", `$${dripData.campaign?.potentialMonthlySavingsUsd}/mo`);

  // 4. Test REL-003: Dynamic P99 Latency Anomaly Tripper
  console.log("\n--- Testing REL-003: Dynamic P99 Latency Anomaly Tripper ---");
  const anomalyRes = await fetch(`${BASE_URL}/api/routing/anomaly-status`);
  const anomalyData = await anomalyRes.json();
  assert(anomalyRes.status === 200, "GET /api/routing/anomaly-status returns HTTP 200 OK", `Health: ${anomalyData.systemRoutingHealth}`);
  assert(anomalyData.providers?.length >= 5, "5 upstream inference providers monitored for latency spikes", `Total: ${anomalyData.providers?.length}`);

  // 5. Test DEV-003: Dynamic SDK Code Generation Mock Generator
  console.log("\n--- Testing DEV-003: Dynamic Client SDK Snippet Generator ---");
  const sdkRes = await fetch(`${BASE_URL}/api/sdk/generate?email=varvind2004@gmail.com`);
  const sdkData = await sdkRes.json();
  assert(sdkData.success === true, "Generated tenant-tailored SDK snippets", `Tenant: ${sdkData.tenantEmail}`);
  assert(sdkData.snippets?.python?.includes("OutcomeRouterClient"), "Generated valid Python SDK client snippet");
  assert(sdkData.snippets?.typescript?.includes("OutcomeRouterClient"), "Generated valid TypeScript SDK client snippet");

  console.log("\n================================================================");
  console.log(`📊 RUN 04 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runScaleRun04TestSuite();
