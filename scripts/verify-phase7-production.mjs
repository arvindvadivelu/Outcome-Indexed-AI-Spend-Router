/**
 * Phase 7 Production Hardening Verification Suite
 * Tests PR-021 (Dual-Secret Webhook Rollover), PR-022 (SSE Stream Backpressure),
 * PR-023 (Tenant Schema Normalization & Health Guard), PR-024 (Dual-Stack IPv4/IPv6 Geofencing)
 */

async function runPhase7Tests() {
  console.log("🚀 Starting Phase 7 Production Readiness Test Suite...");

  // Start Next.js server on port 3008 for live endpoint verification
  const { spawn } = await import("child_process");
  const server = spawn("npx", ["next", "start", "-p", "3008"], {
    stdio: "inherit",
    shell: true
  });

  // Wait for server boot
  await new Promise((resolve) => setTimeout(resolve, 4000));
  const BASE = "http://localhost:3008";

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
    // 1. Live Server Test: Dual-Secret Webhook Rollover
    await test("Dual-Secret Staged Webhook Verification (POST /api/webhooks/verify)", async () => {
      const payload = { event: "sla.refund", refundAmount: 0.05 };
      const primarySecret = "whsec_live_new_key_123456";
      const oldRotatedSecret = "whsec_live_old_key_654321";

      const crypto = await import("crypto");
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHmac("sha256", oldRotatedSecret)
        .update(`${timestamp}.${JSON.stringify(payload)}`)
        .digest("hex");

      const res = await fetch(`${BASE}/api/webhooks/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureHeader: `t=${timestamp},v1=${signature}`,
          payload,
          secretKey: primarySecret,
          rotatedSecretKey: oldRotatedSecret
        })
      });
      const data = await res.json();
      return res.status === 200 && data.success === true && data.isRotatedSecretUsed === true;
    });

    // 2. Live Server Test: SSE Backpressure Flow Control
    await test("SSE Stream Flow Control & Backpressure (POST /api/routing/stream-sse)", async () => {
      const res = await fetch(`${BASE}/api/routing/stream-sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokensCount: 30, bufferLimit: 500 })
      });
      const data = await res.json();
      return res.status === 200 && data.success === true && data.status === "COMPLIANT_FLOW_CONTROL";
    });

    // 3. Live Server Test: Tenant Schema Normalization & Health Guard
    await test("Tenant Schema Normalization & Health Guard (GET /api/system/schema-check)", async () => {
      const res = await fetch(`${BASE}/api/system/schema-check`);
      const data = await res.json();
      return res.status === 200 && data.success === true && data.integrityScorePct === 100 && data.status === "OPTIMAL_NORMALIZED";
    });

    // 4. Live Server Test: Dual-Stack IPv4/IPv6 & Private VPC Geofencing
    await test("IPv4-Mapped IPv6 & Private VPC Geofencing (POST /api/settings/security/ip-geofence)", async () => {
      const res = await fetch(`${BASE}/api/settings/security/ip-geofence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientIp: "::ffff:10.120.4.15",
          allowedCidrs: ["10.0.0.0/8"]
        })
      });
      const data = await res.json();
      return res.status === 200 && data.evaluation?.isAllowed === true && data.evaluation?.isPrivateVpc === true;
    });

    console.log(`\n========================================`);
    console.log(`🎉 PHASE 7 VERIFICATION SUMMARY: ${passedCount}/${totalCount} Passed`);
    console.log(`========================================\n`);
  } finally {
    server.kill("SIGTERM");
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

runPhase7Tests();
