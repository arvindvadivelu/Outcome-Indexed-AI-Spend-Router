/**
 * Phase 10 Production Hardening Verification Suite
 * Tests PR-033 (Constant-Time API Key Timing Attack Defense),
 * PR-034 (High-Precision Latency Histogram & Percentiles),
 * PR-035 (Multi-Tenant Concurrency Semaphore Guard),
 * PR-036 (JSON Recursion Depth & Payload Bomb Shield)
 */

async function runPhase10Tests() {
  console.log("🚀 Starting Phase 10 Production Readiness Test Suite...");

  // Start Next.js server on port 3011 for live endpoint verification
  const { spawn } = await import("child_process");
  const server = spawn("npx", ["next", "start", "-p", "3011"], {
    stdio: "inherit",
    shell: true
  });

  // Wait for server boot
  await new Promise((resolve) => setTimeout(resolve, 4500));
  const BASE = "http://localhost:3011";

  let passedCount = 0;
  let totalCount = 0;

  async function test(name, fn) {
    totalCount++;
    try {
      const ok = await fn();
      if (ok) {
        console.log(`  ✓ [PASS] ${name}`);
        passedCount++;
      } else {
        console.error(`  ✗ [FAIL] ${name}`);
      }
    } catch (err) {
      console.error(`  ✗ [ERROR] ${name}:`, err.message);
    }
  }

  try {
    // 1. Live Server Test: Constant-Time Comparison
    await test("Constant-Time Key & Signature Comparison (constantTimeCompare)", async () => {
      const { constantTimeCompare, constantTimeKeyMatch } = await import("file:///" + process.cwd().replace(/\\/g, "/") + "/src/lib/constant-time-crypto.ts");
      const match = constantTimeCompare("oir_live_secret_key_12345", "oir_live_secret_key_12345");
      const mismatch = constantTimeCompare("oir_live_secret_key_12345", "oir_live_secret_key_99999");
      const emptyCheck = constantTimeCompare("", "oir_live_secret_key_12345");
      return match === true && mismatch === false && emptyCheck === false;
    });

    // 2. Live Server Test: Latency Histogram Percentiles
    await test("Latency Histogram & Tail Percentiles (GET & POST /api/analytics/latency-percentiles)", async () => {
      // Record a sample
      const postRes = await fetch(`${BASE}/api/analytics/latency-percentiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "deepseek", latencyMs: 72 })
      });
      const postData = await postRes.json();
      if (!postRes.ok || typeof postData.stats?.p90 !== "number") return false;

      // Query all percentiles
      const getRes = await fetch(`${BASE}/api/analytics/latency-percentiles`);
      const getData = await getRes.json();
      return (
        getRes.ok &&
        getData.success === true &&
        typeof getData.providerPercentiles?.groq?.p50 === "number" &&
        typeof getData.providerPercentiles?.openai?.jitterMs === "number"
      );
    });

    // 3. Live Server Test: Multi-Tenant Concurrency Semaphore Guard
    await test("Multi-Tenant Concurrency Semaphore (GET & POST /api/system/concurrency)", async () => {
      const tenant = `tenant_test_${Date.now()}`;

      // Acquire slot 1
      const acq1 = await fetch(`${BASE}/api/system/concurrency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acquire", tenantId: tenant, planTier: "free" })
      });
      const acqData1 = await acq1.json();
      if (!acq1.ok || !acqData1.releaseToken) return false;

      // Release slot 1
      const rel1 = await fetch(`${BASE}/api/system/concurrency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "release", tenantId: tenant, releaseToken: acqData1.releaseToken })
      });
      const relData1 = await rel1.json();
      return rel1.ok && relData1.success === true;
    });

    // 4. Live Server Test: JSON Recursion Depth & Payload Bomb Shield
    await test("JSON Recursion Depth Limit & Payload Guard (POST /api/routing/payload-check)", async () => {
      // Normal JSON payload
      const validRes = await fetch(`${BASE}/api/routing/payload-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: "hello" }] })
      });
      const validData = await validRes.json();
      if (!validRes.ok || validData.depthInspection?.isSafe !== true) return false;

      // Adversarial Nested JSON Bomb (>32 levels deep)
      let deepObj = { level: 0 };
      let current = deepObj;
      for (let i = 1; i <= 36; i++) {
        current.child = { level: i };
        current = current.child;
      }

      const bombRes = await fetch(`${BASE}/api/routing/payload-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deepObj)
      });
      const bombData = await bombRes.json();
      return bombRes.status === 400 && bombData.depthInspection?.status === "RECURSION_DEPTH_EXCEEDED";
    });

    console.log(`\n========================================`);
    console.log(`🎉 PHASE 10 VERIFICATION SUMMARY: ${passedCount}/${totalCount} Passed`);
    console.log(`========================================\n`);
  } finally {
    server.kill("SIGTERM");
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

runPhase10Tests();
