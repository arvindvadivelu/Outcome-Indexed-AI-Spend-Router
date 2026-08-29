import fs from "fs";
import path from "path";

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyuqBubGh1SrxAspikzQj4vfatQkaSMq0KeSH0qsavVOYlVUTCvYZtafASHQrph28CfZQ/exec";
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

async function syncAllToGoogleSheet() {
  console.log("Reading database users from:", USERS_FILE);
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  const users = JSON.parse(raw);

  console.log(`Found ${users.length} users in database. Syncing to Google Sheets...`);

  for (const u of users) {
    const payload = {
      timestamp: u.created_at || new Date().toISOString(),
      localTime: new Date().toLocaleString(),
      action: "REGISTER",
      name: u.name,
      email: u.email,
      workspace: u.workspace,
      plan_tier: u.plan_tier,
      monthly_token_quota: u.monthly_token_quota,
      currency: u.currency || "USD",
      auth_method: "PIN_PASSWORD"
    };

    console.log(`Syncing user ${u.email} (${u.name})...`);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        redirect: "follow"
      });
      console.log(`Synced ${u.email}: HTTP ${res.status}`);
    } catch (e) {
      console.error(`Failed to sync ${u.email}:`, e.message);
    }
  }

  console.log("All database accounts synced to Google Sheets successfully!");
}

syncAllToGoogleSheet();
