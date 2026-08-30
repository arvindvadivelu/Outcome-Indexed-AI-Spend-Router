// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 06 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-029 through WF-032 (Forgot Password OTP, Integrations Diagnostics & Connect, Dry-Run Engine)
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

async function runRun06TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 06 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  const testEmail = `recovery_${Date.now()}@outcomerouter.ai`;

  // 1. Setup user for recovery flow
  console.log("--- Setup: Register user for OTP recovery ---");
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Recovery Tester",
      email: testEmail,
      workspace: "Recovery QA Lab",
      plan_tier: "growth",
      pin: "999888"
    })
  });
  const regData = await regRes.json();
  assert(regData.success, "Test user registered", regData.user?.id);

  // 2. Test WF-029: Forgot Password OTP Dispatch & Verification
  console.log("\n--- Testing WF-029: Forgot Password OTP Dispatch & Verification ---");
  const sendOtpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail })
  });
  const sendOtpData = await sendOtpRes.json();
  assert(sendOtpData.success, "OTP dispatched successfully", `Code: ${sendOtpData.otp}`);
  assert(typeof sendOtpData.otp === "string" && sendOtpData.otp.length === 6, "Generated 6-digit OTP code", sendOtpData.otp);

  const verifyOtpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, otp: sendOtpData.otp })
  });
  const verifyOtpData = await verifyOtpRes.json();
  assert(verifyOtpData.success, "OTP verified successfully for recovery", verifyOtpData.user?.name);

  // 3. Test WF-030: Integrations Edge Diagnostics Ping
  console.log("\n--- Testing WF-030: Integrations Edge Diagnostics Ping ---");
  const diagRes = await fetch(`${BASE_URL}/api/integrations/diagnostics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  const diagData = await diagRes.json();
  assert(diagData.success, "Integrations diagnostics ping returned success");
  assert(diagData.bridges?.length === 7, "Evaluated 7 edge bridges and proxies", `${diagData.bridges?.length} bridges`);
  assert(typeof diagData.avgPingMs === "number" && diagData.avgPingMs > 0, "Average wire latency calculated", `${diagData.avgPingMs}ms`);

  // 4. Test WF-031: Integrations Provider Credential Encrypted Connection
  console.log("\n--- Testing WF-031: Provider Credential Encrypted Connection ---");
  const connectRes = await fetch(`${BASE_URL}/api/integrations/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      integrationId: "langchain",
      apiKey: "sk-ant-api03-live-test-mock-key-12345"
    })
  });
  const connectData = await connectRes.json();
  assert(connectData.success, "Provider credentials encrypted and connected", connectData.integrationId);
  assert(connectData.maskedKey?.includes("••••"), "API key masked for security", connectData.maskedKey);

  // 5. Test WF-032: Routing Engine Dry-Run Simulation
  console.log("\n--- Testing WF-032: Routing Engine Dry-Run Simulation ---");
  const dryRunRes = await fetch(`${BASE_URL}/api/routing/dry-run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Refactor this SQL query with index optimization in PostgreSQL",
      rules: [
        {
          id: "rule_code_1",
          name: "DeepSeek Code Policy",
          task_type: "code_generation",
          condition_pattern: "code_generation",
          priority_models: ["DeepSeek Coder V2", "Claude 3.5 Sonnet"],
          fallback_model: "GPT-4o",
          target_metric: "code_merged",
          is_active: true
        }
      ]
    })
  });
  const dryRunData = await dryRunRes.json();
  assert(dryRunData.success, "Dry-run routing evaluation executed successfully");
  assert(dryRunData.primaryModel === "DeepSeek Coder V2", "Selected DeepSeek Coder V2 as primary model", dryRunData.primaryModel);
  assert(dryRunData.savedCostUSD > 0 && typeof dryRunData.estimatedSavingsPct === "string", "Calculated estimated cost savings percentage", dryRunData.estimatedSavingsPct);

  // 6. Cleanup test account
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail })
  });

  console.log("\n================================================================");
  console.log(`📊 RUN 06 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun06TestSuite();
