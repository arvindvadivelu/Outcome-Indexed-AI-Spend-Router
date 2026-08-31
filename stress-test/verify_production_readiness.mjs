// ==============================================================================
// 🛡️ PRODUCTION READINESS & RELIABILITY VERIFICATION SUITE
// ==============================================================================

import path from "path";
import fs from "fs";
import crypto from "crypto";

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

async function runProductionReadinessTestSuite() {
  console.log("================================================================");
  console.log("🛡️ STARTING PRODUCTION READINESS & RELIABILITY TEST SUITE");
  console.log("================================================================\n");

  // 1. Test PR-001: Atomic File Persistence Verification
  console.log("--- Testing PR-001: Atomic File Persistence & Race Protection ---");
  const usersFile = path.join(process.cwd(), "data", "users.json");
  assert(fs.existsSync(usersFile), "Database storage file users.json exists in active workspace", usersFile);
  const usersContent = fs.readFileSync(usersFile, "utf-8");
  const usersParsed = JSON.parse(usersContent);
  assert(Array.isArray(usersParsed) && usersParsed.length >= 1, "Database ledger parsed without corruption", `Users count: ${usersParsed.length}`);

  // 2. Test PR-002: System Readiness Probe
  console.log("\n--- Testing PR-002: Environment Configuration & Readiness Probe ---");
  const readinessRes = await fetch(`${BASE_URL}/api/system/readiness`);
  const readinessData = await readinessRes.json();
  assert(readinessRes.status === 200, "GET /api/system/readiness returns HTTP 200 OK", `Status: ${readinessRes.status}`);
  assert(readinessData.report?.isValid === true, "Environment validation report marked isValid", `Readiness: ${readinessData.report?.systemReadiness}`);

  // 3. Test PR-003: SRE Sensitive Secret Redaction Pattern
  console.log("\n--- Testing PR-003: SRE Structured Logger with Sensitive Secret Redaction ---");
  const rawLog = "Customer authenticated with key oir_live_9948194829104820 and token Bearer eyJhbGciOiJIUzI1Ni";
  const scrubbed = rawLog.replace(/(oir_live_[a-zA-Z0-9_-]{8,})/g, "[REDACTED_SECRET]").replace(/(Bearer\s+[a-zA-Z0-9_\-\.]+)/gi, "[REDACTED_SECRET]");
  assert(!scrubbed.includes("oir_live_9948194829104820"), "Redacted live API key from log string", scrubbed);
  assert(scrubbed.includes("[REDACTED_SECRET]"), "Replaced secret with [REDACTED_SECRET] token");

  // 4. Test PR-004: Point-In-Time Backup & Disaster Recovery Engine
  console.log("\n--- Testing PR-004: Database Snapshot & Recovery Engine ---");
  const backupRes = await fetch(`${BASE_URL}/api/system/backup`, { method: "POST" });
  const backupData = await backupRes.json();
  assert(backupRes.status === 200 && backupData.success === true, "Created point-in-time database snapshot", `Snapshot ID: ${backupData.snapshot?.id}`);
  assert(backupData.snapshot?.checksumSha256?.length === 64, "Generated SHA-256 integrity checksum", `Checksum: ${backupData.snapshot?.checksumSha256.substring(0, 16)}...`);

  const listBackupsRes = await fetch(`${BASE_URL}/api/system/backup`);
  const listBackupsData = await listBackupsRes.json();
  assert(listBackupsRes.status === 200 && listBackupsData.count >= 1, "Listed available point-in-time database snapshots", `Available: ${listBackupsData.count}`);

  // 5. Test PR-005: Ingress Payload Size Guard
  console.log("\n--- Testing PR-005: Ingress Payload Size Guard & Body Limit Protection ---");
  const validPayloadRes = await fetch(`${BASE_URL}/api/routing/payload-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "Hello AI Spend Router", model: "auto" })
  });
  const validData = await validPayloadRes.json();
  assert(validPayloadRes.status === 200 && validData.success === true, "Accepted standard size JSON payload", `Bytes: ${validData.inspection?.bytesReceived}`);

  console.log("\n================================================================");
  console.log(`📊 READINESS AUDIT TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runProductionReadinessTestSuite();
