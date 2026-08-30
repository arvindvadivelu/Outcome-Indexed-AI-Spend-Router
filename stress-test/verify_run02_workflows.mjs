// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 02 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-008 through WF-014 (Integrations, API Keys, Policies, Logs, SLA CSV)
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

async function runRun02TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 02 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  const testEmail = `run02_${Date.now()}@routerflow.io`;

  // 1. Register a test user
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Run 02 Auditor",
      email: testEmail,
      workspace: "Run 02 Lab",
      plan_tier: "growth",
      pin: "222333"
    })
  });
  const regData = await regRes.json();
  assert(regData.success, "Test user registered for Run 02 audit", regData.user?.id);

  // 2. Test WF-009: API Keys Session Persistence
  console.log("\n--- Testing WF-009: API Keys Creation & Session Sync ---");
  const testApiKey = {
    id: `key_${Date.now()}`,
    name: "Production Gateway Key",
    key_prefix: "oir_live_8f9a2b",
    full_key: "oir_live_8f9a2b1c3d4e5f6a",
    environment: "live",
    rate_limit: 1200,
    rate_limit_rpm: 1200,
    created_at: "Just now",
    last_used_at: "Never",
    is_active: true,
    ip_restrictions: "10.0.0.0/16"
  };

  const syncKeysRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      apiKeys: [testApiKey]
    })
  });
  const syncKeysData = await syncKeysRes.json();
  assert(syncKeysData.success, "Saved API key to backend session");

  const getKeysRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const getKeysData = await getKeysRes.json();
  assert(getKeysData.user?.apiKeys?.length === 1, "Persisted API key restored from database", getKeysData.user?.apiKeys?.[0]?.name);
  assert(getKeysData.user?.apiKeys?.[0]?.rate_limit_rpm === 1200, "API key rate limit matches 1200 RPM", getKeysData.user?.apiKeys?.[0]?.rate_limit_rpm);

  // 3. Test WF-010: Routing Policy Synthesis & Session Sync
  console.log("\n--- Testing WF-010 & WF-011: Policy Creation & Rule Persistence ---");
  const synthRes = await fetch(`${BASE_URL}/api/routing/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "Route customer support FAQ to Groq LPU with <100ms latency constraint" })
  });
  const synthData = await synthRes.json();
  assert(synthData.success && synthData.rule, "AI Synthesizer generated valid routing rule", synthData.rule?.name);

  const customRule = {
    id: "rule_test_manual_101",
    name: "Customer Support LPU Fast Path",
    task_type: "customer_support",
    condition_pattern: "task == 'customer_support' && latency <= 100ms",
    target_metric: "ticket_resolved",
    is_active: true,
    enabled: true,
    priority_models: ["Groq Llama 3.3", "DeepSeek-V3"],
    models_priority: ["Groq Llama 3.3", "DeepSeek-V3"],
    fallback_model: "GPT-4o",
    max_latency_ms: 100,
    max_cost_usd: 0.0002,
    min_win_rate: 0.94,
    strategy: "outcome_optimized",
    ai_synthesized: true
  };

  const syncRulesRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      rules: [synthData.rule, customRule]
    })
  });
  const syncRulesData = await syncRulesRes.json();
  assert(syncRulesData.success, "Saved routing rules to backend session");

  const getRulesRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const getRulesData = await getRulesRes.json();
  assert(getRulesData.user?.rules?.length === 2, "Persisted 2 routing rules restored from database", `${getRulesData.user?.rules?.length} rules`);

  // 4. Test WF-013: Logs Outcome Rating Feedback Persistence
  console.log("\n--- Testing WF-013: Log Outcome Rating Feedback Persistence ---");
  const testLog = {
    id: "req_audit_test_991",
    created_at: "Just now",
    model_used: "DeepSeek-V3",
    provider: "deepseek",
    task_type: "customer_support",
    tokens_in: 320,
    tokens_out: 180,
    cost_usd: 0.00065,
    cost_inr: 0.056,
    latency_ms: 88,
    outcome_success: true, // User voted Win
    outcome_metric: "ticket_resolved",
    prompt_preview: "How do I configure custom webhook HMAC signatures?",
    cached_hit: false,
    fallback_triggered: false,
    status: "success"
  };

  const syncLogsRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      logs: [testLog]
    })
  });
  const syncLogsData = await syncLogsRes.json();
  assert(syncLogsData.success, "Saved rated outcome log to backend session");

  const getLogsRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const getLogsData = await getLogsRes.json();
  assert(getLogsData.user?.logs?.length === 1, "Persisted log restored from database", getLogsData.user?.logs?.[0]?.id);
  assert(getLogsData.user?.logs?.[0]?.outcome_success === true, "Log outcome rating persists as true (Win)", getLogsData.user?.logs?.[0]?.outcome_success);

  // 5. Test WF-014: Billing Forecaster API Integration
  console.log("\n--- Testing WF-014: Billing Forecast Calculation ---");
  const forecastRes = await fetch(`${BASE_URL}/api/billing/forecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      monthly_spend: 340.50,
      monthly_budget: 600.00
    })
  });
  const forecastData = await forecastRes.json();
  assert(forecastData.success, "Billing forecast API returned success");
  assert(typeof forecastData.projected_invoice_usd === "number", "Projected invoice USD is valid number", `$${forecastData.projected_invoice_usd}`);
  assert(typeof forecastData.projected_savings_usd === "number", "Projected savings USD is valid number", `$${forecastData.projected_savings_usd}`);

  // 6. Cleanup test account
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail })
  });

  console.log("\n================================================================");
  console.log(`📊 RUN 02 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun02TestSuite();
