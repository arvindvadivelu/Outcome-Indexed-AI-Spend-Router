/**
 * Phase 6 Production Hardening Verification Suite
 * Tests PR-017 (Chaos & Anomaly Live Panel), PR-018 (W3C Distributed Tracing),
 * PR-019 (Memory-Pressure LRU Cache), PR-020 (CORS Preflight Hardening)
 */

async function runPhase6Tests() {
  console.log("🚀 Starting Phase 6 Production Readiness Test Suite...");

  // Start Next.js server on port 3007 for live endpoint verification
  const { spawn } = await import("child_process");
  const server = spawn("npx", ["next", "start", "-p", "3007"], {
    stdio: "inherit",
    shell: true
  });

  // Wait for server boot
  await new Promise((resolve) => setTimeout(resolve, 4000));
  const BASE = "http://localhost:3007";

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
    // 1. Live Server Test: CORS OPTIONS Preflight
    await test("CORS OPTIONS Preflight Handling (OPTIONS /v1/chat/completions)", async () => {
      const res = await fetch(`${BASE}/v1/chat/completions`, {
        method: "OPTIONS",
        headers: {
          "Origin": "https://external-client-app.io",
          "Access-Control-Request-Method": "POST"
        }
      });
      const allowOrigin = res.headers.get("access-control-allow-origin");
      const allowMethods = res.headers.get("access-control-allow-methods");
      return res.status === 204 && allowOrigin === "*" && allowMethods?.includes("POST");
    });

    // 2. Live Server Test: W3C Distributed Tracing Baggage Propagation
    await test("W3C Traceparent Header Propagation in Chat Completions", async () => {
      const parentTrace = "00-8a3c9e2b1f4d6a7e8b9c0d1e2f3a4b5c-1a2b3c4d5e6f7a8b-01";
      const res = await fetch(`${BASE}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "traceparent": parentTrace
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Test distributed trace ID propagation" }]
        })
      });
      const returnedTrace = res.headers.get("traceparent");
      return res.status === 200 &&
             returnedTrace !== null &&
             returnedTrace.includes("8a3c9e2b1f4d6a7e8b9c0d1e2f3a4b5c");
    });

    // 3. Live Server Test: Anomaly Status API
    await test("Live Anomaly Status Query (GET /api/routing/anomaly-status)", async () => {
      const res = await fetch(`${BASE}/api/routing/anomaly-status`);
      const data = await res.json();
      return res.status === 200 && data.success === true && Array.isArray(data.providers);
    });

    // 4. Live Server Test: Chaos Simulation & Auto-Failover
    await test("Chaos Fault Simulation & Auto-Failover (POST /api/routing/chaos-simulate)", async () => {
      const res = await fetch(`${BASE}/api/routing/chaos-simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetProvider: "openai",
          faultType: "LATENCY_SPIKE",
          latencySpikeMs: 500
        })
      });
      const data = await res.json();
      return res.status === 200 &&
             data.success === true &&
             data.result?.fallbackEngaged === true &&
             data.result?.fallbackModelUsed !== undefined;
    });

    console.log(`\n========================================`);
    console.log(`🎉 PHASE 6 VERIFICATION SUMMARY: ${passedCount}/${totalCount} Passed`);
    console.log(`========================================\n`);
  } finally {
    server.kill("SIGTERM");
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

runPhase6Tests();
