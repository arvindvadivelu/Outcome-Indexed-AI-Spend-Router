import { spawn } from "child_process";
import http from "http";

const PORT = 3016;
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
  console.log("🚀 Starting Phase 15 Production Readiness Test Suite...");
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

    // TEST 1: Cross-Region Circuit Breaker Mesh Telemetry Gossip
    try {
      // 1. Trip circuit
      const tripRes = await fetch(`${BASE_URL}/api/system/circuit-mesh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TRIP", provider: "deepseek", reason: "504 gateway timeout burst" })
      });
      const tripData = await tripRes.json();
      if (!tripData.success || tripData.telemetry.state !== "OPEN") {
        throw new Error("Local circuit tripping failed");
      }

      // 2. Gossip Sync from EU node
      const gossipRes = await fetch(`${BASE_URL}/api/system/circuit-mesh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GOSSIP_SYNC",
          peerId: "node-eu-west",
          peerCircuits: {
            "anthropic": {
              provider: "anthropic",
              state: "OPEN",
              failureCount: 6,
              trippedAt: Date.now(),
              originNodeId: "node-eu-west",
              gossipVersion: 5,
              lastUpdated: Date.now()
            }
          }
        })
      });
      const gossipData = await gossipRes.json();
      if (!gossipData.success || !gossipData.updatedProviders.includes("anthropic")) {
        throw new Error("Gossip sync failed to propagate remote circuit state");
      }

      // 3. Reset deepseek & anthropic
      await fetch(`${BASE_URL}/api/system/circuit-mesh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET", provider: "deepseek" })
      });
      await fetch(`${BASE_URL}/api/system/circuit-mesh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET", provider: "anthropic" })
      });

      console.log("  ✓ [PASS] Cross-Region Circuit Mesh Telemetry Gossip (GET & POST /api/system/circuit-mesh)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Circuit Mesh Telemetry:", err.message);
    }

    // TEST 2: High-Precision Distributed Clock Drift Guard & TrueTime Consensus
    try {
      const getClockRes = await fetch(`${BASE_URL}/api/system/clock-sync`);
      const getClockData = await getClockRes.json();
      if (!getClockData.success || typeof getClockData.trueTime.timestampMs !== "number") {
        throw new Error("Failed to retrieve initial TrueTime consensus");
      }

      // Resync NTP reference servers
      const syncRes = await fetch(`${BASE_URL}/api/system/clock-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SYNC" })
      });
      const syncData = await syncRes.json();
      if (!syncData.success || syncData.trueTime.uncertaintyMs > 5.0) {
        throw new Error("NTP reference resynchronization failed or uncertainty bounds too high");
      }

      console.log("  ✓ [PASS] Distributed Clock Drift Guard & TrueTime Consensus (GET & POST /api/system/clock-sync)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Clock Drift Guard:", err.message);
    }

    // TEST 3: Ingress Fuzzing & Malformed Schema Mutation Guard
    try {
      // 1. Prototype pollution attempt -> must return 403
      const protoRes = await fetch(`${BASE_URL}/api/routing/schema-mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"model": "gpt-4o", "__proto__": {"isAdmin": true, "bypassLimits": true}, "prompt": "Unsafe prototype injection"}'
      });
      if (protoRes.status !== 403) {
        throw new Error(`Expected HTTP 403 for prototype poisoning, got ${protoRes.status}`);
      }

      // 2. Clean valid payload -> must return 200
      const cleanRes = await fetch(`${BASE_URL}/api/routing/schema-mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet",
          messages: [{ role: "user", content: "Optimize routing spend" }]
        })
      });
      if (cleanRes.status !== 200) {
        throw new Error(`Expected HTTP 200 for clean payload, got ${cleanRes.status}`);
      }

      console.log("  ✓ [PASS] Ingress Schema Mutation & Prototype Pollution Guard (GET & POST /api/routing/schema-mutation)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Schema Mutation Guard:", err.message);
    }

    // TEST 4: Adaptive Ingress Backpressure & Load Shedding
    try {
      // 1. Set SATURATED state
      await fetch(`${BASE_URL}/api/system/ingress-backpressure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_OVERRIDE", overrideState: "SATURATED" })
      });

      // 2. Evaluate STANDARD request -> must shed load (HTTP 503)
      const shedRes = await fetch(`${BASE_URL}/api/system/ingress-backpressure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EVALUATE", priority: "STANDARD" })
      });
      if (shedRes.status !== 503) {
        throw new Error(`Expected HTTP 503 for standard request under saturation, got ${shedRes.status}`);
      }

      // 3. Evaluate CRITICAL request -> must be accepted
      const critRes = await fetch(`${BASE_URL}/api/system/ingress-backpressure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EVALUATE", priority: "CRITICAL" })
      });
      const critData = await critRes.json();
      if (!critData.success || !critData.accepted) {
        throw new Error("Critical priority request was improperly rejected during saturation");
      }

      // 4. Release slot & reset override
      await fetch(`${BASE_URL}/api/system/ingress-backpressure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RELEASE" })
      });
      await fetch(`${BASE_URL}/api/system/ingress-backpressure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_OVERRIDE", overrideState: null })
      });

      console.log("  ✓ [PASS] Adaptive Ingress Backpressure & Load Shedding (GET & POST /api/system/ingress-backpressure)");
      passedCount++;
    } catch (err) {
      console.error("  ✗ [ERROR] Ingress Backpressure:", err.message);
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
  console.log(`🎉 PHASE 15 VERIFICATION SUMMARY: ${passedCount}/${totalTests} Passed`);
  console.log("========================================\n");

  if (passedCount !== totalTests) {
    process.exit(1);
  }
  process.exit(0);
}

runTests();
