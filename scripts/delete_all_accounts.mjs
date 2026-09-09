import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");
const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbxXU-gpZpy7b77qstegW4Fa4LASLK4Am10qOm2o2RhOjDQPcrqt9hPhNVTf36CxKjXv/exec";

async function purgeAllAccounts() {
  console.log("==================================================");
  console.log("🗑️ PURGING ALL ACCOUNTS FROM DATABASE AND GOOGLE SHEET");
  console.log("==================================================");

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    try {
      users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading users.json:", e);
    }
  }

  console.log(`Found ${users.length} accounts in database.`);

  for (const u of users) {
    console.log(`\n[-] Dispatching deletion for account: ${u.email} (${u.name} / ${u.workspace})`);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          localTime: new Date().toLocaleString(),
          action: "DELETE_ACCOUNT",
          name: u.name || "Deleted User",
          email: u.email,
          workspace: u.workspace || "Deleted Workspace",
          plan_tier: u.plan_tier || "free",
          status: "PERMANENTLY_DELETED",
          notes: "Account purged and deleted from database and Google Sheets ledger."
        }),
        signal: AbortSignal.timeout(6000)
      });
      console.log(`  ✓ Google Sheet deletion status: ${res.status}`);
    } catch (err) {
      console.warn(`  ⚠️ Google Sheet webhook notice for ${u.email}:`, err.message);
    }
  }

  // Also dispatch a master PURGE_ALL event to Google Sheet
  try {
    console.log("\n[-] Dispatching MASTER_PURGE_ALL to Google Sheet...");
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        localTime: new Date().toLocaleString(),
        action: "DELETE_ACCOUNT",
        name: "ALL USERS",
        email: "PURGED_ALL_ACCOUNTS",
        workspace: "DATABASE_CLEARED",
        plan_tier: "NONE",
        status: "ALL_ACCOUNTS_DELETED",
        notes: "All database accounts and Excel ledger records have been purged."
      }),
      signal: AbortSignal.timeout(6000)
    });
    console.log(`  ✓ Master purge status: ${res.status}`);
  } catch (err) {
    console.warn("  ⚠️ Master purge webhook notice:", err.message);
  }

  // Clear data/users.json completely
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf-8");
  console.log("\n✓ data/users.json has been emptied (0 users).");

  // Clear data/payments.json completely
  if (fs.existsSync(PAYMENTS_FILE)) {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify([], null, 2), "utf-8");
    console.log("✓ data/payments.json has been emptied (0 transactions).");
  }

  // Clean any tmp files in data/
  const files = fs.readdirSync(DATA_DIR);
  for (const file of files) {
    if (file.endsWith(".tmp")) {
      fs.unlinkSync(path.join(DATA_DIR, file));
      console.log(`✓ Removed temporary cache file: ${file}`);
    }
  }

  console.log("\n🎉 ALL ACCOUNTS AND RECORDS HAVE BEEN COMPLETELY DELETED.");
}

purgeAllAccounts().catch(console.error);
