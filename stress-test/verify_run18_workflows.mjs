// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 18 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-067 through WF-069 (Billing Forecast Grammar, Team Invite Roles, Security IP Audit)
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

async function runRun18TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 18 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-067: Billing Forecast Pacing Messages
  console.log("--- Testing WF-067: Billing Forecast Recommendation Messages ---");
  const underBudgetRes = await fetch(`${BASE_URL}/api/billing/forecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monthly_spend: 600, monthly_budget: 1500 })
  });
  const underData = await underBudgetRes.json();
  assert(underData.pacing_status === "OPTIMAL_PACING", "Under-budget returns OPTIMAL_PACING", underData.pacing_status);
  assert(underData.recommendation.includes("within your monthly budget ceiling"), "Under-budget recommendation correctly structured", underData.recommendation);

  const overBudgetRes = await fetch(`${BASE_URL}/api/billing/forecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monthly_spend: 2000, monthly_budget: 1500 })
  });
  const overData = await overBudgetRes.json();
  assert(overData.pacing_status === "OVER_BUDGET_WARNING", "Over-budget returns OVER_BUDGET_WARNING", overData.pacing_status);
  assert(overData.recommendation.includes("exceeding budget ceiling by 33%"), "Over-budget recommendation calculates exact overshoot percentage", overData.recommendation);

  // 2. Test WF-068: Team Invitation with Custom Roles
  console.log("\n--- Testing WF-068: Team Invitation with Custom Roles ---");
  const inviteRes = await fetch(`${BASE_URL}/api/team/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "architect@quantumaistudios.com",
      role: "Principal AI Infrastructure Architect",
      tokenQuota: "500,000 / mo"
    })
  });
  const inviteData = await inviteRes.json();
  assert(inviteData.success === true, "Custom role invitation generated", inviteData.message);
  assert(inviteData.inviteLink && inviteData.inviteLink.includes("role=Principal%20AI%20Infrastructure%20Architect"), "Shareable invite link preserves custom role encoding", inviteData.inviteLink);

  // 3. Test WF-069: API Key IP Restriction Compliance
  console.log("\n--- Testing WF-069: API Key IP Restriction & Wildcard Compliance ---");
  const auditRes = await fetch(`${BASE_URL}/api/settings/api-keys/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keys: [
        { name: "Live Prod Router", ip_restrictions: "192.168.1.0/24", last_used_at: "2 min ago" },
        { name: "Backup Gateway", ip_restrictions: "10.0.0.0/16", last_used_at: "1 hour ago" }
      ]
    })
  });
  const auditData = await auditRes.json();
  assert(auditData.securityScore.includes("A+"), "Restricted IP keys achieve A+ compliance score", auditData.securityScore);
  assert(auditData.leakRisk === "ZERO_DETECTED", "Zero credential leak confirmed", auditData.leakRisk);

  console.log("\n================================================================");
  console.log(`📊 RUN 18 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun18TestSuite();
