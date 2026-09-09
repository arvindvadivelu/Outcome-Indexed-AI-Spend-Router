import { spawn } from "child_process";
import http from "http";

const PORT = 3013;
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
  console.log("🚀 Starting Phase 12 Production Readiness Test Suite...");
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

    // TEST 1: Multi-Region CRDT Replication & Vector Clocks
    try {
      // 1. SET record
      const setRes = await fetch(`${BASE_URL}/api/system/replication`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET",
          key: "tenant_tier:org_alpha",
          value: { tier: "enterprise", quota: 5000000 }
        })
      });
      const setData = await setRes.json();
      if (!setData.success || setData.record.key !== "tenant_tier:org_alpha") {
        throw new Error("CRDT SET operation failed");
      }

      // 2. RECONCILE with remote record
      const reconcileRes = await fetch(`${BASE_URL}/api/system/replication`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECONCILE",
          remoteRecord: {
            key: "tenant_tier:org_alpha",
            value: { tier: "enterprise_plus", quota: 10000000 },
            nodeId: "remote-node-eu",
            version: 5,
            timestamp: Date.now() + 1000,
            lamportClock: 10,
            vectorClock: { "remote-node-eu": 5 }
          }
        })
      });
      const recData = await reconcileRes.json();
      if (!recData.success || recData.reconciledCount !== 1) {
        throw new Error("CRDT RECONCILE operation failed");
      }

      // 3. GET snapshot
      const getRes = await fetch(`${BASE_URL}/api/system/replication`);
      const snapshot = await getRes.json();
      if (!snapshot.success || snapshot.recordCount < 1) {
        throw new Error("CRDT GET snapshot failed");
      }

      console.log("  ✓ [PASS] Multi-Region CRDT Replication & Vector Clocks (GET & POST /api/system/replication)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Multi-Region CRDT Replication:", err.message);
    }

    // TEST 2: Dynamic Upstream TPM/RPM Budget Guard
    try {
      // 1. RESERVE lease
      const reserveRes = await fetch(`${BASE_URL}/api/routing/upstream-budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESERVE",
          provider: "openai",
          estimatedTokens: 4000
        })
      });
      const reserveData = await reserveRes.json();
      if (!reserveData.success || !reserveData.leaseId) {
        throw new Error("Budget reservation failed");
      }

      // 2. COMMIT lease
      const commitRes = await fetch(`${BASE_URL}/api/routing/upstream-budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMMIT",
          leaseId: reserveData.leaseId,
          actualTokens: 3850
        })
      });
      const commitData = await commitRes.json();
      if (!commitData.success) {
        throw new Error("Budget commit failed");
      }

      // 3. GET status
      const getStatusRes = await fetch(`${BASE_URL}/api/routing/upstream-budget`);
      const statusData = await getStatusRes.json();
      if (!statusData.success || !statusData.providerBudgets.openai) {
        throw new Error("Budget status retrieval failed");
      }

      console.log("  ✓ [PASS] Dynamic Upstream TPM/RPM Budget Guard (GET & POST /api/routing/upstream-budget)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Dynamic Upstream TPM/RPM Budget Guard:", err.message);
    }

    // TEST 3: Synthetic Canary Probing & Continuous SLI/SLO Verification
    try {
      const canaryRes = await fetch(`${BASE_URL}/api/system/canary-probes`);
      const canaryData = await canaryRes.json();

      if (!canaryData.success || !canaryData.sweep || canaryData.sweep.totalProbes < 4) {
        throw new Error("Synthetic canary sweep failed");
      }

      if (typeof canaryData.sweep.overallAvailabilitySli !== "number") {
        throw new Error("Canary SLI metric missing");
      }

      console.log("  ✓ [PASS] Synthetic Canary Probing & Continuous SLI/SLO (GET /api/system/canary-probes)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Synthetic Canary Probing:", err.message);
    }

    // TEST 4: Dynamic Adaptive Batch Dispatcher & Micro-Queue Aggregation
    try {
      // Dispatch 3 concurrent requests to test batching
      const reqPromises = [1, 2, 3].map(i =>
        fetch(`${BASE_URL}/api/routing/batch-dispatch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Evaluate sentiment fidelity for transaction batch item #${i}`,
            expectedOutcome: "sentiment_positive",
            priority: "STANDARD"
          })
        }).then(r => r.json())
      );

      const responses = await Promise.all(reqPromises);
      for (const res of responses) {
        if (!res.success || !res.batchEvaluated || !res.result) {
          throw new Error("Adaptive batch evaluation response invalid");
        }
      }

      // Query metrics
      const metricsRes = await fetch(`${BASE_URL}/api/routing/batch-dispatch`);
      const metricsData = await metricsRes.json();
      if (!metricsData.success || metricsData.metrics.totalItemsProcessed < 3) {
        throw new Error("Batch metrics failed to register processed items");
      }

      console.log("  ✓ [PASS] Dynamic Adaptive Batch Dispatcher (GET & POST /api/routing/batch-dispatch)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Dynamic Adaptive Batch Dispatcher:", err.message);
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
  console.log(`🎉 PHASE 12 VERIFICATION SUMMARY: ${passedCount}/${totalTests} Passed`);
  console.log("========================================\n");

  if (passedCount !== totalTests) {
    process.exit(1);
  }
  process.exit(0);
}

runTests();
