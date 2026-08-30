// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 05 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-025 through WF-028 (Signup Prepopulation, Token Audit, Invoice Charset, RBAC)
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

async function runRun05TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 05 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  const testEmail = `invitee_${Date.now()}@finopslab.internal`;

  // 1. Test WF-025: Team Invite Link Redemption & Pre-populated Signup
  console.log("--- Testing WF-025: Team Invite Link Redemption & Pre-populated Registration ---");
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Invited Member",
      email: testEmail,
      workspace: "FinOps Enterprise Core",
      plan_tier: "enterprise",
      pin: "333444",
      currency: "INR"
    })
  });
  const regData = await regRes.json();
  assert(regData.success, "Invited user registered into target workspace", regData.user?.workspace);
  assert(regData.user?.monthly_token_quota === 2000000, "Enterprise token quota assigned", regData.user?.monthly_token_quota);

  // 2. Test WF-026: Token Anomaly Scanner & Prompt Compression Audit
  console.log("\n--- Testing WF-026: Token Anomaly Scanner API ---");
  const auditRes = await fetch(`${BASE_URL}/api/analytics/token-audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      logs: [
        { id: "log_1", prompt_preview: "System instruction: You are a support agent..." },
        { id: "log_2", prompt_preview: "System instruction: You are a support agent..." }
      ]
    })
  });
  const auditData = await auditRes.json();
  assert(auditData.success, "Token audit calculated compression metrics");
  assert(typeof auditData.total_wasted_tokens === "number", "Total wasted tokens computed", `${auditData.total_wasted_tokens} tokens`);
  assert(auditData.potential_compression_ratio === "60.3%", "Compression ratio matched 60.3%", auditData.potential_compression_ratio);
  assert(auditData.findings?.length === 3, "Audit returned 3 specific waste categories", `${auditData.findings?.length} categories`);

  // 3. Test WF-027: Multi-Currency Invoice Receipt Formatting
  console.log("\n--- Testing WF-027: Multi-Currency Invoice Pacing Calculation ---");
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const sessionData = await sessionRes.json();
  assert(sessionData.user?.currency === "INR", "Account currency restored as INR", sessionData.user?.currency);

  // 4. Test WF-028: Team RBAC Least-Privilege Compliance Audit
  console.log("\n--- Testing WF-028: Team RBAC Audit Evaluation ---");
  const rbacRes = await fetch(`${BASE_URL}/api/team/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      members: [
        { id: 1, name: "Owner", role: "Owner", mfaActive: true },
        { id: 2, name: "Engineer", role: "Engineer", mfaActive: true },
        { id: 3, name: "FinOps", role: "FinOps", mfaActive: true }
      ]
    })
  });
  const rbacData = await rbacRes.json();
  assert(rbacData.success, "RBAC audit calculated compliance grade", rbacData.complianceGrade);
  assert(rbacData.mfaEnrollmentRate === "100%", "MFA enrollment verified 100%", rbacData.mfaEnrollmentRate);
  assert(rbacData.findings?.length === 4, "RBAC audit verified 4 security criteria", `${rbacData.findings?.length} criteria`);

  // 5. Cleanup test account
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail })
  });

  console.log("\n================================================================");
  console.log(`📊 RUN 05 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun05TestSuite();
