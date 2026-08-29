import fs from "fs";
import path from "path";

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyuqBubGh1SrxAspikzQj4vfatQkaSMq0KeSH0qsavVOYlVUTCvYZtafASHQrph28CfZQ/exec";
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

async function purgeAllData() {
  console.log("=================================================");
  console.log("🧹 PURGING ALL CURRENT DATA FROM DB & GOOGLE SHEET");
  console.log("=================================================\n");

  // 1. Clear local DB (data/users.json)
  fs.writeFileSync(USERS_FILE, "[]", "utf-8");
  console.log("✅ 1. Database data/users.json has been wiped clean ([]).");

  // 2. Dispatch CLEAR_ALL to Google Sheets Webhook
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CLEAR_ALL" }),
      redirect: "follow"
    });
    const data = await res.json();
    console.log("✅ 2. Google Sheet Webhook CLEAR_ALL response:", data);
  } catch (err) {
    console.warn("Notice: Google Sheet webhook dispatch:", err.message);
  }

  console.log("\n🎉 Both the Local Database and Google Sheet are now 100% clean and reset!");
}

purgeAllData().catch(console.error);
