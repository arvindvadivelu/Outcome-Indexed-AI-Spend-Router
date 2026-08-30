// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 12 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-048 through WF-050 (Empty Body Parsing, Validation Clarity, Route Integrity)
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

async function runRun12TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 12 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-048: Empty Payload Resilience on Auth Routes
  console.log("--- Testing WF-048: Empty Payload Resilience ---");
  const emptyRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  const emptyRegData = await emptyRegRes.json();
  assert(emptyRegRes.status === 400, "Register returned HTTP 400 on empty body", `Status: ${emptyRegRes.status}`);
  assert(!emptyRegData.success && emptyRegData.error.includes("required"), "Returned clear required fields error", emptyRegData.error);

  const emptyPinRes = await fetch(`${BASE_URL}/api/auth/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  const emptyPinData = await emptyPinRes.json();
  assert(emptyPinRes.status === 400, "Verify PIN returned HTTP 400 on empty body", `Status: ${emptyPinRes.status}`);

  const emptyOtpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  const emptyOtpData = await emptyOtpRes.json();
  assert(emptyOtpRes.status === 400, "Verify OTP returned HTTP 400 on empty body", `Status: ${emptyOtpRes.status}`);

  // 2. Test WF-049: Invalid PIN Error Handling
  console.log("\n--- Testing WF-049: Invalid PIN Error Handling ---");
  const testEmail = `error_tester_${Date.now()}@finops.net`;
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Error Tester",
      email: testEmail,
      workspace: "Error Lab",
      plan_tier: "starter",
      pin: "123456"
    })
  });

  const wrongPinRes = await fetch(`${BASE_URL}/api/auth/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, pin: "999999" })
  });
  const wrongPinData = await wrongPinRes.json();
  assert(wrongPinRes.status === 401 || !wrongPinData.success, "Rejected incorrect PIN", wrongPinData.error);

  // 3. Test WF-050: Public Route Content & Compliance Page Integrity
  console.log("\n--- Testing WF-050: Public Route Content Integrity ---");
  const privacyRes = await fetch(`${BASE_URL}/privacy`);
  assert(privacyRes.ok, "Privacy page accessible (HTTP 200)", `Status: ${privacyRes.status}`);

  const termsRes = await fetch(`${BASE_URL}/terms`);
  assert(termsRes.ok, "Terms page accessible (HTTP 200)", `Status: ${termsRes.status}`);

  const dpaRes = await fetch(`${BASE_URL}/dpa`);
  assert(dpaRes.ok, "DPA page accessible (HTTP 200)", `Status: ${dpaRes.status}`);

  // Cleanup
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail })
  });

  console.log("\n================================================================");
  console.log(`📊 RUN 12 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun12TestSuite();
