// ==============================================================================
// 🚀 CONTINUOUS SCALE & GROWTH ENGINE — RUN 07 TEST SUITE
// Tests: SCAL-006 (Stream Compression), SEC-007 (IP Geofencing),
//        GRO-006 (Badge Notifications), REL-006 (Idempotency Deduplicator),
//        DEV-006 (Diagnostics Bundle Exporter)
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

async function runScaleRun07TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING SCALE & GROWTH ENGINE RUN 07 TEST SUITE");
  console.log("================================================================\n");

  // 1. Test SCAL-006: Edge Response Stream Chunk Compression
  console.log("--- Testing SCAL-006: Edge Response Stream Chunk Compression ---");
  const compressRes = await fetch(`${BASE_URL}/api/routing/stream-compress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payloadText: "Outcome-Indexed routing benchmark test text ".repeat(10) })
  });
  const compressData = await compressRes.json();
  assert(compressRes.status === 200, "POST /api/routing/stream-compress returns HTTP 200 OK", `Status: ${compressRes.status}`);
  assert(compressData.metrics?.compressionRatio < 1.0, "Stream buffer compressed with ratio < 1.0", `Ratio: ${compressData.metrics?.compressionRatio}`);
  assert(compressRes.headers.has("x-stream-compression-ratio"), "X-Stream-Compression-Ratio header attached", compressRes.headers.get("x-stream-compression-ratio"));

  // 2. Test SEC-007: Automated IP CIDR Geofencing & Proxy Guard
  console.log("\n--- Testing SEC-007: IP CIDR Geofencing & Malicious Proxy Guard ---");
  const cleanIpRes = await fetch(`${BASE_URL}/api/settings/security/ip-geofence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientIp: "10.0.15.22", allowedCidrs: ["10.0.0.0/16", "192.168.1.0/24"] })
  });
  const cleanIpData = await cleanIpRes.json();
  assert(cleanIpRes.status === 200 && cleanIpData.success === true, "Allowed enterprise subnet IP authorized", cleanIpData.evaluation?.matchedSubnet);

  const proxyIpRes = await fetch(`${BASE_URL}/api/settings/security/ip-geofence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientIp: "185.220.101.5", allowedCidrs: ["0.0.0.0/0"] })
  });
  const proxyIpData = await proxyIpRes.json();
  assert(proxyIpRes.status === 403 && proxyIpData.success === false, "Blocked known malicious proxy exit node with HTTP 403 Forbidden", proxyIpData.evaluation?.threatLevel);

  // 3. Test GRO-006: In-App Milestone Badge Notifications
  console.log("\n--- Testing GRO-006: In-App Milestone Badge Notification Engine ---");
  const badgeRes = await fetch(`${BASE_URL}/api/growth/badges?email=varvind2004@gmail.com`);
  const badgeData = await badgeRes.json();
  assert(badgeRes.status === 200, "GET /api/growth/badges returns HTTP 200 OK", `Status: ${badgeRes.status}`);
  assert(badgeData.badges?.length >= 3, "Captured milestone badge notifications", `Badges: ${badgeData.badges?.length}`);
  assert(badgeData.totalUnclaimedTokens === 50000, "+50,000 unclaimed referral tokens available for one-click claim", `${badgeData.totalUnclaimedTokens} tokens`);

  // 4. Test REL-006: In-Flight Idempotency Key Lock & Request Deduplicator
  console.log("\n--- Testing REL-006: In-Flight Idempotency Key Lock & Deduplicator ---");
  const testIdemKey = `idem_test_lock_${Date.now()}`;
  const firstExecRes = await fetch(`${BASE_URL}/api/routing/idempotent-dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idempotencyKey: testIdemKey, prompt: "Generate sales pitch" })
  });
  const firstExecData = await firstExecRes.json();
  assert(firstExecRes.status === 200 && firstExecData.idempotencyStatus === "PROCESSED", "Initial request processed and lock completed", firstExecData.data?.modelUsed);

  const secondExecRes = await fetch(`${BASE_URL}/api/routing/idempotent-dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idempotencyKey: testIdemKey, prompt: "Generate sales pitch" })
  });
  const secondExecData = await secondExecRes.json();
  assert(secondExecRes.status === 200 && secondExecData.idempotencyStatus === "CACHE_HIT", "Duplicate request served from idempotency ledger with zero re-computation", secondExecData.message);
  assert(secondExecRes.headers.get("x-idempotent-replay") === "true", "X-Idempotent-Replay header verified true", secondExecRes.headers.get("x-idempotent-replay"));

  // 5. Test DEV-006: Automated Diagnostics & Telemetry Report JSON Bundle Exporter
  console.log("\n--- Testing DEV-006: System Diagnostics & Telemetry Report Exporter ---");
  const diagRes = await fetch(`${BASE_URL}/api/diagnostics/export`);
  const diagData = await diagRes.json();
  assert(diagRes.status === 200, "GET /api/diagnostics/export returns HTTP 200 OK", `Status: ${diagRes.status}`);
  assert(diagData.bundle?.subsystems?.circuitBreakers?.length >= 5, "Diagnostics bundle captured all 5 circuit breaker statuses", `Total: ${diagData.bundle?.subsystems?.circuitBreakers?.length}`);
  assert(diagData.bundle?.subsystems?.edgeCluster?.totalRegions === 3, "Diagnostics bundle captured 3 active edge regions", `Regions: ${diagData.bundle?.subsystems?.edgeCluster?.totalRegions}`);

  console.log("\n================================================================");
  console.log(`📊 RUN 07 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runScaleRun07TestSuite();
