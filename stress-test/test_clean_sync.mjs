import fs from "fs";
import path from "path";

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyuqBubGh1SrxAspikzQj4vfatQkaSMq0KeSH0qsavVOYlVUTCvYZtafASHQrph28CfZQ/exec";
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

async function testCleanSync() {
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  const users = JSON.parse(raw);

  console.log(`Sending SYNC_ALL with ${users.length} active users to Google Apps Script webhook...`);

  try {
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
    console.log("Webhook response:", data);
  } catch (err) {
    console.error("Webhook call failed:", err);
  }
}

testCleanSync();
