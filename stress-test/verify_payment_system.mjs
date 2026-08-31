// ==============================================================================
// 🚀 PAYMENT SYSTEM INTEGRATION TEST SUITE
// Tests: Domestic Google Pay (GPay) UPI & International ICICI Bank Business Wire
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

async function runPaymentTestSuite() {
  console.log("================================================================");
  console.log("🚀 STARTING PAYMENT SYSTEM TEST SUITE (GPAY UPI & ICICI WIRE)");
  console.log("================================================================\n");

  // 1. Test Domestic INR Payment Intent (Google Pay / UPI)
  console.log("--- Testing 1: Domestic INR GPay / UPI Intent ---");
  const inrIntentRes = await fetch(`${BASE_URL}/api/payments/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "varvind2004@gmail.com",
      planTier: "growth",
      currency: "INR"
    })
  });
  const inrIntentData = await inrIntentRes.json();
  assert(inrIntentRes.status === 200 && inrIntentData.success === true, "Created INR GPay payment intent", `TX: ${inrIntentData.transaction?.id}`);
  assert(inrIntentData.transaction?.amount === 8500, "Calculated correct INR amount for Growth plan (₹8,500)", `Amount: ₹${inrIntentData.transaction?.amount}`);
  assert(inrIntentData.upiUrl?.includes("pa=varvind2004%40okaxis") || inrIntentData.upiUrl?.includes("pa=varvind2004@okaxis"), "Generated valid UPI deep-link URL with merchant VPA", inrIntentData.upiUrl);

  // 2. Test International USD Wire Intent (ICICI Bank Business Current Account)
  console.log("\n--- Testing 2: International USD ICICI Wire Remittance Intent ---");
  const usdIntentRes = await fetch(`${BASE_URL}/api/payments/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "varvind2004@gmail.com",
      planTier: "growth",
      currency: "USD"
    })
  });
  const usdIntentData = await usdIntentRes.json();
  assert(usdIntentRes.status === 200 && usdIntentData.success === true, "Created USD Wire remittance intent", `TX: ${usdIntentData.transaction?.id}`);
  assert(usdIntentData.wireInstructions?.bankName === "ICICI Bank Limited", "Attached ICICI Bank Limited wire routing details", usdIntentData.wireInstructions?.bankName);
  assert(usdIntentData.wireInstructions?.swiftCode === "ICICINBBCTS", "Attached valid ICICI Bank SWIFT/BIC code", usdIntentData.wireInstructions?.swiftCode);
  assert(usdIntentData.wireInstructions?.rbiPurposeCode === "P0802", "Attached RBI Purpose Code P0802 for software & AI services", usdIntentData.wireInstructions?.rbiPurposeCode);

  // 3. Test GET Wire Instructions Endpoint
  console.log("\n--- Testing 3: Certified ICICI Bank Wire Instructions API ---");
  const wireInfoRes = await fetch(`${BASE_URL}/api/payments/wire-instructions`);
  const wireInfoData = await wireInfoRes.json();
  assert(wireInfoRes.status === 200, "GET /api/payments/wire-instructions returns HTTP 200 OK", `Status: ${wireInfoRes.status}`);
  assert(wireInfoData.domestic?.upiId === "varvind2004@okaxis", "Confirmed official domestic UPI ID", wireInfoData.domestic?.upiId);
  assert(wireInfoData.international?.accountNumber === "000405001234", "Confirmed ICICI Business Current Account Number", wireInfoData.international?.accountNumber);

  // 4. Test UTR / SWIFT Reference Verification & Plan Upgrade
  console.log("\n--- Testing 4: Payment Verification & Automated Plan Upgrade ---");
  const sampleUtr = "423918471920";
  const verifyRes = await fetch(`${BASE_URL}/api/payments/verify-utr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionId: inrIntentData.transaction?.id,
      referenceCode: sampleUtr,
      email: "varvind2004@gmail.com"
    })
  });
  const verifyData = await verifyRes.json();
  assert(verifyRes.status === 200 && verifyData.success === true, "Verified 12-digit UPI UTR receipt", verifyData.message);
  assert(verifyData.transaction?.status === "COMPLETED", "Transaction status marked COMPLETED", verifyData.transaction?.status);

  // 5. Test Invoice Generator API
  console.log("\n--- Testing 5: Downloadable GST / Wire Invoice Generator ---");
  const invoiceRes = await fetch(`${BASE_URL}/api/payments/invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "varvind2004@gmail.com",
      planTier: "growth",
      currency: "INR",
      companyName: "Arvind's Workspace"
    })
  });
  const invoiceData = await invoiceRes.json();
  assert(invoiceRes.status === 200 && invoiceData.success === true, "Generated GST / Wire Invoice", `Invoice: ${invoiceData.invoice?.invoiceId}`);
  assert(invoiceData.invoice?.totalDue === 8500, "Invoice total due verified", `Total: ₹${invoiceData.invoice?.totalDue}`);

  // 6. Test Payment History API
  console.log("\n--- Testing 6: Tenant Payment Transaction History ---");
  const historyRes = await fetch(`${BASE_URL}/api/payments/verify-utr?email=varvind2004@gmail.com`);
  const historyData = await historyRes.json();
  assert(historyRes.status === 200, "GET /api/payments/verify-utr?email=... returns HTTP 200 OK", `Total TXs: ${historyData.totalTransactions}`);
  assert(historyData.history?.length >= 1, "Payment transaction ledger recorded user payment", `Recorded: ${historyData.history?.length}`);

  console.log("\n================================================================");
  console.log(`📊 PAYMENT TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPaymentTestSuite();
