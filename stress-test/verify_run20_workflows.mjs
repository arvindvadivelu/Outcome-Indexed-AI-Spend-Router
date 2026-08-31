// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 20 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-073 through WF-075 (Rule Priority Ordering, Rules Mutation, Delete Account Safety)
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

async function runRun20TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 20 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-073: Rule Priority Reordering via session API
  console.log("--- Testing WF-073: Routing Rule Priority Ordering & Session Sync ---");
  const testEmail = "varvind2004@gmail.com";
  const updatedRules = [
    {
      id: "rule_sales_auto",
      name: "High-Converting Sales Pitch Routing",
      task_type: "sales_email",
      condition_pattern: "outreach",
      target_metric: "reply_rate",
      priority_models: ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"],
      fallback_model: "GPT-4o",
      cost_ceiling_usd: 0.0045,
      max_latency_ms: 350,
      is_active: true,
      enabled: true
    }
  ];

  const syncRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, rules: updatedRules })
  });
  const syncData = await syncRes.json();
  assert(syncData.success === true, "Routing rules successfully synced to session database", `Rules count: ${syncData.user?.rules?.length}`);

  const getRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const getData = await getRes.json();
  assert(getData.user?.rules?.[0]?.priority_models?.[0] === "Claude 3.5 Sonnet", "Primary priority model verified in session persistence", getData.user?.rules?.[0]?.priority_models?.[0]);
  assert(getData.user?.rules?.[0]?.priority_models?.[1] === "DeepSeek-V3", "Secondary fallback priority model preserved", getData.user?.rules?.[0]?.priority_models?.[1]);

  // 2. Test WF-074: Routing Policy Dry-Run with Prioritized Model Chain
  console.log("\n--- Testing WF-074: Dry-Run Inference on Prioritized Rule ---");
  const dryRunRes = await fetch(`${BASE_URL}/api/routing/dry-run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Draft an enterprise sales outreach email offering a 30% pilot discount on LLM spend optimization",
      rules: getData.user?.rules
    })
  });
  const dryRunData = await dryRunRes.json();
  assert(dryRunData.success === true, "Dry-run simulation executed with persisted rule", dryRunData.matchedRule);
  assert(dryRunData.primaryModel === "Claude 3.5 Sonnet", "Selected primary prioritized model", dryRunData.primaryModel);

  // 3. Test WF-075: Safe Delete Account Endpoint Body Parsing
  console.log("\n--- Testing WF-075: Delete Account Safe Body Parsing ---");
  const deleteEmptyRes = await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  assert(deleteEmptyRes.status === 400, "Empty POST to delete-account returns HTTP 400 validation error", `Status: ${deleteEmptyRes.status}`);

  console.log("\n================================================================");
  console.log(`📊 RUN 20 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun20TestSuite();
