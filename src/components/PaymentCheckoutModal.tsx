"use client";

import { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Download,
  AlertCircle,
  Sparkles,
  Smartphone,
  Globe
} from "lucide-react";
import { useAppStore } from "@/lib/store";

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: "starter" | "growth" | "enterprise";
  initialCurrency?: "INR" | "USD";
  onSuccess?: () => void;
}

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  initialPlan = "growth",
  initialCurrency,
  onSuccess
}: PaymentCheckoutModalProps) {
  const { user, orgName, currency, setPlanTier } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "growth" | "enterprise">(initialPlan);
  const [selectedCurrency, setSelectedCurrency] = useState<"INR" | "USD">(initialCurrency || (currency === "INR" ? "INR" : "USD"));
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [utrCode, setUtrCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    if (initialPlan) setSelectedPlan(initialPlan);
    if (initialCurrency) setSelectedCurrency(initialCurrency);
    else setSelectedCurrency(currency === "INR" ? "INR" : "USD");
    setIsSuccess(false);
    setVerificationError(null);
    setUtrCode("");
  }, [isOpen, initialPlan, initialCurrency, currency]);

  if (!isOpen) return null;

  const planPricing = {
    starter: { usd: 29, inr: 2500, name: "Starter", tokens: "100,000 tokens/mo" },
    growth: { usd: 99, inr: 8500, name: "Growth", tokens: "500,000 tokens/mo" },
    enterprise: { usd: 499, inr: 43000, name: "Enterprise", tokens: "2,000,000 tokens/mo" }
  };

  const currentPlanInfo = planPricing[selectedPlan];
  const amountToPay = selectedCurrency === "INR" ? currentPlanInfo.inr : currentPlanInfo.usd;
  const formattedAmount = selectedCurrency === "INR" ? `₹${amountToPay.toLocaleString()}` : `$${amountToPay}`;

  const domesticUpiId = "varvind2004@okaxis";
  const upiDeepLink = `upi://pay?pa=${domesticUpiId}&pn=Outcome-Indexed%20AI%20Spend%20Router&am=${amountToPay}&cu=INR&tn=Plan%20Upgrade%20${currentPlanInfo.name}`;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyPayment = async () => {
    if (!utrCode.trim()) {
      setVerificationError(
        selectedCurrency === "INR"
          ? "Please enter the 12-digit UTR number from your Google Pay / UPI receipt."
          : "Please enter your SWIFT Wire reference / transaction tracking number."
      );
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await fetch("/api/payments/verify-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceCode: utrCode.trim(),
          email: user?.email || "varvind2004@gmail.com",
          planTier: selectedPlan,
          currency: selectedCurrency
        })
      });

      const data = await res.json();

      if (data.success) {
        setPlanTier(selectedPlan);
        setIsSuccess(true);
        setSuccessMessage(data.message || `Successfully activated ${currentPlanInfo.name} Plan!`);
        if (onSuccess) onSuccess();
      } else {
        setVerificationError(data.message || "Invalid reference code. Please double check.");
      }
    } catch (err: any) {
      setVerificationError("Network verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      const res = await fetch("/api/payments/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email || "varvind2004@gmail.com",
          planTier: selectedPlan,
          currency: selectedCurrency,
          companyName: orgName || "Enterprise Client"
        })
      });
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.invoice, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${data.invoice.invoiceId}.json`;
        a.click();
      }
    } catch (e) {
      console.warn("Invoice download error:", e);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-[32px] bg-white/95 dark:bg-[#151518]/95 backdrop-blur-3xl border border-black/[0.08] dark:border-white/[0.12] shadow-2xl p-6 sm:p-8 text-[#1D1D1F] dark:text-[#F5F5F7] max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5 animate-in zoom-in-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Payment Verified & Plan Activated!</h2>
              <p className="text-sm text-[#86868B] mt-2 max-w-md mx-auto">{successMessage}</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] max-w-md mx-auto text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#86868B]">Plan Tier:</span>
                <span className="font-semibold uppercase text-[#0050FF] dark:text-[#3374FF]">{currentPlanInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868B]">Monthly Quota:</span>
                <span className="font-medium">{currentPlanInfo.tokens}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868B]">Amount Paid:</span>
                <span className="font-medium font-mono">{formattedAmount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.12] hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium transition-all"
              >
                <Download className="w-4 h-4" />
                {downloadingInvoice ? "Generating..." : "Download GST / Wire Invoice"}
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0050FF] hover:bg-[#0043D6] text-white text-sm font-medium shadow-sm transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold tracking-wide uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Secure Checkout Gateway
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Upgrade to {currentPlanInfo.name} Plan</h2>
              <p className="text-sm text-[#86868B] mt-1">
                {currentPlanInfo.tokens} with Thompson Sampling outcome routing & zero prompt retention.
              </p>
            </div>

            {/* Plan Selector Pills */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] mb-6">
              {(["starter", "growth", "enterprise"] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedPlan(tier)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                    selectedPlan === tier
                      ? "bg-white dark:bg-[#252528] text-[#0050FF] dark:text-white shadow-sm"
                      : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                  }`}
                >
                  {tier} ({selectedCurrency === "INR" ? `₹${planPricing[tier].inr.toLocaleString()}` : `$${planPricing[tier].usd}`})
                </button>
              ))}
            </div>

            {/* Currency / Payment Method Tabs */}
            <div className="flex border-b border-black/[0.06] dark:border-white/[0.08] mb-6">
              <button
                onClick={() => setSelectedCurrency("INR")}
                className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  selectedCurrency === "INR"
                    ? "border-[#0050FF] text-[#0050FF] dark:text-[#3374FF]"
                    : "border-transparent text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Google Pay / UPI (INR - ₹)
              </button>
              <button
                onClick={() => setSelectedCurrency("USD")}
                className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  selectedCurrency === "USD"
                    ? "border-[#0050FF] text-[#0050FF] dark:text-[#3374FF]"
                    : "border-transparent text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                }`}
              >
                <Globe className="w-4 h-4" />
                ICICI Business Wire (USD - $)
              </button>
            </div>

            {/* DOMESTIC INR: GOOGLE PAY / UPI */}
            {selectedCurrency === "INR" ? (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#EEF4FF]/50 dark:bg-[#0050FF]/10 border border-[#0050FF]/20 flex flex-col sm:flex-row items-center gap-6">
                  {/* Dynamic Visual QR Code Box */}
                  <div className="w-36 h-36 bg-white p-2.5 rounded-2xl shadow-sm border border-black/10 flex flex-col items-center justify-center relative group shrink-0">
                    {/* Simulated Clean SVG QR Code */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect x="0" y="0" width="30" height="30" fill="#1D1D1F" rx="4" />
                      <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                      <rect x="9" y="9" width="12" height="12" fill="#0050FF" rx="1" />

                      <rect x="70" y="0" width="30" height="30" fill="#1D1D1F" rx="4" />
                      <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                      <rect x="79" y="9" width="12" height="12" fill="#0050FF" rx="1" />

                      <rect x="0" y="70" width="30" height="30" fill="#1D1D1F" rx="4" />
                      <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                      <rect x="9" y="79" width="12" height="12" fill="#0050FF" rx="1" />

                      <rect x="36" y="10" width="8" height="8" fill="#1D1D1F" />
                      <rect x="48" y="10" width="8" height="8" fill="#1D1D1F" />
                      <rect x="36" y="24" width="8" height="8" fill="#1D1D1F" />
                      <rect x="36" y="38" width="14" height="14" fill="#0050FF" />
                      <rect x="56" y="38" width="8" height="8" fill="#1D1D1F" />
                      <rect x="70" y="48" width="12" height="12" fill="#1D1D1F" />
                      <rect x="48" y="56" width="8" height="8" fill="#1D1D1F" />
                      <rect x="36" y="70" width="8" height="8" fill="#1D1D1F" />
                      <rect x="48" y="70" width="14" height="14" fill="#0050FF" />
                      <rect x="68" y="70" width="8" height="8" fill="#1D1D1F" />
                      <rect x="80" y="80" width="10" height="10" fill="#1D1D1F" />
                    </svg>
                    <div className="absolute inset-0 bg-[#0050FF]/90 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center text-xs font-semibold">
                      <span>Scan via GPay / PhonePe / Paytm</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex-1 space-y-3 text-left w-full">
                    <div>
                      <div className="text-xs text-[#86868B] uppercase font-semibold">Total Amount Payable</div>
                      <div className="text-2xl font-extrabold text-[#0050FF] dark:text-[#3374FF]">
                        {formattedAmount} <span className="text-xs font-normal text-[#86868B]">inclusive of GST</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs text-[#86868B]">Official UPI ID:</div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#1E1E22] border border-black/[0.08] dark:border-white/[0.1] font-mono text-xs">
                        <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{domesticUpiId}</span>
                        <button
                          onClick={() => copyToClipboard(domesticUpiId, "upiId")}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#0050FF] dark:text-[#3374FF] flex items-center gap-1 text-[11px]"
                        >
                          {copiedField === "upiId" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedField === "upiId" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <a
                      href={upiDeepLink}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0050FF] hover:bg-[#0043D6] text-white text-xs font-medium transition-all shadow-sm w-full justify-center"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Pay Directly in Google Pay (GPay)
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                </div>

                {/* Supported UPI Apps Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#86868B]">
                  <span>Supported Apps:</span>
                  {["Google Pay", "PhonePe", "Paytm", "BHIM", "Cred", "Amazon Pay"].map((app) => (
                    <span key={app} className="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-medium">
                      {app}
                    </span>
                  ))}
                </div>

                {/* UTR Verification Input */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <label>Enter 12-Digit UTR / Transaction ID</label>
                    <span className="text-[#86868B] font-normal">Found in Google Pay payment receipt</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 423918471920"
                      value={utrCode}
                      onChange={(e) => setUtrCode(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.12] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0050FF]"
                    />
                    <button
                      onClick={handleVerifyPayment}
                      disabled={isVerifying}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shrink-0 flex items-center gap-2"
                    >
                      {isVerifying ? "Verifying..." : "Verify & Activate"}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                  {verificationError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {verificationError}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* INTERNATIONAL USD: ICICI BANK BUSINESS WIRE TRANSFER */
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Enterprise Wire Transfer (SWIFT / BIC)</span>:
                    Remit international payments directly to our registered ICICI Bank Business Current Account.
                  </div>
                </div>

                {/* ICICI Bank Wire Details Table */}
                <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.12] overflow-hidden text-xs">
                  <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08] font-semibold flex justify-between items-center">
                    <span>Beneficiary & Bank Routing Details</span>
                    <button
                      onClick={handleDownloadInvoice}
                      disabled={downloadingInvoice}
                      className="text-[#0050FF] dark:text-[#3374FF] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Pro-Forma Wire Invoice
                    </button>
                  </div>

                  <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06] p-2 space-y-1">
                    <div className="flex justify-between py-1.5 px-2">
                      <span className="text-[#86868B]">Beneficiary Account Name:</span>
                      <span className="font-semibold text-right">OUTCOME-INDEXED AI SPEND ROUTER / ARVIND VADIVELU</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 items-center">
                      <span className="text-[#86868B]">Bank Name:</span>
                      <span className="font-medium">ICICI Bank Limited</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 items-center">
                      <span className="text-[#86868B]">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">000405001234</span>
                        <button
                          onClick={() => copyToClipboard("000405001234", "accNum")}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#0050FF]"
                        >
                          {copiedField === "accNum" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 items-center">
                      <span className="text-[#86868B]">Account Type:</span>
                      <span className="font-medium">Current Account (Corporate / Business)</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 items-center">
                      <span className="text-[#86868B]">SWIFT / BIC Code:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">ICICINBBCTS</span>
                        <button
                          onClick={() => copyToClipboard("ICICINBBCTS", "swift")}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#0050FF]"
                        >
                          {copiedField === "swift" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 items-center">
                      <span className="text-[#86868B]">IFSC Code:</span>
                      <span className="font-mono font-medium">ICIC0000004</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 items-center">
                      <span className="text-[#86868B]">RBI Purpose Code:</span>
                      <span className="font-mono font-medium">P0802 (Software Consultancy & AI Services)</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 items-center">
                      <span className="text-[#86868B]">Intermediary US Bank:</span>
                      <span className="font-medium">JPMorgan Chase Bank N.A., New York (SWIFT: CHASUS33)</span>
                    </div>
                  </div>
                </div>

                {/* SWIFT Reference Input */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <label>Enter SWIFT MT103 Reference / Wire UTR</label>
                    <span className="text-[#86868B] font-normal">For immediate provisional plan activation</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WIRE-ICICI-US-994812"
                      value={utrCode}
                      onChange={(e) => setUtrCode(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.12] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0050FF]"
                    />
                    <button
                      onClick={handleVerifyPayment}
                      disabled={isVerifying}
                      className="px-6 py-2.5 rounded-xl bg-[#0050FF] hover:bg-[#0043D6] text-white font-medium text-sm transition-all shrink-0 flex items-center gap-2"
                    >
                      {isVerifying ? "Submitting..." : "Submit Wire Ref"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  {verificationError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {verificationError}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer Trust Guarantee */}
            <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs text-[#86868B]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Tax Compliant with GST Invoices & Zero Prompt Retention</span>
              </div>
              <span>Instant Automated Activation</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
