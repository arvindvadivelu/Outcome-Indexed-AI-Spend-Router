/**
 * Phase 8 Production Hardening Verification Suite
 * Tests PR-025 (Rate Limit Jitter & Stampede Mitigation),
 * PR-026 (Distributed Atomic Mutex Lock),
 * PR-027 (Enterprise Content Security Policy),
 * PR-028 (Idempotency Key Deduplication & Integrity Mismatch Guard)
 */

async function runPhase8Tests() {
  console.log("🚀 Starting Phase 8 Production Readiness Test Suite...");

  // Start Next.js server on port 3009 for live endpoint verification
  const { spawn } = await import("child_process");
  const server = spawn("npx", ["next", "start", "-p", "3009"], {
    stdio: "inherit",
    shell: true
  });

  // Wait for server boot
  await new Promise((resolve) => setTimeout(resolve, 4500));
  const BASE = "http://localhost:3009";

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
    // 1. Live Server Test: Rate Limit Jitter & Anti-Stampede Metrics
    await test("Rate Limiter Stampede Jitter & Smoothing (GET /api/routing/rate-limit-stats)", async () => {
      const res = await fetch(`${BASE}/api/routing/rate-limit-stats?identifier=test_cluster_node_1&tier=growth`);
      const data = await res.json();
      return (
        res.status === 200 &&
        data.success === true &&
        typeof data.slidingWindow?.jitterAppliedMs === "number" &&
        typeof data.tokenBucket?.jitterAppliedSec === "number" &&
        data.antiStampedeStatus === "JITTER_SMOOTHING_ACTIVE"
      );
    });

    // 2. Live Server Test: Distributed Atomic Mutex Lock
    await test("Distributed Atomic Lock Engine (GET & POST /api/system/lock-status)", async () => {
      // Step A: Acquire lock
      const acqRes = await fetch(`${BASE}/api/system/lock-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "acquire",
          resourceKey: "res_test_backup",
          ttlMs: 5000,
          holderId: "worker_unit_test"
        })
      });
      const acqData = await acqRes.json();
      if (!acqRes.ok || !acqData.lockToken) return false;

      // Step B: Secondary conflicting acquire should fail (409)
      const conflictRes = await fetch(`${BASE}/api/system/lock-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "acquire",
          resourceKey: "res_test_backup",
          ttlMs: 5000,
          holderId: "worker_conflicting"
        })
      });
      if (conflictRes.status !== 409) return false;

      // Step C: Release lock
      const relRes = await fetch(`${BASE}/api/system/lock-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "release",
          resourceKey: "res_test_backup",
          lockToken: acqData.lockToken
        })
      });
      const relData = await relRes.json();
      return relRes.ok && relData.success === true && relData.released === true;
    });

    // 3. Live Server Test: Enterprise Content Security Policy (CSP)
    await test("Enterprise Content-Security-Policy & CORS Options (GET & OPTIONS /api/health)", async () => {
      const getRes = await fetch(`${BASE}/api/health`);
      const cspHeader = getRes.headers.get("content-security-policy");
      const hstsHeader = getRes.headers.get("strict-transport-security");

      const optRes = await fetch(`${BASE}/v1/chat/completions`, { method: "OPTIONS" });
      const allowHeaders = optRes.headers.get("access-control-allow-headers") || "";

      return (
        cspHeader !== null &&
        cspHeader.includes("default-src 'self'") &&
        cspHeader.includes("object-src 'none'") &&
        hstsHeader !== null &&
        allowHeaders.includes("Idempotency-Key")
      );
    });

    // 4. Live Server Test: Idempotency Key Deduplication & Payload Mismatch Guard
    await test("Idempotency Key Replay & Payload Integrity Guard (POST /api/routing/idempotent-dispatch)", async () => {
      const idemKey = `idem_test_${Date.now()}`;

      // Request 1: Initial execution
      const res1 = await fetch(`${BASE}/api/routing/idempotent-dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey: idemKey, prompt: "Calculate ROI" })
      });
      const data1 = await res1.json();
      if (!res1.ok || data1.idempotencyStatus !== "PROCESSED") return false;

      // Request 2: Duplicate exact replay (should return CACHE_HIT)
      const res2 = await fetch(`${BASE}/api/routing/idempotent-dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey: idemKey, prompt: "Calculate ROI" })
      });
      const data2 = await res2.json();
      if (!res2.ok || data2.idempotencyStatus !== "CACHE_HIT" || res2.headers.get("x-idempotent-replay") !== "true") return false;

      // Request 3: Reused idempotency key with modified payload (should return 422 PAYLOAD_MISMATCH)
      const res3 = await fetch(`${BASE}/api/routing/idempotent-dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey: idemKey, prompt: "DIFFERENT PROMPT PAYLOAD" })
      });
      const data3 = await res3.json();
      return res3.status === 422 && data3.idempotencyStatus === "PAYLOAD_MISMATCH";
    });

    console.log(`\n========================================`);
    console.log(`🎉 PHASE 8 VERIFICATION SUMMARY: ${passedCount}/${totalCount} Passed`);
    console.log(`========================================\n`);
  } finally {
    server.kill("SIGTERM");
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

runPhase8Tests();
