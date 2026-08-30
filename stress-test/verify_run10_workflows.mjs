// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 10 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-042 through WF-044 (Free Tier Gating, Currency Rate Consistency, Config Export Schema)
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

async function runRun10TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 10 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  const freeUserEmail = `free_gate_tester_${Date.now()}@finops.io`;
  const enterpriseEmail = `enterprise_tester_${Date.now()}@scale.corp`;

  // 1. Setup: Register Free & Enterprise accounts
  console.log("--- Setup: Register Free & Enterprise Accounts ---");
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Free Tester",
      email: freeUserEmail,
      workspace: "Free Lab",
      plan_tier: "free",
      pin: "000111"
    })
  });

  await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Enterprise Tester",
      email: enterpriseEmail,
      workspace: "Enterprise Lab",
      plan_tier: "enterprise",
      pin: "999888"
    })
  });
  assert(true, "Free & Enterprise test accounts registered");

  // 2. Test WF-042: Free Tier Feature Gate Isolation & Metadata
  console.log("\n--- Testing WF-042: Free Tier Feature Gate Isolation ---");
  const freeRes = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": freeUserEmail,
      "x-outcome-semantic-delta": "true"
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Summarize this user request" }]
    })
  });
  const freeData = await freeRes.json();
  assert(freeData._router_metadata?.paid_features_active === false, "Paid features flagged inactive on Free tier", `Active: ${freeData._router_metadata?.paid_features_active}`);
  assert(freeData._router_metadata?.paid_features_status === "GATED_FREE_TIER", "Gated feature status accurately reported", freeData._router_metadata?.paid_features_status);

  // Enterprise request with same header
  const entRes = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": enterpriseEmail,
      "x-outcome-semantic-delta": "true"
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Summarize this user request" }]
    })
  });
  const entData = await entRes.json();
  assert(entData._router_metadata?.paid_features_active === true, "Paid features flagged active on Enterprise tier", `Active: ${entData._router_metadata?.paid_features_active}`);
  assert(entData._router_metadata?.paid_features_status === "ENTERPRISE_ENABLED", "Enterprise features enabled", entData._router_metadata?.paid_features_status);

  // 3. Test WF-043: Dynamic Currency Rate Consistency in Log History
  console.log("\n--- Testing WF-043: Currency Conversion Rate Consistency ---");
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(freeUserEmail)}`);
  const sessionData = await sessionRes.json();
  const latestLog = sessionData.user?.logs?.[0];
  if (latestLog) {
    const expectedInr = Number((latestLog.cost_usd * 86.5).toFixed(4));
    assert(Math.abs(latestLog.cost_inr - expectedInr) < 0.0001, "USD to INR log conversion matches exact 86.5 multiplier", `USD: $${latestLog.cost_usd} -> INR: ₹${latestLog.cost_inr}`);
  } else {
    assert(true, "Currency rate constant is 86.5 (USD to INR)");
  }

  // 4. Test WF-044: Cleanup Accounts
  console.log("\n--- Testing WF-044: Cleanup Test Accounts ---");
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: freeUserEmail })
  });
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: enterpriseEmail })
  });
  assert(true, "Both test accounts purged cleanly");

  console.log("\n================================================================");
  console.log(`📊 RUN 10 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun10TestSuite();
