import { spawn } from "child_process";
import http from "http";

const PORT = 3015;
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
  console.log("🚀 Starting Phase 14 Production Readiness Test Suite...");
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

    // TEST 1: Dynamic Edge Connection Pool Sizing & TCP Socket Leases
    try {
      // 1. Acquire socket
      const acqRes = await fetch(`${BASE_URL}/api/system/connection-pool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACQUIRE", host: "api.openai.com" })
      });
      const acqData = await acqRes.json();
      if (!acqData.success || !acqData.leaseId || !acqData.socketId) {
        throw new Error("Socket acquisition failed");
      }

      // 2. Release socket
      const relRes = await fetch(`${BASE_URL}/api/system/connection-pool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RELEASE", leaseId: acqData.leaseId })
      });
      const relData = await relRes.json();
      if (!relData.success) {
        throw new Error("Socket release failed");
      }

      // 3. Inspect pool stats
      const statsRes = await fetch(`${BASE_URL}/api/system/connection-pool`);
      const statsData = await statsRes.json();
      if (!statsData.success || !statsData.connectionPools["api.openai.com"]) {
        throw new Error("Pool statistics query failed");
      }

      console.log("  ✓ [PASS] Dynamic Edge Connection Pool & Socket Leases (GET & POST /api/system/connection-pool)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Connection Pool Management:", err.message);
    }

    // TEST 2: Automated Multi-Cloud DNS Health Probe & Active/Active Failover
    try {
      const getDnsRes = await fetch(`${BASE_URL}/api/system/multicloud-dns`);
      const getDnsData = await getDnsRes.json();
      if (!getDnsData.success || getDnsData.dnsProviders.length < 3) {
        throw new Error("Multi-cloud DNS probe retrieval failed");
      }

      // Simulate AWS Route 53 degradation
      const setHealthRes = await fetch(`${BASE_URL}/api/system/multicloud-dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_HEALTH", providerId: "aws_route53", healthy: false })
      });
      const setHealthData = await setHealthRes.json();
      if (!setHealthData.success || !setHealthData.probe.failoverActive) {
        throw new Error("DNS failover state failed to activate on provider outage");
      }

      // Restore health
      await fetch(`${BASE_URL}/api/system/multicloud-dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_HEALTH", providerId: "aws_route53", healthy: true })
      });

      console.log("  ✓ [PASS] Multi-Cloud DNS Health Probing & Traffic Failover (GET & POST /api/system/multicloud-dns)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Multi-Cloud DNS Health Probing:", err.message);
    }

    // TEST 3: Zero-Copy Streaming SSE Wire Parser & Binary Buffer Pool
    try {
      const parseRes = await fetch(`${BASE_URL}/api/routing/wire-buffer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawChunk: [
            ": ping",
            'data: {"choices":[{"delta":{"content":"Outcome "}}]}',
            ": keep-alive",
            'data: {"choices":[{"delta":{"content":"Router "}}]}',
            'data: {"choices":[{"delta":{"content":"Active."}}]}',
            "data: [DONE]"
          ].join("\n")
        })
      });
      const parseData = await parseRes.json();

      if (!parseData.success || parseData.metrics.totalFrames !== 6 || parseData.metrics.heartbeatsFiltered !== 2) {
        throw new Error("Wire parser frame filtering failed");
      }

      if (parseData.metrics.reconstructedMessage !== "Outcome Router Active.") {
        throw new Error(`Extracted token mismatch: got '${parseData.metrics.reconstructedMessage}'`);
      }

      console.log("  ✓ [PASS] Zero-Copy Streaming SSE Wire Parser (GET & POST /api/routing/wire-buffer)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] SSE Wire Parser:", err.message);
    }

    // TEST 4: Real-Time Dynamic Anomaly Degradation & Provider Quarantine
    try {
      // 1. Record series of anomaly events for groq
      for (let i = 0; i < 4; i++) {
        await fetch(`${BASE_URL}/api/routing/provider-quarantine`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "RECORD_EVENT",
            provider: "groq",
            success: false,
            latencyMs: 1400,
            isAnomaly: true,
            errorMessage: "Groq provider 3-sigma latency timeout burst"
          })
        });
      }

      // 2. Verify groq is QUARANTINED
      const statusRes = await fetch(`${BASE_URL}/api/routing/provider-quarantine`);
      const statusData = await statusRes.json();
      const groqProfile = statusData.providerProfiles?.groq;

      if (!groqProfile || groqProfile.state !== "QUARANTINED" || groqProfile.trafficAllowancePct !== 0) {
        throw new Error(`Expected groq to be QUARANTINED, got ${groqProfile?.state}`);
      }

      // 3. Rehabilitate to HEALTHY
      await fetch(`${BASE_URL}/api/routing/provider-quarantine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "OVERRIDE", provider: "groq", state: "HEALTHY", reason: "Rehabilitated in test" })
      });

      console.log("  ✓ [PASS] Dynamic Anomaly Tracking & Provider Quarantine (GET & POST /api/routing/provider-quarantine)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Provider Quarantine:", err.message);
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
  console.log(`🎉 PHASE 14 VERIFICATION SUMMARY: ${passedCount}/${totalTests} Passed`);
  console.log("========================================\n");

  if (passedCount !== totalTests) {
    process.exit(1);
  }
  process.exit(0);
}

runTests();
