// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 13 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-051 through WF-053 (Team Invite Tokens, Strategy Parsing, Anomaly Edge Cases)
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

async function runRun13TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 13 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-051: Team Member Invite Token & Shareable Link Generation
  console.log("--- Testing WF-051: Team Member Invitation Deep Link ---");
  const inviteRes = await fetch(`${BASE_URL}/api/team/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "new_architect@enterprise.org",
      role: "Lead FinOps Architect",
      tokenQuota: "500,000 / mo"
    })
  });
  const inviteData = await inviteRes.json();
  assert(inviteData.success, "Invite generated successfully", inviteData.email);
  assert(inviteData.inviteLink && inviteData.inviteLink.includes("new_architect%40enterprise.org"), "Generated valid onboarding deep link", inviteData.inviteLink);
  assert(inviteData.invitationToken?.startsWith("inv_"), "Generated cryptographically unique invitation token", inviteData.invitationToken);

  // Empty invite body test
  const emptyInviteRes = await fetch(`${BASE_URL}/api/team/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  assert(emptyInviteRes.status === 400, "Empty invite body gracefully rejected with HTTP 400", `Status: ${emptyInviteRes.status}`);

  // 2. Test WF-052: Routing Synthesizer Empty Body & Strategy Extraction
  console.log("\n--- Testing WF-052: Routing Policy Synthesizer Robustness ---");
  const emptySynthRes = await fetch(`${BASE_URL}/api/routing/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  assert(emptySynthRes.status === 400, "Empty synthesize body gracefully rejected with HTTP 400", `Status: ${emptySynthRes.status}`);

  const codeSynthRes = await fetch(`${BASE_URL}/api/routing/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Route all Python and SQL PR reviews to DeepSeek Coder with < 200ms latency"
    })
  });
  const codeSynthData = await codeSynthRes.json();
  assert(codeSynthData.success, "Synthesized code review rule", codeSynthData.rule?.name);
  assert(codeSynthData.rule?.max_latency_ms === 200, "Extracted 200ms latency boundary constraint", `${codeSynthData.rule?.max_latency_ms}ms`);

  // 3. Test WF-053: Token Audit Anomaly Scanner with Empty & Populated Logs
  console.log("\n--- Testing WF-053: Token Anomaly Scanner Robustness ---");
  const emptyAuditRes = await fetch(`${BASE_URL}/api/analytics/token-audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logs: [] })
  });
  const emptyAuditData = await emptyAuditRes.json();
  assert(emptyAuditData.success, "Handled empty logs array in token audit scanner", `Wasted: ${emptyAuditData.total_wasted_tokens}`);
  assert(emptyAuditData.potential_compression_ratio === "60.3%", "Calculated baseline compression ratio", emptyAuditData.potential_compression_ratio);

  console.log("\n================================================================");
  console.log(`📊 RUN 13 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun13TestSuite();
