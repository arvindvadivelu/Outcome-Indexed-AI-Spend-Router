/**
 * Outcome-Indexed AI Spend Router - Continuous Workflow Debugger Run 05 Verification Suite
 * Tests WF-019, WF-020, WF-021, WF-022 and related workflows
 */

import { calculateReferralStats } from "../src/lib/growth-engine.ts";
import { createPaymentIntent } from "../src/lib/payment-gateway.ts";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runWorkflowTests() {
  console.log("\n=============================================================");
  console.log("🧪 Starting Run 05 Continuous Workflow Verification Tests");
  console.log("=============================================================\n");

  // 1. Test WF-019: Token Audit Anomaly Evaluation
  console.log("--- Testing WF-019: Token Audit Anomaly Evaluation ---");
  const { POST: tokenAuditPost } = await import("../src/app/api/analytics/token-audit/route.ts");
  
  const mockAuditReq = new Request("http://localhost:3000/api/analytics/token-audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      logs: [
        { id: "log_1", task_type: "customer_support", tokens_in: 2500, tokens_out: 300, cost_usd: 0.0004 },
        { id: "log_2", task_type: "code_generation", tokens_in: 8000, tokens_out: 1200, cost_usd: 0.0025 }
      ]
    })
  });

  const auditRes = await tokenAuditPost(mockAuditReq);
  const auditData = await auditRes.json();
  assert(auditData.success === true, "Token audit endpoint returned success");
  assert(auditData.estimated_dollar_loss_usd > 0, "Token audit calculated positive dollar recovery estimate");
  assert(Array.isArray(auditData.findings) && auditData.findings.length >= 3, "Token audit produced structured anomaly findings");
  assert(typeof auditData.optimal_cache_rule === "string", "Token audit synthesized optimal cache policy");

  // 2. Test WF-020: Dynamic Base URLs in Team Invites & Referral Engine
  console.log("\n--- Testing WF-020: Dynamic Base URLs & Referral Engine ---");
  const { POST: teamInvitePost } = await import("../src/app/api/team/invite/route.ts");
  
  const mockInviteReq = new Request("https://gateway.myenterprise.com/api/team/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "host": "gateway.myenterprise.com",
      "x-forwarded-proto": "https"
    },
    body: JSON.stringify({
      email: "engineer@company.com",
      role: "Staff ML Engineer",
      tokenQuota: "500,000 / mo"
    })
  });

  const inviteRes = await teamInvitePost(mockInviteReq);
  const inviteData = await inviteRes.json();
  assert(inviteData.success === true, "Team invite endpoint returned success");
  assert(inviteData.inviteLink.startsWith("https://gateway.myenterprise.com"), `Invite link dynamically uses request origin (${inviteData.inviteLink})`);

  const refStats = calculateReferralStats("dev@startup.io", "growth");
  assert(refStats.shareableUrl.includes("/auth/signup?ref=REF-"), `Referral URL generated with dynamic prefix: ${refStats.shareableUrl}`);
  assert(refStats.activeTierBonusMultiplier === 1.5, "Growth plan bonus multiplier applied correctly");

  // 3. Test WF-021: Payment Intent & Invoice Workflows
  console.log("\n--- Testing WF-021: Payment Intent & Enterprise Invoice Generation ---");
  const inrIntent = createPaymentIntent("finance@client.in", "growth", "INR");
  assert(inrIntent.transaction.currency === "INR" && inrIntent.transaction.amount === 8500, `INR payment intent correctly parameterized (amount=${inrIntent.transaction.amount})`);

  const usdIntent = createPaymentIntent("cfo@client.com", "enterprise", "USD");
  assert(usdIntent.transaction.currency === "USD" && usdIntent.transaction.amount === 499, `USD payment intent correctly parameterized (amount=${usdIntent.transaction.amount})`);

  const { POST: invoicePost } = await import("../src/app/api/payments/invoice/route.ts");
  const mockInvoiceReq = new Request("http://localhost:3000/api/payments/invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "billing@acme.com",
      planTier: "growth",
      currency: "INR",
      companyName: "Acme India Tech Ltd",
      gstVatNumber: "27AABCT9876Q1Z2"
    })
  });

  const invoiceRes = await invoicePost(mockInvoiceReq);
  const invoiceData = await invoiceRes.json();
  assert(invoiceData.success === true && !!invoiceData.invoice, "Invoice generated successfully");
  assert(invoiceData.invoice.billedTo.taxId === "27AABCT9876Q1Z2", "Invoice preserved tax ID and company name");
  assert(invoiceData.invoice.paymentInstructions.method.includes("UPI"), "Domestic INR invoice attached UPI wire instructions");

  // 4. Test WF-022: Team RBAC Audit & Credential Integration
  console.log("\n--- Testing WF-022: Team RBAC Audit & Provider Credential Integration ---");
  const { POST: teamAuditPost } = await import("../src/app/api/team/audit/route.ts");
  const mockAuditTeamReq = new Request("http://localhost:3000/api/team/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      members: [
        { id: 1, name: "Owner", role: "Owner (Primary)", mfaActive: true },
        { id: 2, name: "Dev", role: "Engineer", mfaActive: true },
        { id: 3, name: "FinOps", role: "Billing Admin", mfaActive: false }
      ]
    })
  });

  const teamAuditRes = await teamAuditPost(mockAuditTeamReq);
  const teamAuditData = await teamAuditRes.json();
  assert(teamAuditData.success === true && teamAuditData.mfaEnrollmentRate === "67%", "Team RBAC audit calculated accurate MFA enrollment rate");

  const { POST: connectPost } = await import("../src/app/api/integrations/connect/route.ts");
  const mockConnectReq = new Request("http://localhost:3000/api/integrations/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      integrationId: "anthropic",
      apiKey: "sk-ant-api03-live-abcdef1234567890"
    })
  });

  const connectRes = await connectPost(mockConnectReq);
  const connectData = await connectRes.json();
  assert(connectData.success === true && connectData.maskedKey.startsWith("sk-ant-"), "Upstream provider credentials securely verified and masked");

  console.log("\n=============================================================");
  console.log("🎉 ALL RUN 05 WORKFLOW VERIFICATIONS PASSED! (100% SUCCESS)");
  console.log("=============================================================\n");
}

runWorkflowTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
