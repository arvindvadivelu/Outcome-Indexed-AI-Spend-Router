import { NextResponse } from "next/server";
import { PAYMENT_CONFIG } from "@/lib/payment-gateway";

export async function POST(req: Request) {
  try {
    const { email, planTier, currency, companyName, gstVatNumber } = await req.json().catch(() => ({}));
    const tier = planTier || "growth";
    const selectedCurrency = currency === "INR" ? "INR" : "USD";
    const planInfo = PAYMENT_CONFIG.planPricing[tier as "starter" | "growth" | "enterprise"] || PAYMENT_CONFIG.planPricing.growth;
    const amount = selectedCurrency === "INR" ? planInfo.inr : planInfo.usd;
    const invoiceId = `INV-OIR-${selectedCurrency}-${Math.floor(100000 + Math.random() * 900000)}`;

    const invoiceData = {
      invoiceId,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      status: "ISSUED",
      billedTo: {
        email: email || "customer@company.com",
        companyName: companyName || "Enterprise Client",
        taxId: gstVatNumber || "N/A"
      },
      issuer: {
        companyName: "Outcome-Indexed AI Spend Router Pvt Ltd",
        address: "Nariman Point, Mumbai 400021, India",
        gstin: "27AABCO1234F1Z5",
        pan: "AABCO1234F"
      },
      lineItems: [
        {
          description: `Outcome-Indexed AI Spend Router - ${planInfo.name} Tier (${planInfo.tokens.toLocaleString()} tokens/mo)`,
          quantity: 1,
          unitPrice: amount,
          total: amount,
          currency: selectedCurrency
        }
      ],
      subtotal: amount,
      tax: 0,
      totalDue: amount,
      paymentInstructions: selectedCurrency === "INR"
        ? {
            method: "Google Pay / UPI",
            upiId: PAYMENT_CONFIG.domestic.upiId,
            payee: PAYMENT_CONFIG.domestic.payeeName
          }
        : {
            method: "ICICI Bank Business Wire Remittance",
            beneficiaryName: PAYMENT_CONFIG.international.beneficiaryName,
            accountNumber: PAYMENT_CONFIG.international.accountNumber,
            bankName: PAYMENT_CONFIG.international.bankName,
            swiftCode: PAYMENT_CONFIG.international.swiftCode,
            ifscCode: PAYMENT_CONFIG.international.ifscCode,
            rbiPurposeCode: PAYMENT_CONFIG.international.rbiPurposeCode
          }
    };

    return NextResponse.json({
      success: true,
      invoice: invoiceData
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
