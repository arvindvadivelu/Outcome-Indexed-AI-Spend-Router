// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 16 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-060 through WF-063 (Logs Inspect, Connect, Delete, OTP Safe Body Parsing)
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

async function runRun16TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 16 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-060: Logs Inspect Safe Body & Trace Deconstruction
  console.log("--- Testing WF-060: Logs Inspect Safe Body Parsing ---");
  const inspectEmptyRes = await fetch(`${BASE_URL}/api/logs/inspect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  assert(inspectEmptyRes.status === 400, "Empty POST to logs inspect returns HTTP 400 (not 500)", `Status: ${inspectEmptyRes.status}`);

  const inspectValidRes = await fetch(`${BASE_URL}/api/logs/inspect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      log: {
        id: "req_test_inspect_01",
        model_used: "DeepSeek-V3",
        task_type: "code_generation",
        latency_ms: 64,
        cost_usd: 0.00042,
        outcome_metric: "syntax_valid_success"
      }
    })
  });
  const inspectData = await inspectValidRes.json();
  assert(inspectData.success === true, "Valid log trace deconstruction succeeded", `Steps: ${inspectData.analysisSteps?.length}`);
  assert(inspectData.analysisSteps && inspectData.analysisSteps.length === 4, "Deconstructed 4-stage audit trace", inspectData.analysisSteps[0]?.step);

  // 2. Test WF-061: Integrations Connect Safe Body Parsing
  console.log("\n--- Testing WF-061: Integrations Connect Safe Body Parsing ---");
  const connectEmptyRes = await fetch(`${BASE_URL}/api/integrations/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  assert(connectEmptyRes.status === 400, "Empty POST to integrations connect returns HTTP 400", `Status: ${connectEmptyRes.status}`);

  const connectValidRes = await fetch(`${BASE_URL}/api/integrations/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      integrationId: "deepseek",
      apiKey: "sk-ant-test-key-live-998877"
    })
  });
  const connectData = await connectValidRes.json();
  assert(connectData.success === true, "Connected upstream bridge credentials", connectData.message);
  assert(connectData.maskedKey && connectData.maskedKey.includes("••••••••"), "Key masked securely", connectData.maskedKey);

  // 3. Test WF-062: Delete Account Safe Body Parsing
  console.log("\n--- Testing WF-062: Delete Account Safe Body Parsing ---");
  const deleteEmptyRes = await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  assert(deleteEmptyRes.status === 400, "Empty POST to delete account returns HTTP 400", `Status: ${deleteEmptyRes.status}`);

  // 4. Test WF-063: Send OTP Safe Body Parsing
  console.log("\n--- Testing WF-063: Send OTP Safe Body Parsing ---");
  const otpEmptyRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  assert(otpEmptyRes.status === 400, "Empty POST to send OTP returns HTTP 400", `Status: ${otpEmptyRes.status}`);

  console.log("\n================================================================");
  console.log(`📊 RUN 16 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun16TestSuite();
