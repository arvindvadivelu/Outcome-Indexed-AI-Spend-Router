// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 09 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-039 through WF-041 (Telemetry Refresh, Policy Priority, Escrow Nonce)
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

async function runRun09TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 09 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  const testEmail = `dashboard_qa_${Date.now()}@finops.corp`;

  // 1. Test WF-039: User Registration & Session Telemetry Rehydration
  console.log("--- Testing WF-039: Dashboard Telemetry Rehydration ---");
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Dashboard QA Engineer",
      email: testEmail,
      workspace: "Dashboard FinOps Corp",
      plan_tier: "growth",
      pin: "123123"
    })
  });
  const regData = await regRes.json();
  assert(regData.success, "Test user registered", regData.user?.id);

  // Update session data
  await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      updates: {
        tokens_used: 12500,
        monthlySpendUSD: 0.8125,
        baselineSpendUSD: 6.50
      }
    })
  });

  // Rehydrate via GET session
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const sessionData = await sessionRes.json();
  assert(sessionData.user?.tokens_used === 12500, "Tokens used rehydrated accurately", `${sessionData.user?.tokens_used} tokens`);
  assert(sessionData.user?.avoidedSpendUSD > 0, "Avoided spend calculated from telemetry", `$${sessionData.user?.avoidedSpendUSD}`);

  // 2. Test WF-040: Synthesized Policy Priority & Model Ordering
  console.log("\n--- Testing WF-040: Synthesized Policy Priority & Model Ordering ---");
  const synthRes = await fetch(`${BASE_URL}/api/routing/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Route all customer support tickets under 100ms with sub-cent cost"
    })
  });
  const synthData = await synthRes.json();
  assert(synthData.success, "Policy synthesized from natural language", synthData.rule?.name);
  assert(synthData.rule?.task_type === "customer_support", "Matched customer_support domain", synthData.rule?.task_type);
  assert(synthData.rule?.priority_models?.includes("Groq Llama 3.3"), "Groq LPU ranked in top priority models", synthData.rule?.priority_models?.join(", "));

  // 3. Test WF-041: SLA Escrow Contract Nonce Validation
  console.log("\n--- Testing WF-041: Micro-SLA Cryptographic Nonce Calculation ---");
  const completionRes = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": testEmail
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Check database index performance" }]
    })
  });
  const completionData = await completionRes.json();
  const slaNonce = completionData._router_metadata?.sla_contract_nonce;
  assert(slaNonce && slaNonce.startsWith("0x"), "Generated cryptographic SLA contract nonce", slaNonce);
  assert(completionData._router_metadata?.sla_status === "SLA_COMPLIANT", "Verified SLA compliance against target threshold", completionData._router_metadata?.sla_status);

  // 4. Cleanup
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail })
  });

  console.log("\n================================================================");
  console.log(`📊 RUN 09 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun09TestSuite();
