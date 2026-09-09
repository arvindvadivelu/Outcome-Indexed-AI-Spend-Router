import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");
const WEBHOOK_URL =
  process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
  "https://script.google.com/macros/s/AKfycbwGKherD18I8NfCC3ih1Vps6thXyA0b0uEAhYsEX9imxnS7Yk9gSKLkZHvza7KxaypZ3A/exec";

async function main() {
  if (!fs.existsSync(USERS_FILE)) {
    console.log("No data/users.json found.");
    return;
  }

  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  const users = JSON.parse(raw || "[]");

  console.log(`Found ${users.length} users in data/users.json.`);

  if (users.length === 0) {
    console.log("Clearing sheet...");
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CLEAR_ALL" }),
      redirect: "follow"
    });
    console.log("Result:", await res.text());
    return;
  }

  for (const u of users) {
    console.log(`Syncing user: ${u.email} (${u.name}) - Plan: ${u.plan_tier}...`);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPSERT",
          name: u.name,
          email: u.email,
          workspace: u.workspace || "Primary Workspace",
          plan_tier: u.plan_tier || "free",
          monthly_token_quota: u.monthly_token_quota || 10000,
          currency: u.currency || "USD",
          auth_method: "PIN_PASSWORD",
          created_at: u.created_at
        }),
        redirect: "follow"
      });
      const data = await res.text();
      console.log(`✓ Result for ${u.email}:`, data);
    } catch (err) {
      console.error(`✗ Error syncing ${u.email}:`, err);
    }
  }

  console.log("\nDone syncing all users to Google Sheet!");
}

main();
