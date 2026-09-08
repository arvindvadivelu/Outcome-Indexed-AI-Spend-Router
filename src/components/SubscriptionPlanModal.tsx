"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Check, X, Sparkles, Zap, Shield, CreditCard } from "lucide-react";
import PaymentCheckoutModal from "@/components/PaymentCheckoutModal";
import { syncAuthUserToGoogleSheets } from "@/lib/google-sheets";

export function SubscriptionPlanModal() {
  const {
    isPlanUpgradeModalOpen,
    closePlanUpgradeModal,
    planTier,
    setPlanTier,
    currency,
    orgName,
    user
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<"starter" | "growth" | "enterprise">("growth");
  const [planSwitchNotice, setPlanSwitchNotice] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isPlanUpgradeModalOpen) return null;

  const activeCurrency = currency || "USD";
  const activePlanName = planTier ? planTier.toLowerCase() : "free";

  const allTiers = [
    {
      id: "free" as const,
      name: "Free",
      priceINR: "₹0.00",
      priceUSD: "$0.00",
      period: "forever",
      tokensText: "10,000 tokens / mo",
      quota: 10000,
      description: "For individual developers exploring outcome-based routing.",
      features: [
        "10,000 monthly tokens included",
        "Thompson Sampling routing engine",
        "OpenAI + Anthropic + Groq connectors",
        "Basic telemetry logs (3 days)",
        "Community Discord support"
      ]
    },
    {
      id: "starter" as const,
      name: "Starter",
      priceINR: "₹2,509",
      priceUSD: "$29",
      period: "per month",
      tokensText: "100,000 tokens / mo",
      quota: 100000,
      description: "For early stage teams deploying LLMs to production.",
      features: [
        "100,000 monthly tokens included",
        "pgvector Semantic Prompt Cache",
        "Zero-Shot Complexity Classifier",
        "30-day telemetry retention",
        "Webhook outcome ingestion",
        "Standard email support"
      ]
    },
    {
      id: "growth" as const,
      name: "Growth",
      priceINR: "₹8,564",
      priceUSD: "$99",
      period: "per month",
      tokensText: "500,000 tokens / mo",
      quota: 500000,
      description: "For scaling engineering teams with heavy multi-turn token volume.",
      highlighted: true,
      features: [
        "500,000 monthly tokens included",
        "Predictive Speculative Pre-Warming (70% TTFT drop)",
        "Micro-SLA Cryptographic Contracts & Auto-Refund Escrow",
        "Semantic Delta Compression (<delta_ref> diffing)",
        "Auto-Pilot Spend Optimizer with Budget Pacing",
        "90-day telemetry retention & CSV audit exports",
        "Priority Slack support & 99.9% Uptime SLA"
      ]
    },
    {
      id: "enterprise" as const,
      name: "Enterprise",
      priceINR: "₹25,864",
      priceUSD: "$299",
      period: "per month",
      tokensText: "2,000,000 tokens / mo",
      quota: 2000000,
      description: "For high-scale platforms requiring dedicated VPC latency.",
      features: [
        "2M+ monthly tokens included (custom overages)",
        "Custom Cross-Tenant Differential Privacy Prior Blend",
        "Private VPC Deployments & Custom LLM Finetune endpoints",
        "SOC2 Type II, HIPAA, and GDPR compliant logs",
        "Custom synthetic judge fine-tuning",
        "Dedicated Solutions Architect & 99.99% Gateway SLA"
      ]
    }
  ];

  const handleSelectFree = async () => {
    setPlanTier("free");
    setPlanSwitchNotice("Subscribed to FREE tier! 10,000 tokens active.");

    if (user?.email) {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, plan_tier: "free", monthly_token_quota: 10000 })
      }).catch(() => {});
    }

    await syncAuthUserToGoogleSheets({
      action: "PLAN_UPGRADE",
      name: user?.name || "",
      email: user?.email || "",
      workspace: orgName || "",
      plan_tier: "Free",
      monthly_token_quota: 10000,
      currency: activeCurrency,
      auth_method: "MANUAL"
    });

    setTimeout(() => {
      setPlanSwitchNotice(null);
      closePlanUpgradeModal();
    }, 1200);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
        <div className="bg-[#121215] text-[#F5F5F7] border border-white/[0.1] rounded-[36px] p-6 sm:p-10 max-w-6xl w-full shadow-2xl space-y-6 my-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Choose Your Subscription Plan
              </h2>
              <p className="text-xs sm:text-sm text-[#86868B]">
                Select a tier to instantly upgrade your monthly token quota and unlock advanced subsystems
              </p>
            </div>
            <button
              onClick={closePlanUpgradeModal}
              className="h-9 w-9 rounded-full bg-[#1F1F23] flex items-center justify-center text-[#86868B] hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {planSwitchNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 animate-in fade-in">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>{planSwitchNotice}</span>
            </div>
          )}

          {/* 4 Cards Grid Matching User Screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            {allTiers.map((tier) => {
              const isCurrent = activePlanName === tier.id;
              const price = activeCurrency === "INR" ? tier.priceINR : tier.priceUSD;

              return (
                <div
                  key={tier.id}
                  className={`rounded-[30px] p-6 flex flex-col justify-between space-y-5 transition-all relative ${
                    tier.highlighted
                      ? "border-2 border-[#0050FF] bg-gradient-to-b from-[#0050FF]/15 via-[#18181B] to-[#121214] shadow-lg shadow-[#0050FF]/20 ring-1 ring-[#0050FF]/30"
                      : "border border-white/[0.08] bg-[#1A1A1E]"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-[#0050FF] text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-base text-white">{tier.name}</h4>
                      <p className="text-[11px] text-[#86868B] leading-relaxed mt-1">{tier.description}</p>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold font-mono text-white">{price}</span>
                        <span className="text-[11px] text-[#86868B]">/{tier.period}</span>
                      </div>
                      <div className="text-xs font-bold font-mono text-[#0050FF] dark:text-[#3374FF] mt-0.5">
                        {tier.tokensText}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] space-y-2">
                      {tier.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-[11px] text-[#A1A1A6]">
                          <Check className="h-3.5 w-3.5 text-[#0050FF] shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (tier.id === "free") {
                        handleSelectFree();
                      } else {
                        setCheckoutPlan(tier.id);
                        setCheckoutModalOpen(true);
                      }
                    }}
                    disabled={isCurrent}
                    className={`w-full h-11 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 ${
                      isCurrent
                        ? "bg-[#1E3A2F] text-[#81C995] cursor-default border border-[#137333]/40"
                        : tier.highlighted
                        ? "bg-[#0050FF] text-white hover:bg-[#0043D6] shadow-[0_4px_16px_rgba(0,80,255,0.4)]"
                        : "bg-[#28282C] text-white hover:bg-[#343438] border border-white/[0.08]"
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Current Active Plan</span>
                      </>
                    ) : (
                      <span>{tier.id === "free" ? "Switch to Free" : "Pay via GPay / ICICI Wire"}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Checkout Modal for GPay UPI & ICICI Wire */}
      <PaymentCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        initialPlan={checkoutPlan}
        initialCurrency={activeCurrency === "INR" ? "INR" : "USD"}
        onSuccess={() => {
          setPlanSwitchNotice(`Subscribed to ${checkoutPlan.toUpperCase()} tier! Quota updated.`);
          setTimeout(() => {
            setPlanSwitchNotice(null);
            setCheckoutModalOpen(false);
            closePlanUpgradeModal();
          }, 1500);
        }}
      />
    </>
  );
}
