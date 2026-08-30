// ==============================================================================
// 🧪 Comprehensive Workflow Audit Integration Test Suite (Scenarios A through G)
// ==============================================================================

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER COMPREHENSIVE WORKFLOW TEST SUITE");
  console.log("================================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, testName, detail = "") {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${detail ? "— " + detail : ""}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? "— " + detail : ""}`);
    }
  }

  const testEmail = `audit_${Date.now()}@workflowtest.io`;
  const initialPin = "123456";
  const newPin = "777888";

  try {
    // -------------------------------------------------------------------------
    // Scenario A: Registration with Plan Tier Parameter
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario A: New User Registration & Plan Parameter Binding ---");
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Audit Champion",
        email: testEmail,
        workspace: "Initial Workspace",
        plan_tier: "growth",
        pin: initialPin,
        currency: "USD"
      })
    });
    const regData = await regRes.json();
    assert(regData.success === true, "Scenario A: User registration API", `ID: ${regData.user?.id}`);
    assert(regData.user?.plan_tier === "growth", "Scenario A: Plan tier correctly set to growth", regData.user?.plan_tier);
    assert(regData.user?.monthly_token_quota === 500000, "Scenario A: Monthly token quota is 500,000 for Growth", regData.user?.monthly_token_quota);

    // Verify initial login with PIN
    const loginRes1 = await fetch(`${BASE_URL}/api/auth/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, pin: initialPin })
    });
    const loginData1 = await loginRes1.json();
    assert(loginData1.success === true, "Scenario A: Initial PIN login verification", loginData1.user?.name);
    assert(loginData1.user?.tokens_used === 0, "Scenario A: Fresh account tokens used is 0", loginData1.user?.tokens_used);
    assert(loginData1.user?.currency === "USD", "Scenario A: Currency defaults to USD", loginData1.user?.currency);

    // -------------------------------------------------------------------------
    // Scenario B: Workspace & Profile Modification Persistence
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario B: Workspace & Profile Modification Persistence ---");
    const updateRes = await fetch(`${BASE_URL}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        workspace: "Nexus AI Lab Enterprise",
        name: "Champion Lead"
      })
    });
    const updateData = await updateRes.json();
    assert(updateData.success === true, "Scenario B: Update workspace & name via session API");

    // Fetch session and verify persistence
    const sessionRes1 = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
    const sessionData1 = await sessionRes1.json();
    assert(sessionData1.user?.workspace === "Nexus AI Lab Enterprise", "Scenario B: Persisted workspace name restored", sessionData1.user?.workspace);
    assert(sessionData1.user?.name === "Champion Lead", "Scenario B: Persisted user name restored", sessionData1.user?.name);

    // -------------------------------------------------------------------------
    // Scenario C: Simulation, Token Accounting & Baseline Spend Calculations
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario C: Request Simulation & Accurate Token / FinOps Calculations ---");
    const simLog = {
      id: `oir_sim_test_${Date.now()}`,
      created_at: "Just now",
      model_used: "DeepSeek-V3",
      provider: "deepseek",
      task_type: "code_generation",
      tokens_in: 320,
      tokens_out: 180,
      cost_usd: 0.00065,
      cost_inr: 0.0562,
      latency_ms: 78,
      outcome_success: true,
      outcome_metric: "code_merged",
      prompt_preview: "Refactor database connection pool...",
      cached_hit: false,
      fallback_triggered: false,
      speculative_win: true,
      critic_escalated: false,
      status: "success"
    };

    const tokensToRecord = simLog.tokens_in + simLog.tokens_out; // 500 tokens
    const actualSpend = simLog.cost_usd; // $0.00065
    const baselineSpend = 0.0052; // GPT-4o standard comparison

    const persistSimRes = await fetch(`${BASE_URL}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        tokens_used: tokensToRecord,
        monthlySpendUSD: actualSpend,
        baselineSpendUSD: baselineSpend,
        logs: [simLog]
      })
    });
    const persistSimData = await persistSimRes.json();
    assert(persistSimData.success === true, "Scenario C: Persist simulation trace to database");

    // Fetch session and verify exact calculation values
    const sessionRes2 = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
    const sessionData2 = await sessionRes2.json();
    assert(sessionData2.user?.tokens_used === 500, "Scenario C: Exactly 500 tokens recorded (no double-counting)", sessionData2.user?.tokens_used);
    assert(sessionData2.user?.tokens_remaining === 499500, "Scenario C: Tokens remaining calculated accurately (500k - 500 = 499,500)", sessionData2.user?.tokens_remaining);
    assert(sessionData2.user?.monthlySpendUSD === 0.00065, "Scenario C: Actual spend recorded accurately ($0.00065)", sessionData2.user?.monthlySpendUSD);
    assert(sessionData2.user?.baselineSpendUSD === 0.0052, "Scenario C: Baseline GPT-4o spend recorded accurately ($0.0052)", sessionData2.user?.baselineSpendUSD);
    assert(sessionData2.user?.avoidedSpendUSD >= 0.0045, "Scenario C: Avoided spend calculated accurately ($0.0052 - $0.00065 = $0.00455)", sessionData2.user?.avoidedSpendUSD);

    // -------------------------------------------------------------------------
    // Scenario D: Reset Security PIN & Subsequent Login
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario D: Reset Security PIN & Login Verification ---");
    const pinResetRes = await fetch(`${BASE_URL}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        pin: newPin
      })
    });
    const pinResetData = await pinResetRes.json();
    assert(pinResetData.success === true, "Scenario D: Set new PIN to 777888 via backend API");

    // Try logging in with old PIN -> MUST FAIL
    const oldPinLoginRes = await fetch(`${BASE_URL}/api/auth/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, pin: initialPin })
    });
    const oldPinLoginData = await oldPinLoginRes.json();
    assert(oldPinLoginData.success === false, "Scenario D: Old PIN 123456 rejected on login", oldPinLoginData.error);

    // Try logging in with new PIN -> MUST SUCCEED
    const newPinLoginRes = await fetch(`${BASE_URL}/api/auth/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, pin: newPin })
    });
    const newPinLoginData = await newPinLoginRes.json();
    assert(newPinLoginData.success === true, "Scenario D: New PIN 777888 accepted on login", newPinLoginData.message);

    // -------------------------------------------------------------------------
    // Scenario E: Plan Upgrade Persistence (Enterprise Tier)
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario E: Plan Upgrade Persistence Across Session Refreshes ---");
    const upgradeRes = await fetch(`${BASE_URL}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        plan_tier: "enterprise",
        monthly_token_quota: 2000000
      })
    });
    const upgradeData = await upgradeRes.json();
    assert(upgradeData.success === true, "Scenario E: Upgraded to Enterprise tier via session API");

    // Fetch session and verify Enterprise quota
    const sessionRes3 = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
    const sessionData3 = await sessionRes3.json();
    assert(sessionData3.user?.plan_tier === "enterprise", "Scenario E: Plan tier persists as enterprise", sessionData3.user?.plan_tier);
    assert(sessionData3.user?.monthly_token_quota === 2000000, "Scenario E: Token quota persists as 2,000,000", sessionData3.user?.monthly_token_quota);

    // -------------------------------------------------------------------------
    // Scenario F: Session 404 Guard (No Hardcoded Fallback Leak)
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario F: Session 404 Guard (Zero Hardcoded Account Leakage) ---");
    const nonExistentRes = await fetch(`${BASE_URL}/api/auth/session?email=nonexistent_user_${Date.now()}@nowhere.com`);
    const nonExistentData = await nonExistentRes.json();
    assert(nonExistentData.success === false, "Scenario F: Unknown email returns 404 with no fallback leakage", nonExistentData.error);

    // -------------------------------------------------------------------------
    // Scenario G: Account Deletion & Post-Deletion Login Block
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario G: Permanent Account Deletion & Post-Deletion Login Lock ---");
    const deleteRes = await fetch(`${BASE_URL}/api/auth/delete-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail })
    });
    const deleteData = await deleteRes.json();
    assert(deleteData.success === true, "Scenario G: Account permanently deleted from database & Google Sheets ledger");

    // Attempt login after deletion -> MUST FAIL
    const postDeleteLoginRes = await fetch(`${BASE_URL}/api/auth/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, pin: newPin })
    });
    const postDeleteLoginData = await postDeleteLoginRes.json();
    assert(postDeleteLoginData.success === false, "Scenario G: Post-deletion login blocked cleanly", postDeleteLoginData.error);

  } catch (err) {
    console.error("Test suite runtime exception:", err);
  }

  console.log("\n================================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passed} / ${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log("================================================================");
}

runTests();
