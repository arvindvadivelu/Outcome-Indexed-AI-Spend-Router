// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 19 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-070 through WF-072 (Dry-Run Safe Body, V1 Completions Body Guard, Dry-Run Rules)
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

async function runRun19TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 19 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-070: Dry-Run Safe Body Handling
  console.log("--- Testing WF-070: Dry-Run Safe Body Parsing ---");
  const dryRunEmptyRes = await fetch(`${BASE_URL}/api/routing/dry-run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  assert(dryRunEmptyRes.status === 400, "Empty POST to dry-run returns HTTP 400 validation error", `Status: ${dryRunEmptyRes.status}`);

  // 2. Test WF-071: V1 Chat Completions Empty Body Handling
  console.log("\n--- Testing WF-071: V1 Chat Completions Safe Body Parsing ---");
  const v1EmptyRes = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  const v1EmptyData = await v1EmptyRes.json();
  assert(v1EmptyRes.status === 400, "Empty POST to /v1/chat/completions returns HTTP 400", `Status: ${v1EmptyRes.status}`);
  assert(v1EmptyData.error?.message?.includes("messages"), "Returns clear error regarding missing messages array", v1EmptyData.error?.message);

  // 3. Test WF-072: Dry-Run Simulation Intent & Model Ranking
  console.log("\n--- Testing WF-072: Dry-Run Simulation Execution ---");
  const dryRunValidRes = await fetch(`${BASE_URL}/api/routing/dry-run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Write a high-performance Redis cache connection pooling script in TypeScript with error backoff",
      rules: [
        {
          id: "rule_code_fast",
          name: "Fast Code Generation Rule",
          task_type: "code_generation",
          condition_pattern: "typescript",
          target_metric: "syntax_validity",
          priority_models: ["DeepSeek-V3", "Groq Llama 3.3 70B"],
          fallback_model: "GPT-4o",
          enabled: true,
          is_active: true
        }
      ]
    })
  });
  const dryRunData = await dryRunValidRes.json();
  assert(dryRunData.success === true, "Dry-run execution completed", `Winning Model: ${dryRunData.primaryModel}`);
  assert(dryRunData.matchedRule === "Fast Code Generation Rule", "Custom rule matched successfully", dryRunData.matchedRule);
  assert(parseInt(dryRunData.estimatedSavingsPct) > 0, "Calculated non-zero cost savings vs GPT-4o control", dryRunData.estimatedSavingsPct);
  assert(dryRunData.decisionTrace && dryRunData.decisionTrace.length === 4, "Generated 4-stage decision trace", dryRunData.decisionTrace[0]?.step);

  console.log("\n================================================================");
  console.log(`📊 RUN 19 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun19TestSuite();
