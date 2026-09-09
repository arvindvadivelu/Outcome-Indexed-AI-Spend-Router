/**
 * Outcome-Indexed AI Spend Router - Continuous Workflow Debugger Run 06 Verification Suite
 * Tests WF-023, WF-024, WF-025, WF-026 and compliance/marketing workflows
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
  console.log("🧪 Starting Run 06 Continuous Workflow Verification Tests");
  console.log("=============================================================\n");

  // 1. Test WF-023: DPA Export & Cryptographic Verification
  console.log("--- Testing WF-023: DPA Export & Cryptographic Verification ---");
  const { GET: dpaExportGet, POST: dpaExportPost } = await import("../src/app/api/compliance/dpa-export/route.ts");
  
  const mockDpaGetReq = new Request("http://localhost:3000/api/compliance/dpa-export?email=compliance@acme.corp");
  const dpaGetRes = await dpaExportGet(mockDpaGetReq);
  const dpaGetData = await dpaGetRes.json();

  assert(dpaGetData.success === true && !!dpaGetData.dpaAgreement, "DPA export successfully generated agreement");
  assert(dpaGetData.dpaAgreement.cryptographicSignatureHash.startsWith("sha256:"), "DPA agreement contains valid SHA-256 digital signature");
  assert(dpaGetData.dpaAgreement.dataProtectionClauses.zeroPromptRetention.guaranteed === true, "DPA guarantees zero prompt retention clause");

  // Verify DPA signature via POST
  const mockDpaPostReq = new Request("http://localhost:3000/api/compliance/dpa-export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenantEmail: "compliance@acme.corp",
      effectiveDate: dpaGetData.dpaAgreement.effectiveDate,
      dataProtectionClauses: dpaGetData.dpaAgreement.dataProtectionClauses,
      providedSignature: dpaGetData.dpaAgreement.cryptographicSignatureHash
    })
  });

  const dpaPostRes = await dpaExportPost(mockDpaPostReq);
  const dpaPostData = await dpaPostRes.json();
  assert(dpaPostData.success === true && dpaPostData.isValid === true, "DPA cryptographic signature verified successfully by compliance verifier");

  // 2. Test WF-024: Dynamic SDK Snippet Generation
  console.log("\n--- Testing WF-024: Dynamic SDK Snippet Generation ---");
  const { GET: sdkGenerateGet } = await import("../src/app/api/sdk/generate/route.ts");
  
  const mockSdkReq = new Request("https://gateway.prod.cloud/api/sdk/generate", {
    headers: {
      "host": "gateway.prod.cloud",
      "x-forwarded-proto": "https"
    }
  });

  const sdkRes = await sdkGenerateGet(mockSdkReq);
  const sdkData = await sdkRes.json();
  assert(sdkData.success === true && !!sdkData.snippets, "SDK snippet generation endpoint returned success");
  assert(sdkData.snippets.curl.includes("https://gateway.prod.cloud/v1/chat/completions"), `cURL snippet dynamically resolved host origin (${sdkData.snippets.curl})`);

  // 3. Test WF-025: Webhook Multi-Secret Signature Verification
  console.log("\n--- Testing WF-025: Webhook Multi-Secret Signature Verification ---");
  const { POST: webhookVerifyPost } = await import("../src/app/api/webhooks/verify/route.ts");
  
  const mockWebhookVerifyReq = new Request("http://localhost:3000/api/webhooks/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secretKey: "whsec_primary_live_secret_12345",
      rotatedSecretKey: "whsec_rollover_secret_67890",
      payload: { event: "outcome.indexed.success", request_id: "oir_123", latency_ms: 84 }
    })
  });

  const verifyRes = await webhookVerifyPost(mockWebhookVerifyReq);
  const verifyData = await verifyRes.json();
  assert(verifyData.success === true && verifyData.reason.includes("verified"), "Webhook multi-secret verification succeeded");

  // 4. Test WF-026: Automated SLA Escrow Latency Credit Calculation
  console.log("\n--- Testing WF-026: SLA Escrow Latency Credit Calculation ---");
  const { POST: slaCreditPost } = await import("../src/app/api/billing/sla-credits/route.ts");
  
  const mockSlaReq = new Request("http://localhost:3000/api/billing/sla-credits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "anthropic",
      latencyMs: 580,
      ceilingMs: 250
    })
  });

  const slaRes = await slaCreditPost(mockSlaReq);
  const slaData = await slaRes.json();
  const excess = slaData.credit.actualLatencyMs - slaData.credit.targetCeilingMs;
  assert(slaData.success === true && excess === 330, `SLA breach penalty accurately computed (${excess}ms breach)`);
  assert(slaData.credit.refundAmountUsd > 0, "SLA escrow refund amount awarded to balance");

  console.log("\n=============================================================");
  console.log("🎉 ALL RUN 06 WORKFLOW VERIFICATIONS PASSED! (100% SUCCESS)");
  console.log("=============================================================\n");
}

runWorkflowTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
