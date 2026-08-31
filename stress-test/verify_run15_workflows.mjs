// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 15 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-057 through WF-059 (Configuration Backup, Webhook Signatures, Diagnostics)
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

async function runRun15TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 15 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-057: Complete Session & Subsystem Backup Schema
  console.log("--- Testing WF-057: Configuration Backup Schema ---");
  const testEmail = `backup_tester_${Date.now()}@finops.net`;
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Backup Lead",
      email: testEmail,
      workspace: "Apex Quantum AI Lab",
      plan_tier: "growth",
      pin: "445566"
    })
  });

  const sessionRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const sessionData = await sessionRes.json();
  assert(sessionData.success, "Session fetched for backup test", sessionData.user?.email);
  assert(sessionData.user?.workspace === "Apex Quantum AI Lab", "Workspace matches registration", sessionData.user?.workspace);
  assert(Array.isArray(sessionData.user?.apiKeys), "API keys array included in backup state", `Keys: ${sessionData.user?.apiKeys?.length}`);

  // 2. Test WF-058: Webhook Event Dispatch with HMAC Signing
  console.log("\n--- Testing WF-058: Webhook Dispatch & Security Signatures ---");
  const dispatchRes = await fetch(`${BASE_URL}/api/webhooks/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpointUrl: "https://api.enterprise.io/v1/router-events",
      secretKey: "whsec_test_secret_key_888999",
      eventType: "sla.breach.refunded",
      payload: {
        requestId: "req_test_888",
        breachedLatencyMs: 380,
        refundUsd: 0.0052
      }
    })
  });
  const dispatchData = await dispatchRes.json();
  assert(dispatchData.success, "Webhook event dispatched successfully", dispatchData.event_payload?.event);
  assert(dispatchData.signature_header && dispatchData.signature_header.includes("v1="), "Generated valid HMAC SHA-256 signature header", dispatchData.signature_header);
  assert(dispatchData.signature_verified === true, "Cryptographic signature verified", `HTTP ${dispatchData.http_status}`);

  // 3. Test WF-059: Integrations Diagnostic & Connected Provider State
  console.log("\n--- Testing WF-059: Provider Diagnostics Connectivity ---");
  const diagRes = await fetch(`${BASE_URL}/api/integrations/diagnostics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  const diagData = await diagRes.json();
  assert(diagData.success, "Integrations diagnostic completed successfully", `Avg: ${diagData.avgPingMs}ms`);
  assert(diagData.healthyCount >= 7, "Frontier bridges online and responsive", `Healthy: ${diagData.healthyCount} / ${diagData.totalBridges}`);

  // Clean up
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail })
  });

  console.log("\n================================================================");
  console.log(`📊 RUN 15 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun15TestSuite();
