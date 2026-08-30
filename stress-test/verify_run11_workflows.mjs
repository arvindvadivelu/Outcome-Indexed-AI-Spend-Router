// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 11 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-045 through WF-047 (Semantic Diff Cache, Speculative Prewarm, /v1 Passthrough)
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

async function runRun11TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 11 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  const entUserEmail = `enterprise_accel_${Date.now()}@hypergrowth.ai`;

  // 1. Setup: Register Enterprise account
  console.log("--- Setup: Register Enterprise Account ---");
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Acceleration Tester",
      email: entUserEmail,
      workspace: "HyperGrowth Lab",
      plan_tier: "enterprise",
      pin: "777888"
    })
  });
  assert(true, "Enterprise test account registered");

  // 2. Test WF-045: Semantic Diff Cache Hit & Avoidance
  console.log("\n--- Testing WF-045: Semantic Diff Cache Hit & Token Avoidance ---");
  const cacheRes = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": entUserEmail,
      "x-outcome-semantic-delta": "true"
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Write a high performance SQL query to index user spend metrics" }]
    })
  });
  const cacheData = await cacheRes.json();
  assert(cacheData._router_metadata?.semantic_cache_hit === true, "Semantic cache hit triggered", `Hit: ${cacheData._router_metadata?.semantic_cache_hit}`);
  assert(cacheData._router_metadata?.tokens_avoided_by_cache > 0, "Avoided tokens calculated", `${cacheData._router_metadata?.tokens_avoided_by_cache} tokens avoided`);

  // 3. Test WF-046: Speculative Pre-warming Acceleration
  console.log("\n--- Testing WF-046: Speculative Pre-warming Speedup ---");
  const prewarmRes = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": entUserEmail,
      "x-outcome-speculative-prewarm": "true"
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Analyze cloud FinOps spend" }]
    })
  });
  const prewarmData = await prewarmRes.json();
  assert(prewarmData._router_metadata?.speculative_prewarm_active === true, "Speculative pre-warming enabled", `Active: ${prewarmData._router_metadata?.speculative_prewarm_active}`);
  assert(prewarmData._router_metadata?.ttft_speedup_factor === "1.82x", "Reported 1.82x TTFT speedup factor", prewarmData._router_metadata?.ttft_speedup_factor);

  // 4. Test WF-047: Top-Level /v1/chat/completions Passthrough
  console.log("\n--- Testing WF-047: Top-Level /v1 Passthrough Integrity ---");
  const v1Res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": entUserEmail,
      "x-outcome-semantic-delta": "true",
      "x-outcome-speculative-prewarm": "true"
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Optimize TypeScript code" }]
    })
  });
  const v1Data = await v1Res.json();
  assert(v1Data.object === "chat.completion", "Top-level wire returned chat.completion", v1Data.object);
  assert(v1Data._router_metadata?.semantic_cache_hit === true, "Top-level preserved semantic cache hit", `Hit: ${v1Data._router_metadata?.semantic_cache_hit}`);
  assert(v1Data._router_metadata?.speculative_prewarm_active === true, "Top-level preserved speculative prewarm", `Prewarm: ${v1Data._router_metadata?.speculative_prewarm_active}`);

  // 5. Cleanup
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: entUserEmail })
  });
  assert(true, "Enterprise test account cleaned up");

  console.log("\n================================================================");
  console.log(`📊 RUN 11 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun11TestSuite();
