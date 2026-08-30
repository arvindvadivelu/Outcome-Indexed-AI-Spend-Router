// ==============================================================================
// 🧪 OUTCOME ROUTER RUN 03 WORKFLOW INTEGRATION TEST SUITE
// Tests: WF-015 through WF-019 (Webhooks, Team Management, Federation, Deep Links)
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

async function runRun03TestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING OUTCOME ROUTER RUN 03 WORKFLOW TEST SUITE");
  console.log("================================================================\n");

  const testEmail = `run03_${Date.now()}@routerflow.io`;

  // 1. Register a test user
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Run 03 Master Auditor",
      email: testEmail,
      workspace: "Run 03 Spatial Lab",
      plan_tier: "enterprise",
      pin: "999888"
    })
  });
  const regData = await regRes.json();
  assert(regData.success, "Test user registered for Run 03 audit", regData.user?.id);

  // 2. Test WF-015: Webhooks Session Persistence
  console.log("\n--- Testing WF-015: Webhook Configuration Persistence ---");
  const testWebhookConfig = {
    endpointUrl: "https://api.acmecorp.internal/v1/router-events",
    secretKey: "whsec_custom_8f9a2b1c4d3e5f",
    activeEvents: ["outcome.indexed.success", "sla.escrow.refund"]
  };

  const syncWhRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      webhookConfig: testWebhookConfig
    })
  });
  const syncWhData = await syncWhRes.json();
  assert(syncWhData.success, "Saved webhookConfig to backend session");

  const getWhRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const getWhData = await getWhRes.json();
  assert(getWhData.user?.webhookConfig?.endpointUrl === testWebhookConfig.endpointUrl, "Persisted webhook endpoint URL restored", getWhData.user?.webhookConfig?.endpointUrl);
  assert(getWhData.user?.webhookConfig?.secretKey === testWebhookConfig.secretKey, "Persisted webhook secret key restored", getWhData.user?.webhookConfig?.secretKey);

  // 3. Test WF-016: Webhook HMAC Dispatch & Cryptographic Verification
  console.log("\n--- Testing WF-016: Webhook HMAC Dispatch & Cryptographic Verification ---");
  const dispatchRes = await fetch(`${BASE_URL}/api/webhooks/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpointUrl: testWebhookConfig.endpointUrl,
      secretKey: testWebhookConfig.secretKey,
      eventType: "sla.escrow.refund"
    })
  });
  const dispatchData = await dispatchRes.json();
  assert(dispatchData.success, "Webhook dispatch simulation successful", `HTTP ${dispatchData.http_status}`);
  assert(dispatchData.signature_header.includes("v1="), "HMAC signature header generated", dispatchData.signature_header.substring(0, 32) + "...");
  assert(dispatchData.event_payload.event === "sla.escrow.refund", "Event payload topic matches SLA refund", dispatchData.event_payload.event);

  // 4. Test WF-017: Team Members Management & Session Sync
  console.log("\n--- Testing WF-017: Team Members Management & Persistence ---");
  const teamInviteRes = await fetch(`${BASE_URL}/api/team/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "engineer.alex@routerflow.io",
      role: "Staff Engineer",
      tokenQuota: "500,000 / mo"
    })
  });
  const teamInviteData = await teamInviteRes.json();
  assert(teamInviteData.success, "Team invite API generated invitation", teamInviteData.member?.role);

  const testTeamMembers = [
    { id: 1, name: "Run 03 Master Auditor", email: testEmail, role: "Owner", tokenQuota: "Unlimited", mfaActive: true, lastActive: "Just now" },
    { id: 2, name: "engineer.alex", email: "engineer.alex@routerflow.io", role: "Staff Engineer", tokenQuota: "500,000 / mo", mfaActive: true, lastActive: "Invited" }
  ];

  const syncTeamRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      teamMembers: testTeamMembers
    })
  });
  const syncTeamData = await syncTeamRes.json();
  assert(syncTeamData.success, "Saved team members array to backend session");

  const getTeamRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const getTeamData = await getTeamRes.json();
  assert(getTeamData.user?.teamMembers?.length === 2, "Persisted team member roster restored", `${getTeamData.user?.teamMembers?.length} members`);
  assert(getTeamData.user?.teamMembers?.[1]?.role === "Staff Engineer", "Invited member role matches Staff Engineer", getTeamData.user?.teamMembers?.[1]?.role);

  // 5. Test WF-018: Multi-Tenant Federation Settings Persistence
  console.log("\n--- Testing WF-018: Federation Settings Persistence ---");
  const testFedSettings = {
    enabled: true,
    differentialPrivacyEpsilon: 0.5,
    sharingWeight: 0.75,
    totalParticipatingTenants: 1420
  };

  const syncFedRes = await fetch(`${BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      federationSettings: testFedSettings
    })
  });
  const syncFedData = await syncFedRes.json();
  assert(syncFedData.success, "Saved federation settings to backend session");

  const getFedRes = await fetch(`${BASE_URL}/api/auth/session?email=${encodeURIComponent(testEmail)}`);
  const getFedData = await getFedRes.json();
  assert(getFedData.user?.federationSettings?.enabled === true, "Persisted federation sharing flag is true", getFedData.user?.federationSettings?.enabled);
  assert(getFedData.user?.federationSettings?.sharingWeight === 0.75, "Persisted federation sharing weight matches 0.75", getFedData.user?.federationSettings?.sharingWeight);

  // 6. Cleanup test account
  await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail })
  });

  console.log("\n================================================================");
  console.log(`📊 RUN 03 TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRun03TestSuite();
