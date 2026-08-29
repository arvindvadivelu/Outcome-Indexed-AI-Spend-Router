import fs from "fs";
import path from "path";

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyuqBubGh1SrxAspikzQj4vfatQkaSMq0KeSH0qsavVOYlVUTCvYZtafASHQrph28CfZQ/exec";
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

async function main() {
  console.log("=================================================");
  console.log("📊 SYNCING ACTIVE DATABASE USERS TO NEW GOOGLE SHEET");
  console.log("=================================================\n");

  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  const users = JSON.parse(raw);

  console.log(`Found ${users.length} users in data/users.json. Sending SYNC_ALL...`);

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "SYNC_ALL",
      users: users
    }),
    redirect: "follow"
  });

  const data = await res.json();
  console.log("Google Apps Script Response:", data);
  console.log("\n✅ Google Sheet is now structured as a clean User Table without Action column!");
}

main().catch(console.error);
