const BASE_URL = "http://localhost:3000";

async function testFreshFlow() {
  console.log("=================================================");
  console.log("🧪 TESTING REGISTRATION & LOGIN WITH CLEAN DB");
  console.log("=================================================\n");

  // 1. Register varvind2004@gmail.com
  console.log("1. Registering user varvind2004@gmail.com...");
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Arvind",
      email: "varvind2004@gmail.com",
      workspace: "Arvind's Workspace",
      pin: "111111",
      plan_tier: "free",
      currency: "USD"
    })
  });
  const regData = await regRes.json();
  console.log("Registration Response:", regData);

  // 2. Test Login
  console.log("\n2. Testing PIN login...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "varvind2004@gmail.com",
      pin: "111111"
    })
  });
  const loginData = await loginRes.json();
  console.log("Login Response:", loginData);

  if (loginData.success) {
    console.log("\n✅ SUCCESS: Account registered and logged in successfully!");
  } else {
    console.log("\n⚠️ Login notice:", loginData.error);
  }
}

testFreshFlow().catch(console.error);
