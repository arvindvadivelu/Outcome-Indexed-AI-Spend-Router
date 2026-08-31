// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 17 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-064 through WF-066 (Sheet Sync, Webhook Ingress, Benchmark Task Defaults)
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

async function runRun17TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 17 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-064: Sheet Sync Safe Body Parsing
  console.log("--- Testing WF-064: Direct Google Sheet Sync Safe Body ---");
  const sheetEmptyRes = await fetch(`${BASE_URL}/api/auth/sync-sheet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  const sheetData = await sheetEmptyRes.json();
  assert(sheetEmptyRes.status === 200 && sheetData.success === true, "Empty body to sync-sheet safely handled with default record", sheetData.message);

  // 2. Test WF-065: Webhook Dispatch Safe Body Parsing
  console.log("\n--- Testing WF-065: Webhooks Dispatch Safe Body ---");
  const webhookEmptyRes = await fetch(`${BASE_URL}/api/webhooks/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  const webhookData = await webhookEmptyRes.json();
  assert(webhookEmptyRes.status === 200 && webhookData.success === true, "Empty body to webhooks dispatch safely handled with default event", webhookData.event_payload?.event);
  assert(webhookData.signature_header && webhookData.signature_header.includes("v1="), "Generated valid HMAC header for fallback dispatch", webhookData.signature_header);

  // 3. Test WF-066: Benchmark Task Type Fallback
  console.log("\n--- Testing WF-066: Benchmark Evaluation Task Fallback ---");
  const benchEmptyRes = await fetch(`${BASE_URL}/api/benchmarks/eval`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  const benchData = await benchEmptyRes.json();
  assert(benchEmptyRes.status === 200 && benchData.testedTask === "code_generation", "Empty body to benchmark eval defaults to code_generation", benchData.testedTask);
  assert(benchData.results && benchData.results.length === 5, "Evaluated 5 frontier models on default task", `Latency: ${benchData.averageBatchLatencyMs}ms`);

  console.log("\n================================================================");
  console.log(`📊 RUN 17 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun17TestSuite();
