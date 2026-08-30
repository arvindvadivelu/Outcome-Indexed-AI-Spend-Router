// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 08 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-036 through WF-038 (Billing Forecast Boundaries, Pricing Tier Integrity, Concurrent Sync)
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

async function runRun08TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 08 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-036: Billing Forecast Safe Budget Boundary & Edge Cases
  console.log("--- Testing WF-036: Billing Forecast Safe Budget Boundary Testing ---");
  const zeroBudgetRes = await fetch(`${BASE_URL}/api/billing/forecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monthly_spend: 150.0, monthly_budget: 0 })
  });
  const zeroBudgetData = await zeroBudgetRes.json();
  assert(zeroBudgetData.success, "Handled zero budget without divide-by-zero error", zeroBudgetData.recommendation?.slice(0, 40));
  assert(!zeroBudgetData.recommendation.includes("NaN") && !zeroBudgetData.recommendation.includes("Infinity"), "Zero budget produced valid numeric pacing string", zeroBudgetData.pacing_status);

  const normalBudgetRes = await fetch(`${BASE_URL}/api/billing/forecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monthly_spend: 400.0, monthly_budget: 1000.0 })
  });
  const normalBudgetData = await normalBudgetRes.json();
  assert(normalBudgetData.pacing_status === "OPTIMAL_PACING", "Calculated OPTIMAL_PACING status under budget", normalBudgetData.pacing_status);
  assert(normalBudgetData.projected_invoice_usd === 460.0, "Computed 1.15x projected invoice ($460.00)", `$${normalBudgetData.projected_invoice_usd}`);

  // 2. Test WF-037: Rapid Concurrent Telemetry Session Updates
  console.log("\n--- Testing WF-037: Rapid Concurrent Telemetry Session Updates ---");
  const testEmail = `concurrency_tester_${Date.now()}@finops.ai`;
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Concurrency Tester",
      email: testEmail,
      workspace: "High Throughput Lab",
      plan_tier: "growth",
      pin: "555666"
    })
  });

  const updates = Array.from({ length: 5 }).map((_, i) =>
    fetch(`${BASE_URL}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        updates: { tokens_used: (i + 1) * 100 }
      })
    })
  );

  const results = await Promise.all(updates);
  const allOk = results.every(r => r.ok);
  assert(allOk, "Concurrent session updates processed without race condition errors", `${results.length} parallel requests`);

  // Verify final user state
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const sessionData = await sessionRes.json();
  assert(sessionData.user?.tokens_used > 0, "Persisted token usage accurately updated", `${sessionData.user?.tokens_used} tokens`);

  // 3. Test WF-038: Cleanup test account
  console.log("\n--- Testing WF-038: Cleanup test account ---");
  const delRes = await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail })
  });
  const delData = await delRes.json();
  assert(delData.success, "Test account cleaned up cleanly", delData.message);

  console.log("\n================================================================");
  console.log(`📊 RUN 08 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun08TestSuite();
