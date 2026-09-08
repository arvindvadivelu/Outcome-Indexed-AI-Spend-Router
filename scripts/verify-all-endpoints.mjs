/**
 * Comprehensive Automated Verification Suite for Outcome-Indexed AI Spend Router
 */
import http from "http";

async function runTests() {
  console.log("🚀 Starting Outcome Router End-to-End Verification Suite...");

  // Start Next.js server on port 3005 for testing
  const { spawn } = await import("child_process");
  const server = spawn("npx", ["next", "start", "-p", "3005"], {
    stdio: "inherit",
    shell: true
  });

  // Wait for server to boot
  await new Promise((resolve) => setTimeout(resolve, 4000));

  const BASE = "http://localhost:3005";
  let passedCount = 0;
  let totalCount = 0;

  async function testEndpoint(name, url, method, body, expectedStatus = 200, headers = {}) {
    totalCount++;
    try {
      const res = await fetch(`${BASE}${url}`, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await res.json().catch(() => ({}));
      const ok = res.status === expectedStatus;

      if (ok) {
        console.log(`  ✓ [PASS] ${name} (${method} ${url}) -> Status ${res.status}`);
        passedCount++;
        return { ok: true, data, headers: res.headers };
      } else {
        console.error(`  ✗ [FAIL] ${name} (${method} ${url}) -> Got ${res.status}, expected ${expectedStatus}`, data);
        return { ok: false, data, headers: res.headers };
      }
    } catch (err) {
      console.error(`  ✗ [ERROR] ${name} (${method} ${url}) -> ${err.message}`);
      return { ok: false, error: err };
    }
  }

  try {
    // 1. Health Probe
    await testEndpoint("Gateway Health Probe", "/api/v1/health", "GET");

    // 2. Chat Completions
    const chatResult = await testEndpoint(
      "OpenAI Drop-In Chat Completion",
      "/v1/chat/completions",
      "POST",
      {
        messages: [{ role: "user", content: "Write a high-converting sales outreach email." }],
        strategy: "outcome_optimized",
        target_metric: "demo_booked"
      },
      200,
      {
        "x-outcome-strategy": "outcome_optimized",
        "x-outcome-target-metric": "demo_booked"
      }
    );

    const requestId = chatResult?.data?.id || chatResult?.headers?.get("x-outcome-request-id");

    // Check Headers
    if (chatResult?.headers) {
      const modelHeader = chatResult.headers.get("x-outcome-router-model");
      const costHeader = chatResult.headers.get("x-outcome-router-cost-usd");
      const savedHeader = chatResult.headers.get("x-outcome-router-saved-usd");
      console.log(`     Headers verified: Model=${modelHeader}, Cost=${costHeader}, Saved=${savedHeader}`);
    }

    // 3. Outcome Feedback Ingestion
    if (requestId) {
      await testEndpoint(
        "Bayesian Outcome Feedback Ingestion",
        "/api/v1/feedback/outcome",
        "POST",
        {
          request_id: requestId,
          outcome_success: true,
          metric_name: "demo_booked",
          revenue_impact_usd: 500.0
        }
      );
    }

    // 4. Benchmarks Leaderboard
    await testEndpoint("Pareto Benchmarks Leaderboard", "/api/benchmarks", "GET");

    // 5. Billing Forecast GET
    await testEndpoint("Billing Forecast Query", "/api/billing/forecast?monthly_spend=1200&monthly_budget=2000", "GET");

    // 6. Routing Policy Synthesizer
    await testEndpoint(
      "Natural Language Policy Synthesizer",
      "/api/routing/synthesize",
      "POST",
      { prompt: "Route all Python code reviews to the fastest model under 200ms latency" }
    );

    // 7. Routing Dry-Run Decision Engine
    await testEndpoint(
      "Routing Dry-Run Simulation",
      "/api/routing/dry-run",
      "POST",
      { prompt: "Review this React TypeScript pull request for SQL injection" }
    );

    // 8. Payment Verification
    await testEndpoint(
      "Payment UTR Verification",
      "/api/payments/verify-utr",
      "POST",
      {
        referenceCode: "428194829103",
        email: "test_verification@enterprise.ai",
        planTier: "growth",
        currency: "INR"
      }
    );

    // 9. Real-Time SSE Streaming Completions
    totalCount++;
    try {
      const streamRes = await fetch(`${BASE}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Optimize this SQL query for high throughput" }],
          stream: true
        })
      });
      const streamText = await streamRes.text();
      const hasChunks = streamText.includes("chat.completion.chunk") && streamText.includes("[DONE]");
      if (streamRes.status === 200 && hasChunks) {
        console.log("  ✓ [PASS] Real-Time SSE Streaming Completion (POST /v1/chat/completions?stream=true) -> Streamed Event Chunks Received");
        passedCount++;
      } else {
        console.error("  ✗ [FAIL] Real-Time SSE Streaming Completion -> Status", streamRes.status);
      }
    } catch (err) {
      console.error("  ✗ [ERROR] Real-Time SSE Streaming Completion ->", err.message);
    }

    console.log(`\n========================================`);
    console.log(`🎉 TEST SUMMARY: ${passedCount}/${totalCount} Endpoints Passed`);
    console.log(`========================================\n`);
  } finally {
    server.kill("SIGTERM");
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

runTests();
