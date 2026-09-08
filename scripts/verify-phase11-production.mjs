/**
 * Phase 11 Production Hardening Verification Suite
 * Tests PR-037 (Autonomous Failure Domain Isolation),
 * PR-038 (Enterprise TLS Transport Security & OCSP Auditor),
 * PR-039 (Sliding Window Log Compactor & Storage GC),
 * PR-040 (Consistent Hash Ring & Shard Router)
 */

async function runPhase11Tests() {
  console.log("🚀 Starting Phase 11 Production Readiness Test Suite...");

  // Start Next.js server on port 3012 for live endpoint verification
  const { spawn } = await import("child_process");
  const server = spawn("npx", ["next", "start", "-p", "3012"], {
    stdio: "inherit",
    shell: true
  });

  // Wait for server boot
  await new Promise((resolve) => setTimeout(resolve, 4500));
  const BASE = "http://localhost:3012";

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
    // 1. Live Server Test: Autonomous Failure Domain Isolation
    await test("Failure Domain Health & Autonomous Traffic Isolation (GET & POST /api/system/failure-domains)", async () => {
      // Step A: Trigger probe failure for us-east-1
      const postRes = await fetch(`${BASE}/api/system/failure-domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_isolation", regionId: "us-east-1", isolate: true })
      });
      const postData = await postRes.json();
      if (!postRes.ok || postData.domain?.isIsolated !== true || postData.domain?.trafficWeightPct !== 0) return false;

      // Step B: Query status
      const getRes = await fetch(`${BASE}/api/system/failure-domains`);
      const getData = await getRes.json();

      // Reset isolation back to healthy
      await fetch(`${BASE}/api/system/failure-domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_isolation", regionId: "us-east-1", isolate: false })
      });

      return getRes.ok && getData.success === true && getData.totalDomainsCount >= 3;
    });

    // 2. Live Server Test: TLS Transport Security Auditor
    await test("Enterprise TLS Transport & OCSP Auditor (GET /api/settings/security/tls-audit)", async () => {
      const res = await fetch(`${BASE}/api/settings/security/tls-audit`);
      const data = await res.json();
      return (
        res.ok &&
        data.success === true &&
        data.report?.grade === "A+" &&
        data.report?.hstsStatus?.preload === true &&
        data.report?.ocspStapling?.status === "STAPLED_VERIFIED"
      );
    });

    // 3. Live Server Test: Sliding Window Log Compaction
    await test("Sliding Window Log Compaction & Storage GC (POST /api/system/log-compact)", async () => {
      const res = await fetch(`${BASE}/api/system/log-compact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      return res.ok && data.success === true && typeof data.usersProcessed === "number";
    });

    // 4. Live Server Test: Consistent Hash Ring & Shard Router
    await test("Consistent Hash Ring Partitioning & Key Mapping (GET & POST /api/system/sharding)", async () => {
      const getRes = await fetch(`${BASE}/api/system/sharding?key=tenant_enterprise_xyz@corp.com`);
      const getData = await getRes.json();
      if (!getRes.ok || !getData.assignedShard?.startsWith("shard-")) return false;

      const mapRes = await fetch(`${BASE}/api/system/sharding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "map_keys",
          keys: ["user_1@a.com", "user_2@b.com", "user_3@c.com"]
        })
      });
      const mapData = await mapRes.json();
      return mapRes.ok && mapData.success === true && typeof mapData.mapping["user_1@a.com"] === "string";
    });

    console.log(`\n========================================`);
    console.log(`🎉 PHASE 11 VERIFICATION SUMMARY: ${passedCount}/${totalCount} Passed`);
    console.log(`========================================\n`);
  } finally {
    server.kill("SIGTERM");
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

runPhase11Tests();
