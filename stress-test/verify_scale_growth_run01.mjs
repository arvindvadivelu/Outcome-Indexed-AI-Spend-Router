// ==============================================================================
// 🛡️ CONTINUOUS SCALE & GROWTH ENGINE — RUN 01 TEST SUITE
// Tests: SEC-001 (Security Headers), SEC-002 (Rate Limiting), REL-001 (Health & Circuits)
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

async function runScaleRun01TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING SCALE & GROWTH ENGINE RUN 01 TEST SUITE");
  console.log("================================================================\n");

  // 1. Test SEC-001: Global Security Hardening Headers
  console.log("--- Testing SEC-001: Global OWASP Security Hardening Headers ---");
  const rootRes = await fetch(`${BASE_URL}/`);
  assert(rootRes.headers.get("x-frame-options") === "SAMEORIGIN", "X-Frame-Options set to SAMEORIGIN", rootRes.headers.get("x-frame-options"));
  assert(rootRes.headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options set to nosniff", rootRes.headers.get("x-content-type-options"));
  assert(rootRes.headers.get("referrer-policy") === "origin-when-cross-origin", "Referrer-Policy set to origin-when-cross-origin", rootRes.headers.get("referrer-policy"));
  assert(rootRes.headers.get("strict-transport-security")?.includes("max-age=63072000"), "HSTS preload header attached", rootRes.headers.get("strict-transport-security"));

  // 2. Test SEC-002: Sliding Window Rate Limiting & Telemetry Headers
  console.log("\n--- Testing SEC-002: Ingress API Sliding Window Rate Limiting ---");
  const apiRes = await fetch(`${BASE_URL}/api/logs/inspect?limit=5`);
  assert(apiRes.headers.has("x-ratelimit-limit"), "X-RateLimit-Limit header attached to API response", apiRes.headers.get("x-ratelimit-limit"));
  assert(apiRes.headers.has("x-ratelimit-remaining"), "X-RateLimit-Remaining header decremented", apiRes.headers.get("x-ratelimit-remaining"));
  assert(apiRes.headers.has("x-ratelimit-reset"), "X-RateLimit-Reset epoch header attached", apiRes.headers.get("x-ratelimit-reset"));

  // 3. Test REL-001: Production Health Check Endpoint
  console.log("\n--- Testing REL-001: Enterprise System Health & Diagnostics ---");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200, "GET /api/health returns HTTP 200 OK", `Status: ${healthRes.status}`);
  assert(healthData.status === "HEALTHY", "System overall status is HEALTHY", healthData.status);
  assert(healthData.services?.database_ledger?.status === "UP", "JSON Database ledger verified UP", healthData.services?.database_ledger?.status);
  assert(healthData.services?.circuit_breakers?.total === 5, "5 upstream provider circuit breakers registered", `Total: ${healthData.services?.circuit_breakers?.total}`);
  assert(typeof healthData.services?.memory?.heapUsedMb === "number", "Process memory telemetry reported", `${healthData.services?.memory?.heapUsedMb} MB heap used`);

  console.log("\n================================================================");
  console.log(`📊 RUN 01 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runScaleRun01TestSuite();
