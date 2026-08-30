// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 14 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-054 through WF-056 (Benchmark Domains, Session Resilience, Profile Mutation)
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

async function runRun14TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 14 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  // 1. Test WF-054: Benchmark Parallel Evaluator across Domains
  console.log("--- Testing WF-054: Multi-Domain Benchmark Evaluator ---");
  const evalDomains = ["code_generation", "customer_support", "sales_email", "complex_reasoning"];
  for (const domain of evalDomains) {
    const evalRes = await fetch(`${BASE_URL}/api/benchmarks/eval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_type: domain })
    });
    const evalData = await evalRes.json();
    assert(evalData.success && evalData.testedTask === domain, `Evaluated benchmark for ${domain}`, `Models: ${evalData.totalAuditedModels}`);
    assert(evalData.results && evalData.results.length >= 5, `All 5 frontier models scored for ${domain}`, `Latency: ${evalData.averageBatchLatencyMs}ms`);
  }

  // 2. Test WF-055: Session POST Safe Payload Resilience
  console.log("\n--- Testing WF-055: Session POST Safe Resilience ---");
  const emptySessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ""
  });
  assert(emptySessionRes.status === 400, "Empty session POST rejected with HTTP 400", `Status: ${emptySessionRes.status}`);

  // 3. Test WF-056: User Profile & Workspace Mutation
  console.log("\n--- Testing WF-056: User Profile & Workspace Mutation ---");
  const testUserEmail = `profile_mod_${Date.now()}@finops.org`;
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Initial Name",
      email: testUserEmail,
      workspace: "Initial Workspace",
      plan_tier: "starter",
      pin: "112233"
    })
  });

  const updateProfileRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testUserEmail,
      name: "Updated Principal Architect",
      workspace: "Enterprise Quantum Org"
    })
  });
  const updateProfileData = await updateProfileRes.json();
  assert(updateProfileData.success, "Profile updated successfully via session POST", updateProfileData.user?.name);
  assert(updateProfileData.user?.name === "Updated Principal Architect", "Display name updated to new value", updateProfileData.user?.name);
  assert(updateProfileData.user?.workspace === "Enterprise Quantum Org", "Workspace updated to new organization", updateProfileData.user?.workspace);

  // Clean up test account
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testUserEmail })
  });

  console.log("\n================================================================");
  console.log(`📊 RUN 14 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun14TestSuite();
