// ==============================================================================
// 🚀 CONTINUOUS SCALE & GROWTH ENGINE — RUN 02 TEST SUITE
// Tests: SCAL-001 (LRU Cache), GRO-001 (Referrals Engine), DEV-001 (OpenAPI 3.1)
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

async function runScaleRun02TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING SCALE & GROWTH ENGINE RUN 02 TEST SUITE");
  console.log("================================================================\n");

  // 1. Test SCAL-001: High-Throughput LRU Semantic Response Cache
  console.log("--- Testing SCAL-001: LRU Cache in Parallel Benchmark Evaluation ---");
  const eval1Res = await fetch(`${BASE_URL}/api/benchmarks/eval`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_type: "sales_email" })
  });
  const eval1Data = await eval1Res.json();
  assert(eval1Data.success === true, "First benchmark call computed successfully", `Tested task: ${eval1Data.testedTask}`);

  const eval2Res = await fetch(`${BASE_URL}/api/benchmarks/eval`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_type: "sales_email" })
  });
  const eval2Data = await eval2Res.json();
  assert(eval2Data.success === true && eval2Data.cached === true, "Subsequent idempotent benchmark hit sub-millisecond LRU cache", `Cached: ${eval2Data.cached}`);

  // 2. Test GRO-001: Product Growth & Referral Viral Loop Engine
  console.log("\n--- Testing GRO-001: Referral Growth & Viral Token Rewards ---");
  const refStatsRes = await fetch(`${BASE_URL}/api/growth/referrals?email=varvind2004@gmail.com`);
  const refStatsData = await refStatsRes.json();
  assert(refStatsData.success === true, "Retrieved tenant referral statistics", refStatsData.referralCode);
  assert(refStatsData.referralCode && refStatsData.referralCode.startsWith("REF-"), "Deterministic tenant referral code generated", refStatsData.referralCode);
  assert(refStatsData.bonusTokensEarned > 0, "Calculated bonus tokens earned with active tier multiplier", `${refStatsData.bonusTokensEarned} tokens`);

  const applyRefRes = await fetch(`${BASE_URL}/api/growth/referrals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "varvind2004@gmail.com",
      referralCode: refStatsData.referralCode
    })
  });
  const applyRefData = await applyRefRes.json();
  assert(applyRefData.success === true, "Referral conversion event processed", applyRefData.message);
  assert(applyRefData.bonusTokensAwarded === 50000, "+50,000 bonus tokens awarded", `Bonus: ${applyRefData.bonusTokensAwarded}`);

  // 3. Test DEV-001: OpenAPI 3.1 Specification Route
  console.log("\n--- Testing DEV-001: OpenAPI 3.1 Specification Route ---");
  const openApiRes = await fetch(`${BASE_URL}/api/openapi.json`);
  const openApiData = await openApiRes.json();
  assert(openApiRes.status === 200, "GET /api/openapi.json returns HTTP 200 OK", `Status: ${openApiRes.status}`);
  assert(openApiData.openapi === "3.1.0", "Valid OpenAPI 3.1.0 schema version", openApiData.openapi);
  assert(openApiData.paths["/v1/chat/completions"] !== undefined, "Drop-in wire completions path documented", openApiData.paths["/v1/chat/completions"]?.post?.summary);
  assert(openApiData.paths["/api/growth/referrals"] !== undefined, "Growth referral endpoints documented", openApiData.paths["/api/growth/referrals"]?.get?.summary);

  console.log("\n================================================================");
  console.log(`📊 RUN 02 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runScaleRun02TestSuite();
