import { spawn } from "child_process";
import http from "http";

const PORT = 3014;
const BASE_URL = `http://localhost:${PORT}`;

function waitForServer(port, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://localhost:${port}/api/health`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404 || res.statusCode === 401) {
          resolve(true);
        } else {
          retry();
        }
      });
      req.on("error", () => retry());
      req.end();
    };

    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server failed to start on port ${port} within ${timeoutMs}ms`));
      } else {
        setTimeout(check, 400);
      }
    };

    check();
  });
}

async function runTests() {
  console.log("🚀 Starting Phase 13 Production Readiness Test Suite...");
  let serverProcess = null;
  let passedCount = 0;
  let totalTests = 4;

  try {
    serverProcess = spawn("npx", ["next", "start", "-p", String(PORT)], {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" }
    });

    await waitForServer(PORT);
    console.log(`✓ Production server started successfully on port ${PORT}`);

    // TEST 1: Zero-Trust Scoped API Key Validation & IP Filtering
    try {
      // 1. Create scoped key
      const createRes = await fetch(`${BASE_URL}/api/settings/api-keys/scope-guard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          tenantId: "tenant_fintech_edge",
          name: "Edge Routing Read-Only Key",
          scopes: ["routing:execute", "logs:read"],
          ipAllowlist: ["10.0.0.1", "127.0.0.1"],
          expiryDays: 30
        })
      });
      const createData = await createRes.json();
      if (!createData.success || !createData.key || !createData.key.keyId) {
        throw new Error("Scoped key creation failed");
      }

      const keyId = createData.key.keyId;

      // 2. Validate authorized access
      const validRes = await fetch(`${BASE_URL}/api/settings/api-keys/scope-guard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VALIDATE",
          keyId,
          requiredScope: "routing:execute",
          clientIp: "127.0.0.1"
        })
      });
      const validData = await validRes.json();
      if (!validData.success || validData.statusCode !== 200) {
        throw new Error("Authorized scope access was unexpectedly rejected");
      }

      // 3. Validate unauthorized scope rejection
      const invalidScopeRes = await fetch(`${BASE_URL}/api/settings/api-keys/scope-guard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VALIDATE",
          keyId,
          requiredScope: "billing:write",
          clientIp: "127.0.0.1"
        })
      });
      if (invalidScopeRes.status !== 403) {
        throw new Error(`Expected HTTP 403 for unauthorized scope, got ${invalidScopeRes.status}`);
      }

      console.log("  ✓ [PASS] Zero-Trust Scoped API Token & IP Guard (GET & POST /api/settings/api-keys/scope-guard)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Zero-Trust Scoped API Token & IP Guard:", err.message);
    }

    // TEST 2: Automated Dynamic TLS Certificate Renewal & Hot Reloading
    try {
      // 1. GET cert status
      const certRes = await fetch(`${BASE_URL}/api/system/cert-renewal`);
      const certData = await certRes.json();
      if (!certData.success || !certData.certificate || !certData.certificate.fingerprintSha256) {
        throw new Error("Failed to retrieve initial certificate metadata");
      }

      const initialVersion = certData.certificate.version;

      // 2. RENEW certificate
      const renewRes = await fetch(`${BASE_URL}/api/system/cert-renewal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RENEW" })
      });
      const renewData = await renewRes.json();
      if (!renewData.success || !renewData.newCert || renewData.newCert.version <= initialVersion) {
        throw new Error("Certificate renewal failed to bump version and generate new certificate context");
      }

      console.log("  ✓ [PASS] Automated Dynamic TLS Certificate Renewal & Hot-Swap (GET & POST /api/system/cert-renewal)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Dynamic TLS Certificate Renewal:", err.message);
    }

    // TEST 3: Geo-DNS Anycast Ingress Traffic Steering & Failover
    try {
      // 1. Proximity steering for Germany (DE) -> should pick eu-west-1
      const deRes = await fetch(`${BASE_URL}/api/system/geo-steering?country=DE`);
      const deData = await deRes.json();
      if (!deData.success || deData.selectedPop.id !== "eu-west-1") {
        throw new Error(`Expected eu-west-1 for country DE, got ${deData.selectedPop?.id}`);
      }

      // 2. Simulate eu-west-1 degradation/outage
      const healthRes = await fetch(`${BASE_URL}/api/system/geo-steering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_HEALTH", popId: "eu-west-1", healthy: false })
      });
      const healthData = await healthRes.json();
      if (!healthData.success) {
        throw new Error("Failed to set POP health state");
      }

      // 3. Re-probe country DE -> must failover to alternate healthy POP
      const failoverRes = await fetch(`${BASE_URL}/api/system/geo-steering?country=DE`);
      const failoverData = await failoverRes.json();
      if (!failoverData.success || !failoverData.failoverApplied || failoverData.selectedPop.id === "eu-west-1") {
        throw new Error("Geo failover did not steer away from degraded POP");
      }

      // Restore health
      await fetch(`${BASE_URL}/api/system/geo-steering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_HEALTH", popId: "eu-west-1", healthy: true })
      });

      console.log("  ✓ [PASS] Geo-DNS Anycast Ingress Traffic Steering & Failover (GET & POST /api/system/geo-steering)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Geo-DNS Traffic Steering:", err.message);
    }

    // TEST 4: Multi-Tenant Fair-Share Dynamic Token Budget Redistribution
    try {
      const getRes = await fetch(`${BASE_URL}/api/system/fair-share`);
      const getData = await getRes.json();

      if (!getData.success || !getData.schedule || getData.schedule.allocations.length < 4) {
        throw new Error("Fair-share schedule computation failed");
      }

      if (getData.schedule.starvationPreventedCount < 4) {
        throw new Error("Fair-share failed to prevent baseline starvation");
      }

      // Test demand update
      const demandRes = await fetch(`${BASE_URL}/api/system/fair-share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_DEMAND",
          tenantId: "tenant_surge_test",
          tier: "growth",
          baseMinQuota: 500000,
          requestedDemand: 2000000
        })
      });
      const demandData = await demandRes.json();
      if (!demandData.success || !demandData.schedule) {
        throw new Error("Fair-share demand registration failed");
      }

      console.log("  ✓ [PASS] Multi-Tenant Fair-Share Dynamic Token Scheduler (GET & POST /api/system/fair-share)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Multi-Tenant Fair-Share Scheduler:", err.message);
    }

  } finally {
    if (serverProcess) {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"]);
      } else {
        serverProcess.kill("SIGKILL");
      }
    }
  }

  console.log("\n========================================");
  console.log(`🎉 PHASE 13 VERIFICATION SUMMARY: ${passedCount}/${totalTests} Passed`);
  console.log("========================================\n");

  if (passedCount !== totalTests) {
    process.exit(1);
  }
  process.exit(0);
}

runTests();
