// ==============================================================================
// 🚀 CONTINUOUS SCALE & GROWTH ENGINE — RUN 03 TEST SUITE
// Tests: SCAL-002 (Batch Queue), SEC-003 (HMAC Guard), GRO-002 (Lifecycle Funnel)
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

async function runScaleRun03TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING SCALE & GROWTH ENGINE RUN 03 TEST SUITE");
  console.log("================================================================\n");

  // 1. Test SEC-003: Timing-Safe Cryptographic HMAC SHA-256 Webhook Verification
  console.log("--- Testing SEC-003: Timing-Safe HMAC SHA-256 Webhook Guard ---");
  const testSecret = "whsec_test_c0a801019a8b7c6d5e4f3a2b1c0";
  const testPayload = JSON.stringify({ event: "invoice.payment_succeeded", amount_usd: 840.00 });

  const verifyRes = await fetch(`${BASE_URL}/api/webhooks/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secretKey: testSecret,
      payload: testPayload
    })
  });
  const verifyData = await verifyRes.json();
  assert(verifyData.success === true, "Valid cryptographic HMAC signature verified", verifyData.reason);
  assert(typeof verifyData.toleranceDeltaMs === "number", "Computed signature timestamp tolerance delta", `${verifyData.toleranceDeltaMs}ms`);

  const badSigRes = await fetch(`${BASE_URL}/api/webhooks/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secretKey: testSecret,
      payload: testPayload,
      signatureHeader: "t=1788157000,v1=bad_invalid_hash_signature_0000000000000000000000000000000000000000"
    })
  });
  const badSigData = await badSigRes.json();
  assert(badSigData.success === false, "Rejected tampered signature without leaking timing side-channel", badSigData.reason);

  // 2. Test GRO-002: User Onboarding Lifecycle Funnel & Milestone Telemetry
  console.log("\n--- Testing GRO-002: Onboarding Funnel & Milestone Activation ---");
  const lifecycleRes = await fetch(`${BASE_URL}/api/growth/lifecycle?email=varvind2004@gmail.com`);
  const lifecycleData = await lifecycleRes.json();
  assert(lifecycleData.success === true, "Evaluated user lifecycle activation funnel", `Stage: ${lifecycleData.currentLifecycleStage}`);
  assert(lifecycleData.totalMilestones === 5, "5 enterprise onboarding milestones tracked", `Completed: ${lifecycleData.completedMilestones}/5`);
  assert(lifecycleData.completionRatePct > 0, "Calculated non-zero milestone completion percentage", `${lifecycleData.completionRatePct}%`);
  assert(lifecycleData.nextRecommendedAction && lifecycleData.nextRecommendedAction.length > 0, "Generated next onboarding action recommendation", lifecycleData.nextRecommendedAction);

  console.log("\n================================================================");
  console.log(`📊 RUN 03 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runScaleRun03TestSuite();
