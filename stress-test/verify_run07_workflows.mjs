// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 07 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-033 through WF-035 (Log Inspection Trace, Direct Google Sheet Sync, Contact Inquiry)
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

async function runRun07TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 07 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-033: Log Inspection Trace API
  console.log("--- Testing WF-033: Log Inspection & Micro-SLA Waterfall Analysis ---");
  const inspectRes = await fetch(`${BASE_URL}/api/logs/inspect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      log: {
        id: "req_audit_trace_881",
        model_used: "DeepSeek-V3",
        task_type: "code_generation",
        latency_ms: 78,
        cost_usd: 0.00042,
        outcome_metric: "code_merged"
      }
    })
  });
  const inspectData = await inspectRes.json();
  assert(inspectData.success, "Log inspection trace evaluated successfully", inspectData.requestId);
  assert(inspectData.analysisSteps?.length === 4, "Generated 4-stage audit trace analysis", `${inspectData.analysisSteps?.length} steps`);
  assert(inspectData.costSavedUsd > 0, "Calculated cost savings vs baseline", `$${inspectData.costSavedUsd}`);

  // 2. Test WF-034: Direct Google Sheet Sync Route
  console.log("\n--- Testing WF-034: Direct Google Sheet Sync Route ---");
  const syncRes = await fetch(`${BASE_URL}/api/auth/sync-sheet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "AUDIT_VERIFICATION_TEST",
      name: "FinOps Officer",
      email: "finops_lead@outcomerouter.ai",
      workspace: "Audit Production Lab",
      plan_tier: "Enterprise",
      monthly_token_quota: 2000000,
      currency: "USD",
      auth_method: "INTEGRATION_TEST"
    })
  });
  const syncData = await syncRes.json();
  assert(syncData.success, "Auth event processed and synced to Google Sheets ledger", syncData.message);
  assert(syncData.sheetId === "1F6wOcNxgnQF8X2VXgVxXImFst8sC_wwMdOt95hFe1J8", "Matched target Google Sheet ID", syncData.sheetId);

  // 3. Test WF-035: Public Contact Inquiry Dispatch
  console.log("\n--- Testing WF-035: Public Enterprise Contact Inquiry Dispatch ---");
  const contactRes = await fetch(`${BASE_URL}/api/auth/sync-sheet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "CONTACT_INQUIRY",
      name: "Prospective Enterprise Client",
      email: "cto@globalscale.co",
      workspace: "Global Scale Co",
      plan_tier: "Enterprise Custom",
      monthly_token_quota: 10000000,
      currency: "USD",
      auth_method: "SPEND_TIER_100K+"
    })
  });
  const contactData = await contactRes.json();
  assert(contactData.success, "Enterprise contact lead captured and queued for sales routing", contactData.record?.action);

  console.log("\n================================================================");
  console.log(`📊 RUN 07 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun07TestSuite();
