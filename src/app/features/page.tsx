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
  Play
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  const [activeArchTab, setActiveArchTab] = useState<"gateway" | "prewarm" | "sla" | "diff" | "federation">("prewarm");
  const [activeCodeTab, setActiveCodeTab] = useState<"python" | "node" | "curl">("python");

  const archDetails = {
    prewarm: {
      title: "Feature 1: Predictive Multi-Agent Speculative Pre-Warming",
      tagline: "75.6% TTFT Reduction (Sub-70ms First Token)",
      desc: "Keystroke buffer stream classifier predicts user intent and pre-emptively assigns lightweight SLM tensor contexts across GPU hot-slots while the user is typing.",
      kpis: [
        { label: "TTFT Drop", val: "280ms → 68.4ms" },
        { label: "Speculative Hit Rate", val: "91.1%" },
        { label: "GPU Slot Efficiency", val: "4 Hot Slots" }
      ]
    },
    sla: {
      title: "Feature 2: Outcome-Bound Micro-SLA Contracts & Auto-Refund Escrow",
      tagline: "Cryptographic SLA Guarantee with $0 Failover Loss",
      desc: "Every API call generates an immutable SHA-256 micro-contract. Upstream latency or quality breaches instantly failover to backup models at zero overage cost and log vendor token refund credits.",
      kpis: [
        { label: "Contract Compliance", val: "99.2%" },
        { label: "Escrow Recovery Rate", val: "100% Guaranteed" },
        { label: "Failover Overhead", val: "<20ms Zero-Loss" }
      ]
    },
    diff: {
      title: "Feature 3: Differential Semantic Delta Compression",
      tagline: "60.3% Prompt Token Reduction via Pointer Diffing",
      desc: "Replaces repetitive multi-turn conversation trees and static system prompts with cryptographic `<delta_ref:...>` pointers, transmitting only new semantic deltas.",
      kpis: [
        { label: "Tokens Avoided", val: "512,400+ / mo" },
        { label: "Compression Ratio", val: "60.3%" },
        { label: "Dollar Savings", val: "+$17.93 / seat" }
      ]
    },
    federation: {
      title: "Feature 4: Cross-Tenant Prior Federation (Thompson Sampling)",
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
    python: `# Python SDK Integration\nfrom outcomerouter import OutcomeRouterClient\n\nclient = OutcomeRouterClient(api_key="oir_live_...")\n\nresponse = client.chat.completions.create(\n    task_type="code_generation",\n    target_metric="code_merged",\n    speculative_prewarm=True,\n    messages=[{"role": "user", "content": "Refactor Next.js API route"}]\n)\n\nprint(f"Winner: {response.model} | Saved: {response.saved_pct}% | SLA: {response.sla_hash}")`,
    node: `// Node.js / TypeScript SDK\nimport { OutcomeRouter } from "@outcome-router/sdk";\n\nconst client = new OutcomeRouter({ apiKey: process.env.OIR_API_KEY });\n\nconst res = await client.completions.create({\n  taskType: "sales_email",\n  targetMetric: "demo_booked",\n  maxLatencyMs: 400,\n  messages: [{ role: "user", content: "Write cold email to VP Eng" }]\n});\n\nconsole.log(res.choices[0].message.content);`,
    curl: `# cURL / HTTP Drop-in Gateway\ncurl https://gateway.outcomerouter.ai/v1/chat/completions \\\n  -H "Authorization: Bearer oir_live_8f9a2b..." \\\n  -H "X-Outcome-Strategy: outcome_optimized" \\\n  -H "X-Target-Metric: code_merged" \\\n  -d '{"messages": [{"role": "user", "content": "Write unit tests"}]}'`
  };

  const currentArch = archDetails[activeArchTab];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-8 sm:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Generation AI Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            4 Strategic Breakthroughs in Outcome-Indexed Routing
          </h1>
          <p className="text-sm sm:text-base text-[#86868B]">
            Engineered to achieve peak inference speed, cryptographic SLA reliability, and up to 60%+ net spend reduction.
          </p>
        </div>

        {/* Interactive Architecture Deep Dive Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-6">
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
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
              <h2 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{currentArch.title}</h2>
              <p className="text-xs sm:text-sm text-[#515154] dark:text-[#A1A1A6] leading-relaxed">
                {currentArch.desc}
              </p>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {currentArch.kpis.map((kpi, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.04] dark:border-white/[0.06]">
                    <p className="text-[10px] text-[#86868B]">{kpi.label}</p>
                    <p className="text-xs sm:text-sm font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">{kpi.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA action card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#EEF4FF] to-white dark:from-[#0050FF]/15 dark:to-[#161618] border border-[#0050FF]/20 space-y-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#0050FF] text-white flex items-center justify-center mx-auto shadow-sm shadow-[#0050FF]/30">
                <Play className="h-5 w-5 fill-current" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Test in Live Sandbox</h4>
                <p className="text-xs text-[#86868B]">Run a simulated prompt and observe real-time routing metrics.</p>
              </div>
              <Link
                href="/app/dashboard"
                className="block w-full py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] transition-all shadow-xs"
              >
                Launch Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Developer Code Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
              <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                1-Line Drop-in SDK Integration
              </h3>
            </div>

            <div className="inline-flex p-0.5 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23]">
              {(["python", "node", "curl"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeTab(lang)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    activeCodeTab === lang
                      ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                      : "text-[#86868B]"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-[#0A0A0C] text-[#F5F5F7] font-mono text-xs overflow-x-auto leading-relaxed border border-white/[0.08]">
            {codeSnippets[activeCodeTab]}
          </pre>
        </div>
      </main>

      <Footer />
    </div>
  );
}
