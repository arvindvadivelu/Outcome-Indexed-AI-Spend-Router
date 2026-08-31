// ==============================================================================
// 🚀 CONTINUOUS SCALE & GROWTH ENGINE — RUN 06 TEST SUITE
// Tests: SCAL-005 (Worker Pool), SEC-006 (mTLS Guard), REL-005 (Retry Orchestrator),
//        DEV-005 (TypeScript Types Exporter)
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

async function runScaleRun06TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING SCALE & GROWTH ENGINE RUN 06 TEST SUITE");
  console.log("================================================================\n");

  // 1. Test SCAL-005: Adaptive Async Worker Pool & Concurrency Engine
  console.log("--- Testing SCAL-005: Adaptive Worker Thread Pool ---");
  const poolStatsRes = await fetch(`${BASE_URL}/api/analytics/worker-pool`);
  const poolStatsData = await poolStatsRes.json();
  assert(poolStatsRes.status === 200, "GET /api/analytics/worker-pool returns HTTP 200 OK", `Status: ${poolStatsRes.status}`);
  assert(poolStatsData.workerPool?.maxConcurrency === 8, "Worker pool initialized with 8 max concurrency slots", `Slots: ${poolStatsData.workerPool?.maxConcurrency}`);

  const submitJobRes = await fetch(`${BASE_URL}/api/analytics/worker-pool`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskType: "batch_eval",
      payload: { modelsCount: 5, domain: "sales_email" },
      priority: "high"
    })
  });
  const submitJobData = await submitJobRes.json();
  assert(submitJobData.success === true, "Asynchronous high-priority job submitted", submitJobData.job?.id);
  assert(submitJobData.job?.priority === "high", "Job priority assigned correctly", submitJobData.job?.priority);

  // 2. Test SEC-006: Dynamic Mutual TLS (mTLS) Client Certificate Guard
  console.log("\n--- Testing SEC-006: Enterprise Mutual TLS (mTLS) Guard ---");
  const sampleCertPem = `-----BEGIN CERTIFICATE-----
MIICljCCAX4CCQDKl6l4r/2i2jANBgkqhkiG9w0BAQsFADANMQswCQYDVQQGEwJV
UzELMAkGA1UECBMCR0ExCzAJBgNVBAcTAkFUTDELMAkGA1UEChMCVFMxCzAJBgNV
-----END CERTIFICATE-----`;

  const mtlsRes = await fetch(`${BASE_URL}/api/settings/security/mtls-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientCertificatePem: sampleCertPem })
  });
  const mtlsData = await mtlsRes.json();
  assert(mtlsRes.status === 200 && mtlsData.success === true, "Mutual TLS client certificate verified", mtlsData.certificate?.subjectCN);
  assert(mtlsData.certificate?.isValidVpcClient === true, "Zero-trust VPC client identity verified", mtlsData.certificate?.issuerDN);

  // 3. Test REL-005: Exponential Backoff & Full Jitter Retry Orchestrator
  console.log("\n--- Testing REL-005: Full Jitter Retry Orchestrator ---");
  const retryRes = await fetch(`${BASE_URL}/api/routing/retry-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ failAttemptsCount: 2 })
  });
  const retryData = await retryRes.json();
  assert(retryRes.status === 200 && retryData.success === true, "Recovered after 2 simulated 503 errors via jitter backoff", `Attempts: ${retryData.attemptsTotal}`);
  assert(retryData.traces?.length === 3, "Captured complete 3-attempt execution trace", `Traces: ${retryData.traces?.length}`);
  assert(retryData.totalBackoffMs >= 0, "Calculated total jitter backoff delay", `${retryData.totalBackoffMs}ms`);

  // 4. Test DEV-005: Automated OpenAPI to TypeScript Type Definition Exporter
  console.log("\n--- Testing DEV-005: TypeScript Type Definition Exporter ---");
  const typesRes = await fetch(`${BASE_URL}/api/types/export`);
  const typesText = await typesRes.text();
  assert(typesRes.status === 200, "GET /api/types/export returns HTTP 200 OK", `Status: ${typesRes.status}`);
  assert(typesText.includes("export interface OutcomeRouterResponse"), "Exported strictly-typed OutcomeRouterResponse interface");
  assert(typesText.includes("export interface OutcomeRouterMetadata"), "Exported OutcomeRouterMetadata interface");

  console.log("\n================================================================");
  console.log(`📊 RUN 06 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runScaleRun06TestSuite();
