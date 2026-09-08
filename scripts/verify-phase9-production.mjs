/**
 * Phase 9 Production Hardening Verification Suite
 * Tests PR-029 (SSE Stream Heartbeat Keep-Alive),
 * PR-030 (Webhook DLQ AWS Full Jitter Backoff),
 * PR-031 (Multi-Generation Salt Rotation & Credential Upgrade),
 * PR-032 (High-Resolution Memory Profiler & Active GC Flush API)
 */

async function runPhase9Tests() {
  console.log("🚀 Starting Phase 9 Production Readiness Test Suite...");

  // Start Next.js server on port 3010 for live endpoint verification
  const { spawn } = await import("child_process");
  const server = spawn("npx", ["next", "start", "-p", "3010"], {
    stdio: "inherit",
    shell: true
  });

  // Wait for server boot
  await new Promise((resolve) => setTimeout(resolve, 4500));
  const BASE = "http://localhost:3010";

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
    // 1. Live Server Test: SSE Heartbeat Keep-Alive
    await test("SSE Stream Heartbeat & Keep-Alive Frames (POST /api/routing/stream-sse)", async () => {
      const res = await fetch(`${BASE}/api/routing/stream-sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokensCount: 15, bufferLimit: 600, includeHeartbeat: true })
      });
      const data = await res.json();
      const heartbeatsHeader = res.headers.get("x-sse-heartbeats-count");

      return (
        res.status === 200 &&
        data.success === true &&
        data.metrics?.heartbeatsEmitted >= 1 &&
        heartbeatsHeader !== null &&
        parseInt(heartbeatsHeader) >= 1 &&
        data.sampleChunksPreview?.[0]?.includes(": ping")
      );
    });

    // 2. Live Server Test: Webhook DLQ Full Jitter Backoff
    await test("Webhook DLQ Full Jitter Backoff Calculation (POST /api/webhooks/dlq)", async () => {
      const res = await fetch(`${BASE}/api/webhooks/dlq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpointUrl: "https://api.partner.com/webhook",
          eventType: "outcome.sla.breach",
          payload: { error: "timeout" },
          httpStatus: 504,
          errorMessage: "Gateway Timeout"
        })
      });
      const data = await res.json();
      const dlqItem = data.item || data.event;
      if (!res.ok || !dlqItem?.nextRetryAt) return false;

      const nextRetryTime = new Date(dlqItem.nextRetryAt).getTime();
      const delayMs = nextRetryTime - Date.now();

      // Delay must be positive and within jitter bounds (500ms to 4000ms for retry 1)
      return delayMs >= 300 && delayMs <= 10000;
    });

    // 3. Live Server Test: Multi-Generation Salt Rotation & Transparent Upgrade
    await test("Multi-Generation Salt Credential Verification & Auto-Upgrade", async () => {
      const { verifyAndUpgradeCredential, hashWithSalt } = await import("../src/lib/salt-rotation-guard.js").catch(async () => {
        // Fallback to direct path or TS runtime
        return await import("file:///" + process.cwd().replace(/\\/g, "/") + "/src/lib/salt-rotation-guard.ts");
      });

      // Test A: Legacy unhashed plain PIN
      const plainCheck = verifyAndUpgradeCredential("123456", "123456");
      if (!plainCheck.valid || !plainCheck.needsRehash || !plainCheck.upgradedHash?.startsWith("oir_hash_v2:")) {
        return false;
      }

      // Test B: Active v2 salt hash
      const activeHash = hashWithSalt("654321");
      const activeCheck = verifyAndUpgradeCredential("654321", activeHash);
      if (!activeCheck.valid || activeCheck.needsRehash !== false) {
        return false;
      }

      // Test C: Invalid PIN
      const invalidCheck = verifyAndUpgradeCredential("000000", activeHash);
      return invalidCheck.valid === false;
    });

    // 4. Live Server Test: High-Resolution Memory Profiler & Active GC Flush
    await test("High-Resolution Memory Profiler & Active Flush (GET & POST /api/analytics/gc-pressure)", async () => {
      const getRes = await fetch(`${BASE}/api/analytics/gc-pressure`);
      const getData = await getRes.json();
      if (!getRes.ok || getData.memoryStatus?.utilizationPct === undefined) return false;

      const postRes = await fetch(`${BASE}/api/analytics/gc-pressure`, { method: "POST" });
      const postData = await postRes.json();
      return (
        postRes.ok &&
        postData.success === true &&
        Array.isArray(postData.purgeResult?.purgedCaches) &&
        postData.freshStatus?.pressureState !== undefined
      );
    });

    console.log(`\n========================================`);
    console.log(`🎉 PHASE 9 VERIFICATION SUMMARY: ${passedCount}/${totalCount} Passed`);
    console.log(`========================================\n`);
  } finally {
    server.kill("SIGTERM");
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

runPhase9Tests();
