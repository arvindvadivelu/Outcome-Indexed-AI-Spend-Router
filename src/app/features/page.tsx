"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Zap,
  TrendingDown,
  ShieldCheck,
  Cpu,
  Layers,
  Globe,
  Bot,
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  Lock,
  Play,
  Copy,
  Check,
  Sliders,
  Database,
  Radio,
  Clock
} from "lucide-react";
import Link from "next/link";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

export default function FeaturesPage() {
  const [activeArchTab, setActiveArchTab] = useState<"gateway" | "prewarm" | "sla" | "diff" | "federation">("prewarm");
  const [activeCodeTab, setActiveCodeTab] = useState<"python" | "node" | "curl">("python");
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);

  const archDetails = {
    prewarm: {
      title: "1. Predictive Multi-Agent Speculative Pre-Warming",
      tagline: "75.6% TTFT Reduction (Sub-70ms First Token)",
      desc: "Keystroke buffer stream classifier predicts user intent and pre-emptively assigns lightweight SLM tensor contexts across GPU hot-slots while the user is typing.",
      kpis: [
        { label: "TTFT Drop", val: "280ms → 68.4ms" },
        { label: "Speculative Hit Rate", val: "91.1%" },
        { label: "GPU Slot Efficiency", val: "4 Hot Slots" }
      ]
    },
    sla: {
      title: "2. Outcome-Bound Micro-SLA Contracts & Auto-Refund Escrow",
      tagline: "Cryptographic SLA Guarantee with $0 Failover Loss",
      desc: "Every API call generates an immutable SHA-256 micro-contract. Upstream latency or quality breaches instantly failover to backup models at zero overage cost and log vendor token refund credits.",
      kpis: [
        { label: "Contract Compliance", val: "99.2%" },
        { label: "Escrow Recovery Rate", val: "100% Guaranteed" },
        { label: "Failover Overhead", val: "<20ms Zero-Loss" }
      ]
    },
    diff: {
      title: "3. Differential Semantic Delta Compression",
      tagline: "60.3% Prompt Token Reduction via Pointer Diffing",
      desc: "Replaces repetitive multi-turn conversation trees and static system prompts with cryptographic <delta_ref:...> pointers, transmitting only new semantic deltas.",
      kpis: [
        { label: "Tokens Avoided", val: "512,400+ / mo" },
        { label: "Compression Ratio", val: "60.3%" },
        { label: "Dollar Savings", val: "+$17.93 / seat" }
      ]
    },
    federation: {
      title: "4. Cross-Tenant Prior Federation (Thompson Sampling)",
      tagline: "Zero Cold-Start Routing via Differential Privacy (ε=0.5)",
      desc: "Blends local tenant data with anonymous Beta distribution consensus priors from 480+ enterprise SaaS workloads with rigorous privacy noise injection.",
      kpis: [
        { label: "Privacy Guarantees", val: "ε=0.5 DP Certified" },
        { label: "Participating Tenants", val: "480+ SaaS Apps" },
        { label: "Cold-Start Jumpstart", val: "Immediate 95%+" }
      ]
    },
    gateway: {
      title: "Core Gateway: Multi-Model Bayesian Optimization",
      tagline: "Cheapest Model per Successful Outcome",
      desc: "Replaces brute-force model selection with dynamic outcome classification, optimizing token spend against customer conversion KPIs.",
      kpis: [
        { label: "Net Spend Cut", val: "42.0% Less vs GPT-4o" },
        { label: "Outcome Win Rate", val: "93.4% Avg" },
        { label: "Gateway SLA Uptime", val: "99.99%" }
      ]
    }
  };

  const codeSnippets = {
    python: `# Python SDK Integration
from outcomerouter import OutcomeRouterClient

client = OutcomeRouterClient(api_key="oir_live_...")

response = client.chat.completions.create(
    task_type="code_generation",
    target_metric="code_merged",
    speculative_prewarm=True,
    messages=[{"role": "user", "content": "Refactor Next.js API route"}]
)

print(f"Winner: {response.model} | Saved: {response.saved_pct}% | SLA: {response.sla_hash}")`,
    node: `// Node.js / TypeScript SDK
import { OutcomeRouter } from "@outcome-router/sdk";

const client = new OutcomeRouter({ apiKey: process.env.OIR_API_KEY });

const res = await client.completions.create({
  taskType: "sales_email",
  targetMetric: "demo_booked",
  maxLatencyMs: 400,
  messages: [{ role: "user", content: "Write cold email to VP Eng" }]
});

console.log(res.choices[0].message.content);`,
    curl: `# cURL / HTTP Drop-in Gateway
curl https://gateway.outcomerouter.ai/v1/chat/completions \\
  -H "Authorization: Bearer oir_live_8f9a2b..." \\
  -H "X-Outcome-Strategy: outcome_optimized" \\
  -H "X-Target-Metric: code_merged" \\
  -d '{"messages": [{"role": "user", "content": "Write unit tests"}]}'`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentArch = archDetails[activeArchTab];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-8 sm:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* 1. Spatial Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Generation AI Gateway Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            4 Strategic Breakthroughs in <br className="hidden sm:inline" /> Outcome-Indexed Routing
          </h1>
          <p className="text-sm sm:text-base text-[#86868B]">
            Engineered to achieve peak inference speed, cryptographic SLA reliability, and up to 60%+ net spend reduction.
          </p>
        </div>

        {/* 2. Interactive Architecture Deep Dive Card */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6">
          {/* Tab Selector */}
          <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.05] dark:border-white/[0.06] pb-4">
            {[
              { id: "prewarm", label: "1. Speculative Pre-Warming", icon: Cpu },
              { id: "sla", label: "2. Micro-SLA Escrow", icon: ShieldCheck },
              { id: "diff", label: "3. Semantic Delta Diff", icon: Layers },
              { id: "federation", label: "4. Federated Prior Blend", icon: Globe },
              { id: "gateway", label: "Core Gateway", icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveArchTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
                    activeArchTab === tab.id
                      ? "bg-[#0050FF] text-white shadow-sm shadow-[#0050FF]/25"
                      : "bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#515154] dark:text-[#8E8E93] hover:text-[#1D1D1F]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-4">
              <span className="text-xs font-bold font-mono text-[#0050FF] dark:text-[#3374FF] uppercase tracking-wider">
                {currentArch.tagline}
              </span>
              <h2 className="text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">{currentArch.title}</h2>
              <p className="text-xs sm:text-sm text-[#515154] dark:text-[#A1A1A6] leading-relaxed">
                {currentArch.desc}
              </p>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {currentArch.kpis.map((kpi, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.04] dark:border-white/[0.06]">
                    <p className="text-[10px] text-[#86868B] font-semibold">{kpi.label}</p>
                    <p className="text-xs sm:text-sm font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">{kpi.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA action card */}
            <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#EEF4FF] via-white to-[#F5F5F7] dark:from-[#0050FF]/15 dark:via-[#161618] dark:to-[#1C1C1E] border border-[#0050FF]/25 space-y-4 text-center shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-[#0050FF] text-white flex items-center justify-center mx-auto shadow-sm shadow-[#0050FF]/30">
                <Play className="h-5 w-5 fill-current" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Test in Live Sandbox</h4>
                <p className="text-xs text-[#86868B]">Run a simulated prompt and observe real-time routing metrics.</p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setShowSimulate(true)}
                  className="w-full py-2.5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] transition-all shadow-xs hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Simulate Live Prompt</span>
                </button>
                <Link
                  href="/app/dashboard"
                  className="block w-full py-2 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] transition-all"
                >
                  Launch Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Four Core Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center shadow-xs">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">pgvector Semantic Cache</h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Cosine similarity indexing intercepts repeated queries in under 5ms at $0 token cost.
            </p>
          </div>

          <div className="p-6 rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Autopilot Budget Pacing</h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Dynamically shifts routing to cheaper models as monthly ingestion quotas approach ceiling limits.
            </p>
          </div>

          <div className="p-6 rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <Radio className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Real-Time Webhook Feed</h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              HMAC-SHA256 signed event notifications stream latency breaches, routing decisions, and SLA refunds.
            </p>
          </div>

          <div className="p-6 rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Micro-SLA Auto-Escrow</h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Zero-loss failovers with cryptographic escrow logs ensure 100% token refund recovery.
            </p>
          </div>
        </div>

        {/* 4. Interactive Developer Code Section */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
              <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                1-Line Drop-in SDK Integration
              </h3>
            </div>

            <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md">
              {(["python", "node", "curl"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeTab(lang)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full uppercase transition-all ${
                    activeCodeTab === lang
                      ? "bg-[#0050FF] text-white shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl bg-[#0F172A] text-white font-mono text-xs p-4 overflow-x-auto shadow-inner">
            <pre className="text-[11px] leading-relaxed text-slate-200">
              {codeSnippets[activeCodeTab]}
            </pre>
            <button
              onClick={handleCopyCode}
              className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 transition-all border border-slate-700 shadow-xs"
            >
              {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Simulation Modal */}
      {showSimulate && <SimulateRequestModal onClose={() => setShowSimulate(false)} />}
    </div>
  );
}
