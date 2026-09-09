/**
 * Outcome-Indexed AI Spend Router - Continuous Workflow Debugger Run 07 Verification Suite
 * Tests WF-027, WF-028, WF-029, WF-030 and growth/audit workflows
 */

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runWorkflowTests() {
  console.log("\n=============================================================");
  console.log("🧪 Starting Run 07 Continuous Workflow Verification Tests");
  console.log("=============================================================\n");

  // 1. Test WF-027: Referral Credit Application
  console.log("--- Testing WF-027: Viral Referral Credit Application ---");
  const { GET: referralsGet, POST: referralsPost } = await import("../src/app/api/growth/referrals/route.ts");
  
  const mockRefGetReq = new Request("http://localhost:3000/api/growth/referrals?email=growth@acme.ai");
  const refGetRes = await referralsGet(mockRefGetReq);
  const refGetData = await refGetRes.json();
  assert(refGetData.success === true && typeof refGetData.referralCode === "string", "Referral stats retrieved successfully");

  const mockRefPostReq = new Request("http://localhost:3000/api/growth/referrals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "growth@acme.ai",
      referralCode: refGetData.referralCode
    })
  });
  const refPostRes = await referralsPost(mockRefPostReq);
  const refPostData = await refPostRes.json();
  assert(refPostData.success === true && refPostData.bonusTokensAwarded === 50000, "Referral code applied and 50,000 bonus tokens awarded");

  // 2. Test WF-028: Enterprise FinOps ROI Calculator
  console.log("\n--- Testing WF-028: Enterprise FinOps ROI Calculator ---");
  const { POST: roiCalcPost } = await import("../src/app/api/growth/roi-calculator/route.ts");
  
  const mockRoiReq = new Request("http://localhost:3000/api/growth/roi-calculator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      monthlyInferenceCalls: 1000000,
      averagePromptTokens: 800,
      averageCompletionTokens: 300
    })
  });
  const roiRes = await roiCalcPost(mockRoiReq);
  const roiData = await roiRes.json();
  assert(roiData.success === true && !!roiData.report, "ROI calculator returned projection report");
  assert(roiData.report.monthlySavingsUsd > 0 && roiData.report.annualSavingsUsd === roiData.report.monthlySavingsUsd * 12, "ROI savings projections calculated accurately");
  assert(Array.isArray(roiData.report.taskBreakdown) && roiData.report.taskBreakdown.length === 4, "Task breakdown contains all 4 core routing domains");

  // 3. Test WF-029: Growth A/B Experiments & Badges
  console.log("\n--- Testing WF-029: Router A/B Experiments & Badge Notifications ---");
  const { GET: expGet } = await import("../src/app/api/growth/experiments/route.ts");
  const mockExpReq = new Request("http://localhost:3000/api/growth/experiments?domain=code_generation");
  const expRes = await expGet(mockExpReq);
  const expData = await expRes.json();
  assert(expData.success === true && !!expData.experiment, "A/B routing experiment data retrieved successfully");

  const { GET: badgesGet } = await import("../src/app/api/growth/badges/route.ts");
  const mockBadgesReq = new Request("http://localhost:3000/api/growth/badges?email=engineer@acme.ai");
  const badgesRes = await badgesGet(mockBadgesReq);
  const badgesData = await badgesRes.json();
  assert(badgesData.success === true, "Badge notification summary retrieved successfully");

  // 4. Test WF-030: Google Sheet Sync Audit Ledger
  console.log("\n--- Testing WF-030: Google Sheet Sync Audit Ledger ---");
  const { POST: syncSheetPost } = await import("../src/app/api/auth/sync-sheet/route.ts");
  const mockSyncReq = new Request("http://localhost:3000/api/auth/sync-sheet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "CONTACT_INQUIRY",
      name: "Dev Lead",
      email: "lead@enterprise.corp",
      workspace: "Enterprise Corp",
      plan_tier: "Enterprise",
      monthly_token_quota: 5000000,
      currency: "USD",
      auth_method: "SPEND_TIER_100K+"
    })
  });
  const syncRes = await syncSheetPost(mockSyncReq);
  const syncData = await syncRes.json();
  assert(syncData.success === true && syncData.record.action === "CONTACT_INQUIRY", "Google Sheet sync ledger formatted and processed event");

  console.log("\n=============================================================");
  console.log("🎉 ALL RUN 07 WORKFLOW VERIFICATIONS PASSED! (100% SUCCESS)");
  console.log("=============================================================\n");
}

runWorkflowTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
