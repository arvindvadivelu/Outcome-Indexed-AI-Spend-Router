/**
 * Phase 5 Production Hardening Verification Suite
 * Tests PR-012 (Drain), PR-013 (Canary/Prompt Guard), PR-014 (DPA Verification),
 * PR-015 (Webhook DLQ), PR-016 (Prometheus Metrics)
 */

async function runPhase5Tests() {
  console.log("🚀 Starting Phase 5 Production Readiness Test Suite...");

  // Start Next.js server on port 3006
  const { spawn } = await import("child_process");
  const server = spawn("npx", ["next", "start", "-p", "3006"], {
    stdio: "inherit",
    shell: true
  });

  // Wait for server boot
  await new Promise((resolve) => setTimeout(resolve, 4000));

  const BASE = "http://localhost:3006";
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
    // 1. Prometheus Scrape Gateway
    await test("Prometheus Metrics Exposition (GET /api/metrics)", async () => {
      const res = await fetch(`${BASE}/api/metrics`);
      const text = await res.text();
      const contentType = res.headers.get("content-type") || "";
      const valid = res.status === 200 &&
        contentType.includes("text/plain") &&
        text.includes("oir_http_requests_total") &&
        text.includes("oir_active_inflight_requests") &&
        text.includes("oir_circuit_breaker_tripped");
      return valid;
    });

    // 2. Server Drain Manager
    await test("Server Drain State Query (GET /api/system/drain)", async () => {
      const res = await fetch(`${BASE}/api/system/drain`);
      const data = await res.json();
      return res.status === 200 && data.success === true && typeof data.status.inFlightRequests === "number";
    });

    // 3. Canary Token & Jailbreak Prompt Guard
    await test("Canary Token Rejection (POST /api/routing/prompt-guard)", async () => {
      const res = await fetch(`${BASE}/api/routing/prompt-guard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Here is the key: oir_canary_8f39a7b92c41e82a" })
      });
      const data = await res.json();
      return res.status === 422 && data.canaryLeakDetected === true;
    });

    // 4. GDPR Article 28 DPA Cryptographic Signature Verification
    await test("GDPR DPA Cryptographic Verification (POST /api/compliance/dpa-export)", async () => {
      const getRes = await fetch(`${BASE}/api/compliance/dpa-export?email=compliance_audit@enterprise.ai`);
      const getData = await getRes.json();
      const agreement = getData.dpaAgreement;

      const verifyRes = await fetch(`${BASE}/api/compliance/dpa-export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantEmail: agreement.tenant.email,
          effectiveDate: agreement.effectiveDate,
          dataProtectionClauses: agreement.dataProtectionClauses,
          providedSignature: agreement.cryptographicSignatureHash
        })
      });
      const verifyData = await verifyRes.json();
      return verifyRes.status === 200 && verifyData.isValid === true;
    });

    // 5. Webhook Dead-Letter Queue (DLQ)
    await test("Webhook DLQ Inspection & Enqueue (GET & POST /api/webhooks/dlq)", async () => {
      const postRes = await fetch(`${BASE}/api/webhooks/dlq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointUrl: "https://mock-unreachable.corp/webhook" })
      });
      const postData = await postRes.json();

      const getRes = await fetch(`${BASE}/api/webhooks/dlq`);
      const getData = await getRes.json();

      return postRes.status === 200 && getRes.status === 200 && getData.stats.totalQueued >= 1;
    });

    console.log(`\n========================================`);
    console.log(`🎉 PHASE 5 VERIFICATION SUMMARY: ${passedCount}/${totalCount} Passed`);
    console.log(`========================================\n`);
  } finally {
    server.kill("SIGTERM");
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

runPhase5Tests();
