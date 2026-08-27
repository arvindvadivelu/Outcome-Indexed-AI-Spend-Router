"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  FileText,
  Bot,
  Sparkles,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";

export default function TermsPage() {
  const [slaQuery, setSlaQuery] = useState("Enterprise 99.99% Uptime with Sub-150ms SLA");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [slaResult, setSlaResult] = useState<any>(null);

  const handleSynthesizeSLA = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSynthesizing(true);
    setTimeout(() => {
      setSlaResult({
        tier: "Enterprise Guaranteed SLA",
        uptimeCommitment: "99.99% Monthly Availability",
        p95LatencyCeiling: "150ms Guaranteed with Speculative Dual-Routing",
        financialCreditPolicy: "10% service credit for every 0.1% downtime below SLA threshold",
        customVpcSupport: "Dedicated isolated routing proxies included"
      });
      setIsSynthesizing(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-12">
        <div className="space-y-3 border-b border-[#E5E5EA] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20 text-[#0050FF] text-xs font-semibold">
            <FileText className="h-3.5 w-3.5" />
            <span>Service Terms & AI SLA Synthesizer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F]">
            Terms of Service & Enterprise SLA
          </h1>
          <p className="text-sm text-[#6E6E73]">
            Last modified: August 26, 2026 • Valid for all active API keys and organization tenants
          </p>
        </div>

        {/* 1. Interactive AI SLA Synthesizer */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EEF4FF] text-[#0050FF]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1D1D1F]">AI SLA Customizer & Credit Calculator</h3>
                <p className="text-[11px] text-[#86868B]">Simulate custom uptime commitments and latency SLA bounds</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20">
              Interactive SLA
            </span>
          </div>

          <form onSubmit={handleSynthesizeSLA} className="flex gap-2">
            <input
              type="text"
              value={slaQuery}
              onChange={(e) => setSlaQuery(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
              placeholder="Enter your required SLA terms (e.g. 99.99% uptime, 100ms latency)..."
            />
            <button
              type="submit"
              disabled={isSynthesizing}
              className="px-4 py-2 rounded-xl bg-[#0050FF] text-white text-xs font-bold hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50"
            >
              {isSynthesizing ? "Synthesizing..." : "Generate SLA"}
            </button>
          </form>

          {slaResult && (
            <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-[#0050FF]/20 space-y-2 text-xs font-mono animate-in fade-in">
              <div className="flex items-center justify-between text-[#0050FF] font-bold">
                <span>{slaResult.tier}</span>
                <span>{slaResult.uptimeCommitment}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-[#515154]">
                <div>• Latency: <strong>{slaResult.p95LatencyCeiling}</strong></div>
                <div>• Credit Policy: <strong>{slaResult.financialCreditPolicy}</strong></div>
                <div>• Isolation: <strong>{slaResult.customVpcSupport}</strong></div>
              </div>
            </div>
          )}
        </section>

        {/* 2. Terms Text */}
        <div className="space-y-8 text-xs sm:text-sm text-[#515154] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#1D1D1F]">1. API Access & Usage Quotas</h2>
            <p>
              By accessing the Outcome Router API, you agree to route model completion traffic within the assigned rate limits and monthly token volume of your active plan.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#1D1D1F]">2. Outcome Billing & Cost Guarantee</h2>
            <p>
              Outcome-Indexed AI Spend Router charges based on plan subscription and excess token overages at contracted rates. We guarantee continuous optimization against unoptimized provider baseline pricing.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
