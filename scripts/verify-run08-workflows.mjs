/**
 * Run 08 Workflow Verification Suite
 * Tests WF-031, WF-032, WF-033, WF-034
 */

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exit(1);
  }
}

async function runRun08Tests() {
  console.log("\n=======================================================");
  console.log("  RUN 08 WORKFLOW VERIFICATION TEST SUITE");
  console.log("=======================================================\n");

  // Suite 1: WF-034 — Types Export Route (.d.ts Generation)
  console.log("Suite 1: WF-034 — Developer TypeScript Definitions Export");
  const { GET: getTypesExport } = await import("../src/app/api/types/export/route.ts");
  const resTypes = await getTypesExport();
  assert(resTypes.status === 200, "GET /api/types/export returns status 200");
  assert(resTypes.headers.get("Content-Type")?.includes("application/typescript"), "Returns application/typescript content type");
  assert(resTypes.headers.get("Content-Disposition")?.includes("outcome-router.d.ts"), "Provides attachment filename outcome-router.d.ts");
  
  const typesText = await resTypes.text();
  assert(typesText.includes("OutcomeRouterMetadata"), "Definitions include OutcomeRouterMetadata");
  assert(typesText.includes("edge_ttft_ms"), "Definitions include edge_ttft_ms");
  assert(typesText.includes("actual_cost_usd"), "Definitions include actual_cost_usd");
  assert(typesText.includes("OutcomeGatewayHeaders"), "Definitions include OutcomeGatewayHeaders");

  // Suite 2: WF-033 — Compliance Package & DPA Export
  console.log("\nSuite 2: WF-033 — Compliance & SLA Terms Package Export");
  const { GET: getDpaExport, POST: verifyDpaExport } = await import("../src/app/api/compliance/dpa-export/route.ts");
  const reqDpa = new Request("http://localhost:3000/api/compliance/dpa-export?mode=full_package&download=true");
  const resDpa = await getDpaExport(reqDpa);
  assert(resDpa.status === 200, "GET /api/compliance/dpa-export returns status 200");
  
  const dataDpa = await resDpa.json();
  assert(dataDpa.success === true, "Export success flag is true");
  assert(dataDpa.compliancePackage?.mode === "full_package", "Export mode is full_package");
  assert(dataDpa.compliancePackage?.slaCommitments?.uptimeGuaranteePct === 99.99, "Contains 99.99% SLA commitment");
  assert(dataDpa.compliancePackage?.cryptographicSignatureHash?.startsWith("sha256:"), "Contains cryptographic SHA-256 signature hash");

  // Cryptographic validation
  const verifyReq = new Request("http://localhost:3000/api/compliance/dpa-export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenantEmail: dataDpa.compliancePackage.tenant.email,
      effectiveDate: dataDpa.compliancePackage.effectiveDate,
      dataProtectionClauses: dataDpa.compliancePackage.dataProtectionClauses,
      slaCommitments: dataDpa.compliancePackage.slaCommitments,
      providedSignature: dataDpa.compliancePackage.cryptographicSignatureHash
    })
  });
  const verifyRes = await verifyDpaExport(verifyReq);
  assert(verifyRes.status === 200, "POST /api/compliance/dpa-export validates signature with status 200");
  const verifyData = await verifyRes.json();
  assert(verifyData.isValid === true, "Signature verification reports isValid: true");

  // Suite 3: WF-031 — Docs Gateway Sandbox Live Test Schema Alignment
  console.log("\nSuite 3: WF-031 — Docs Interactive Gateway Call Response Schema");
  const { POST: handleChatCompletions } = await import("../src/app/api/v1/chat/completions/route.ts");
  const reqChat = new Request("http://localhost:3000/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Outcome-Strategy": "outcome_optimized",
      "X-Outcome-Target-Metric": "code_merged"
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Refactor Next.js API route for zero latency bottlenecks." }],
      strategy: "outcome_optimized",
      target_metric: "code_merged"
    })
  });

  const resChat = await handleChatCompletions(reqChat);
  assert(resChat.status === 200, "POST /api/v1/chat/completions returns status 200");
  
  const dataChat = await resChat.json();
  assert(Array.isArray(dataChat.choices) && dataChat.choices.length > 0, "Response contains choices array");
  
  const meta = dataChat._router_metadata;
  assert(meta !== undefined, "Response contains _router_metadata");
  assert(typeof meta.edge_ttft_ms === "number", "Metadata has numeric edge_ttft_ms");
  assert(typeof meta.actual_cost_usd === "number", "Metadata has numeric actual_cost_usd");
  assert(typeof meta.spend_avoided_pct === "string", "Metadata has string spend_avoided_pct");
  assert(meta.sla_contract_nonce?.startsWith("0x"), "Metadata has hexadecimal sla_contract_nonce");
  assert(typeof meta.model_routed === "string", "Metadata has model_routed identifier");

  // Suite 4: WF-032 — Telemetry Logs AI Decision Inspector
  console.log("\nSuite 4: WF-032 — Telemetry Logs AI Decision Inspector Endpoint");
  const { POST: handleLogInspect } = await import("../src/app/api/logs/inspect/route.ts");
  const reqInspect = new Request("http://localhost:3000/api/logs/inspect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      log: {
        id: "oir_log_test_88921",
        model_used: "DeepSeek-V3",
        task_type: "code_generation",
        cost_usd: 0.00034,
        latency_ms: 68,
        prompt_preview: "Refactor SQL schema with btree index"
      }
    })
  });

  const resInspect = await handleLogInspect(reqInspect);
  assert(resInspect.status === 200, "POST /api/logs/inspect returns status 200");
  
  const dataInspect = await resInspect.json();
  assert(dataInspect.success === true, "Inspect returned success: true");
  assert(Array.isArray(dataInspect.analysisSteps) && dataInspect.analysisSteps.length === 4, "Inspector generated 4-step decision trace");
  assert(dataInspect.analysisSteps[0].step.includes("Intent & Task Classification"), "Step 1 is Intent & Task Classification");
  assert(dataInspect.analysisSteps[2].step.includes("Micro-SLA Cryptographic Verification"), "Step 3 is Micro-SLA Cryptographic Verification");

  // Suite 5: System Diagnostics Export
  console.log("\nSuite 5: System Diagnostics Bundle Export");
  const { GET: getDiagnosticsExport } = await import("../src/app/api/diagnostics/export/route.ts");
  const resDiag = await getDiagnosticsExport();
  assert(resDiag.status === 200, "GET /api/diagnostics/export returns status 200");
  
  const dataDiag = await resDiag.json();
  assert(dataDiag.success === true, "Diagnostics success flag is true");
  assert(dataDiag.bundle?.bundleId?.startsWith("diag_"), "Diagnostics bundle contains valid bundleId");
  assert(dataDiag.bundle?.subsystems?.circuitBreakers !== undefined, "Contains circuitBreakers subsystem health");
  assert(dataDiag.bundle?.subsystems?.workerPool !== undefined, "Contains workerPool subsystem health");

  console.log("\n-------------------------------------------------------");
  console.log("  ALL RUN 08 WORKFLOW SUITES PASSED SUCCESSFULLY (100%)");
  console.log("-------------------------------------------------------\n");
}

runRun08Tests();
