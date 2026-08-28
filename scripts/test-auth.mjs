async function testAuth() {
  console.log("--- Testing Auth Endpoints ---");

  // 1. Register new user
  const regRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Jane Doe",
      email: "jane@acme.ai",
      workspace: "Jane AI Labs",
      plan_tier: "growth",
      pin: "987654",
      currency: "INR"
    })
  });
  const regData = await regRes.json();
  console.log("1. Registration Response:", regData);

  // 2. Test wrong PIN
  const wrongPinRes = await fetch("http://localhost:3000/api/auth/verify-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "jane@acme.ai",
      pin: "000000"
    })
  });
  console.log("2. Wrong PIN Status:", wrongPinRes.status, await wrongPinRes.json());

  // 3. Test correct PIN
  const correctPinRes = await fetch("http://localhost:3000/api/auth/verify-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "jane@acme.ai",
      pin: "987654"
    })
  });
  console.log("3. Correct PIN Status:", correctPinRes.status, await correctPinRes.json());

  // 4. Test Send OTP for unregistered email
  const unknownOtpRes = await fetch("http://localhost:3000/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "nonexistent_user_999@domain.com"
    })
  });
  console.log("4. Unknown Email Send OTP Status:", unknownOtpRes.status, await unknownOtpRes.json());

  // 5. Test Send OTP for registered user
  const otpRes = await fetch("http://localhost:3000/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "jane@acme.ai"
    })
  });
  const otpData = await otpRes.json();
  console.log("5. Registered User Send OTP:", otpRes.status, otpData);

  // 6. Test Verify OTP
  const verOtpRes = await fetch("http://localhost:3000/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "jane@acme.ai",
      otp: otpData.otp
    })
  });
  console.log("6. Verify OTP Status:", verOtpRes.status, await verOtpRes.json());
}

testAuth();
