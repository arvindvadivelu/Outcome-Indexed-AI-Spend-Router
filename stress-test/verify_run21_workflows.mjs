// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 21 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-076 through WF-078 (SLA Breach Refund, SLA Compliant Nonce, Logs Pagination)
// ==============================================================================

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message, detail = "") {
  if (condition) {
    console.log(`✅ [PASS] ${message}${detail ? ` — ${detail}` : ""}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function runRun21TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 21 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-076: Micro-SLA Latency Contract Breach & Auto-Refund
  console.log("--- Testing WF-076: SLA Breach Detection & Escrow Auto-Refund ---");
  const breachedLogRes = await fetch(`${BASE_URL}/api/logs/inspect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      log: {
        id: "oir_breach_test_01",
        model_used: "GPT-4o",
        task_type: "code_generation",
        latency_ms: 380, // Breaches 250ms SLA ceiling by 130ms
        cost_usd: 0.0028,
        outcome_metric: "code_merged"
      }
    })
  });
  const breachedData = await breachedLogRes.json();
  assert(breachedData.success === true, "Breached log trace successfully evaluated", breachedData.requestId);
  const step3Breached = breachedData.analysisSteps?.find((s) => s.step.includes("Micro-SLA"));
  assert(step3Breached?.verdict.includes("exceeded 250ms SLA ceiling by 130ms"), "Identified exact 130ms SLA breach overshoot", step3Breached?.verdict);
  assert(step3Breached?.verdict.includes("Auto-refund of $0.00130 escrow credit dispatched"), "Calculated and dispatched precise escrow credit refund", step3Breached?.verdict);

  // 2. Test WF-077: Compliant Micro-SLA Nonce Verification (0ms Penalty)
  console.log("\n--- Testing WF-077: Compliant SLA Nonce Verification ---");
  const compliantLogRes = await fetch(`${BASE_URL}/api/logs/inspect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      log: {
        id: "oir_compliant_test_02",
        model_used: "Groq Llama 3.3",
        task_type: "customer_support",
        latency_ms: 82, // Compliant with 250ms SLA ceiling
        cost_usd: 0.00018,
        outcome_metric: "ticket_resolved"
      }
    })
  });
  const compliantData = await compliantLogRes.json();
  assert(compliantData.success === true, "Compliant log trace evaluated", compliantData.requestId);
  const step3Compliant = compliantData.analysisSteps?.find((s) => s.step.includes("Micro-SLA"));
  assert(step3Compliant?.verdict.includes("well within the 250ms target ceiling (0ms breach penalty)"), "Confirmed 0ms breach penalty for sub-250ms latency", step3Compliant?.verdict);

  // 3. Test WF-078: Dynamic Pagination Query Parameter Limits
  console.log("\n--- Testing WF-078: Logs Inspect GET Route Dynamic Pagination ---");
  const getLogsRes = await fetch(`${BASE_URL}/api/logs/inspect?limit=10`);
  const getLogsData = await getLogsRes.json();
  assert(getLogsData.success === true, "GET /api/logs/inspect returned successfully", `Count: ${getLogsData.totalLogs}`);
  assert(getLogsData.logs?.length === 10, "Correctly bound limit parameter to 10 logs", `Returned length: ${getLogsData.logs?.length}`);

  console.log("\n================================================================");
  console.log(`📊 RUN 21 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun21TestSuite();
