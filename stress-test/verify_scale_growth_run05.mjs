// ==============================================================================
// 🚀 CONTINUOUS SCALE & GROWTH ENGINE — RUN 05 TEST SUITE
// Tests: SCAL-004 (Cluster Sync), SEC-005 (Entropy & Key Rotation),
//        GRO-004 (ROI Calculator), REL-004 (Chaos Simulator), DEV-004 (DPA Exporter)
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

async function runScaleRun05TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING SCALE & GROWTH ENGINE RUN 05 TEST SUITE");
  console.log("================================================================\n");

  // 1. Test SCAL-004: Redis Edge Multi-Region Cluster State Synchronizer
  console.log("--- Testing SCAL-004: Multi-Region Edge Cluster Synchronizer ---");
  const clusterRes = await fetch(`${BASE_URL}/api/analytics/cluster-sync`);
  const clusterData = await clusterRes.json();
  assert(clusterRes.status === 200, "GET /api/analytics/cluster-sync returns HTTP 200 OK", `Status: ${clusterRes.status}`);
  assert(clusterData.totalRegions === 3, "3 global edge regions active (us-east-1, eu-central-1, ap-southeast-1)", `Regions: ${clusterData.totalRegions}`);
  assert(clusterData.totalActiveBuckets > 0, "Active distributed edge buckets synced", `${clusterData.totalActiveBuckets} buckets`);

  const broadcastRes = await fetch(`${BASE_URL}/api/analytics/cluster-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKeyId: "key_compromised_test_123" })
  });
  const broadcastData = await broadcastRes.json();
  assert(broadcastData.success === true, "Key revocation broadcast synchronized across all edge nodes", broadcastData.message);

  // 2. Test SEC-005: API Key Entropy & Rotation Security Guard
  console.log("\n--- Testing SEC-005: Shannon Entropy & Key Rotation Guard ---");
  const rotationRes = await fetch(`${BASE_URL}/api/settings/api-keys/rotation-alert?email=varvind2004@gmail.com`);
  const rotationData = await rotationRes.json();
  assert(rotationRes.status === 200, "GET /api/settings/api-keys/rotation-alert returns HTTP 200 OK", `Status: ${rotationRes.status}`);
  assert(rotationData.totalKeysAudited > 0, "API keys audited for Shannon entropy score", `Keys: ${rotationData.totalKeysAudited}`);
  assert(typeof rotationData.keys?.[0]?.entropyScore === "number", "Computed exact Shannon entropy per character", `${rotationData.keys?.[0]?.entropyScore} bits/char`);

  // 3. Test GRO-004: Enterprise FinOps ROI & Savings Calculator
  console.log("\n--- Testing GRO-004: Enterprise FinOps ROI & Savings Calculator ---");
  const roiRes = await fetch(`${BASE_URL}/api/growth/roi-calculator`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      monthlyInferenceCalls: 1000000,
      averagePromptTokens: 800,
      averageCompletionTokens: 300
    })
  });
  const roiData = await roiRes.json();
  assert(roiRes.status === 200, "POST /api/growth/roi-calculator returns HTTP 200 OK", `Status: ${roiRes.status}`);
  assert(roiData.report?.annualSavingsUsd > 0, "Projected positive annual dollar savings", `$${roiData.report?.annualSavingsUsd}/year`);
  assert(roiData.report?.savingsPercentage > 20, "Calculated savings percentage exceeds 20%", `${roiData.report?.savingsPercentage}% cut`);
  assert(roiData.report?.projectedOutcomeSuccessRate > 90, "Maintained guaranteed outcome success rate", `${roiData.report?.projectedOutcomeSuccessRate}%`);

  // 4. Test REL-004: Synthetic Chaos Testing & Upstream Outage Simulator
  console.log("\n--- Testing REL-004: Synthetic Chaos Testing & Outage Simulator ---");
  const chaosRes = await fetch(`${BASE_URL}/api/routing/chaos-simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      targetProvider: "anthropic",
      faultType: "TIMEOUT_504"
    })
  });
  const chaosData = await chaosRes.json();
  assert(chaosRes.status === 200, "POST /api/routing/chaos-simulate returns HTTP 200 OK", `Status: ${chaosRes.status}`);
  assert(chaosData.result?.circuitBreakerTripped === true, "Circuit breaker tripped upon 504 timeout injection", `Tripped: ${chaosData.result?.circuitBreakerTripped}`);
  assert(chaosData.result?.fallbackEngaged === true, "Seamless Pareto fallback model engaged", `Fallback: ${chaosData.result?.fallbackModelUsed}`);
  assert(chaosData.result?.finalClientStatus === 200, "Client request succeeded with HTTP 200 after fallback", `Latency: ${chaosData.result?.totalRoundtripLatencyMs}ms`);

  // 5. Test DEV-004: Machine-Readable DPA Compliance Contract JSON Exporter
  console.log("\n--- Testing DEV-004: Compliance DPA Agreement Exporter ---");
  const dpaRes = await fetch(`${BASE_URL}/api/compliance/dpa-export?email=varvind2004@gmail.com`);
  const dpaData = await dpaRes.json();
  assert(dpaRes.status === 200, "GET /api/compliance/dpa-export returns HTTP 200 OK", `Status: ${dpaRes.status}`);
  assert(dpaData.dpaAgreement?.dataProtectionClauses?.zeroPromptRetention?.guaranteed === true, "Zero Prompt Retention guarantee certified in DPA", `Guaranteed: ${dpaData.dpaAgreement?.dataProtectionClauses?.zeroPromptRetention?.guaranteed}`);
  assert(dpaData.dpaAgreement?.dataProtectionClauses?.subprocessorRegistry?.length === 4, "4 frontier foundation subprocessors certified", `Subprocessors: ${dpaData.dpaAgreement?.dataProtectionClauses?.subprocessorRegistry?.length}`);

  console.log("\n================================================================");
  console.log(`📊 RUN 05 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runScaleRun05TestSuite();
