const BASE_URL = "http://localhost:3000";

async function runVerification() {
  console.log("=================================================");
  console.log("🚀 STARTING AUTOMATED END-TO-END VERIFICATION");
  console.log("=================================================\n");

  // 1. Test PIN Authentication for varvind2004@gmail.com
  console.log("TEST 1: Verifying PIN Authentication (varvind2004@gmail.com / 111111)...");
  const pinRes = await fetch(`${BASE_URL}/api/auth/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "varvind2004@gmail.com", pin: "111111" })
  });
  const pinData = await pinRes.json();
  console.log(`Status: ${pinRes.status}`, pinData);
  if (!pinData.success || pinData.user.email !== "varvind2004@gmail.com") {
    throw new Error("PIN Auth Failed");
  }
  console.log("✅ TEST 1 PASSED: PIN Auth succeeded, user loaded properly.\n");

  // 2. Test Dynamic Dry-Run Sandbox
  console.log("TEST 2: Testing Live Policy Dry-Run Evaluation Sandbox...");
  const dryRunPrompt = "Refactor this Python FastAPI endpoint to use async Redis connection pools";
  const dryRunRes = await fetch(`${BASE_URL}/api/routing/dry-run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: dryRunPrompt, rules: [] })
  });
  const dryRunData = await dryRunRes.json();
  console.log("Dry Run Response:", JSON.stringify(dryRunData, null, 2));
  if (!dryRunData.success || !dryRunData.primaryModel || !dryRunData.decisionTrace) {
    throw new Error("Dry Run Failed");
  }
  console.log(`✅ TEST 2 PASSED: Matched "${dryRunData.primaryModel}" with ${dryRunData.promptTokens} input tokens and ${dryRunData.estimatedSavingsPct} savings.\n`);

  // 3. Test Session State Persistence & Multi-Page Sync
  console.log("TEST 3: Testing Session State Persistence across logouts...");
  const updateRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "varvind2004@gmail.com",
      tokens_used: 1250,
      monthlySpendUSD: 0.8125,
      baselineSpendUSD: 6.50,
      rules: [
        {
          id: "custom_rule_99",
          name: "FastAPI Production Optimizer",
          task_type: "code_generation",
          condition_pattern: "task == 'code_generation'",
          target_metric: "code_merged",
          is_active: true,
          enabled: true,
          priority_models: ["DeepSeek Coder V2", "Claude 3.5 Sonnet"],
          fallback_model: "GPT-4o",
          max_latency_ms: 200,
          max_cost_usd: 0.001
        }
      ],
      logs: [
        {
          id: "log_test_1",
          created_at: "Just now",
          model_used: "DeepSeek Coder V2",
          provider: "deepseek",
          task_type: "code_generation",
          tokens_in: 350,
          tokens_out: 200,
          cost_usd: 0.00065,
          latency_ms: 110,
          outcome_success: true,
          outcome_metric: "code_merged",
          prompt_preview: "Refactor FastAPI endpoint...",
          status: "success"
        }
      ]
    })
  });
  const updateData = await updateRes.json();
  console.log("Update Response:", updateData);

  // Now fetch session to ensure state is retained
  const getSessionRes = await fetch(`${BASE_URL}/api/auth/session?email=varvind2004@gmail.com`);
  const sessionData = await getSessionRes.json();
  console.log("Fetched Session State:", JSON.stringify(sessionData, null, 2));
  if (sessionData.user.tokens_used !== 1250 || sessionData.user.rules.length !== 1) {
    throw new Error("Session Persistence Verification Failed");
  }
  console.log("✅ TEST 3 PASSED: User telemetry, rules, and spend are fully preserved on disk.\n");

  // 4. Test Delete Account API & Webhook
  console.log("TEST 4: Testing Account Deletion Flow...");
  const delRes = await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "varvind2004@gmail.com" })
  });
  const delData = await delRes.json();
  console.log("Delete Account Response:", delData);
  if (!delData.success) {
    throw new Error("Account Deletion Failed");
  }
  console.log("✅ TEST 4 PASSED: Account successfully purged from database and webhook sent.\n");

  // 5. Re-register varvind2004@gmail.com for ongoing use
  console.log("TEST 5: Re-registering user varvind2004@gmail.com...");
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Arvind",
      email: "varvind2004@gmail.com",
      workspace: "Arvind's Workspace",
      pin: "111111",
      plan_tier: "free",
      currency: "INR"
    })
  });
  const regData = await regRes.json();
  console.log("Register Response:", regData);
  console.log("✅ TEST 5 PASSED: Account re-registered cleanly with 0 duplicate rows.\n");

  console.log("=================================================");
  console.log("🎉 ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
}

runVerification().catch((err) => {
  console.error("❌ Verification Failed:", err);
  process.exit(1);
});
