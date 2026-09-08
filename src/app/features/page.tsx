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
  Clock,
  Activity,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

export default function FeaturesPage() {
  const [activeArchTab, setActiveArchTab] = useState<"prewarm" | "sla" | "diff" | "federation" | "gateway">("prewarm");
  const [activeCodeTab, setActiveCodeTab] = useState<"python" | "node" | "curl">("python");
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);

  const archDetails = {
    prewarm: {
      step: "01",
      title: "Predictive Keystroke Speculative Pre-Warming",
      tagline: "75.6% TTFT Reduction · Sub-70ms First Token",
      desc: "Keystroke buffer stream classifier predicts user prompt intent and pre-emptively assigns lightweight SLM tensor contexts across GPU hot-slots while the user is typing.",
      kpis: [
        { label: "TTFT Drop", val: "280ms → 68.4ms" },
        { label: "Speculative Hit Rate", val: "91.1%" },
        { label: "GPU Slot Efficiency", val: "4 Hot Slots" }
      ]
    },
    sla: {
      step: "02",
      title: "Outcome-Bound Micro-SLA Contracts & Auto-Refund Escrow",
      tagline: "Cryptographic SLA Guarantee with $0 Failover Loss",
      desc: "Every API call generates an immutable SHA-256 micro-contract. Upstream latency or quality breaches instantly failover to backup models at zero overage cost and log vendor token refund credits.",
      kpis: [
        { label: "Contract Compliance", val: "99.2%" },
        { label: "Escrow Recovery Rate", val: "100% Guaranteed" },
        { label: "Failover Overhead", val: "<20ms Zero-Loss" }
      ]
    },
    diff: {
      step: "03",
      title: "Differential Semantic Delta Compression",
      tagline: "60.3% Prompt Token Reduction via Pointer Diffing",
      desc: "Replaces repetitive multi-turn conversation trees and static system prompts with cryptographic <delta_ref:...> pointers, transmitting only new semantic deltas.",
      kpis: [
        { label: "Tokens Avoided", val: "512,400+ / mo" },
        { label: "Compression Ratio", val: "60.3%" },
        { label: "Dollar Savings", val: "+$17.93 / seat" }
      ]
    },
    federation: {
      step: "04",
      title: "Cross-Tenant Prior Federation (Thompson Sampling)",
      tagline: "Zero Cold-Start Routing via Differential Privacy (ε=0.5)",
      desc: "Blends local tenant data with anonymous Beta distribution consensus priors from 480+ enterprise SaaS workloads with rigorous privacy noise injection.",
      kpis: [
        { label: "Privacy Guarantees", val: "ε=0.5 DP Certified" },
        { label: "Participating Tenants", val: "480+ SaaS Apps" },
        { label: "Cold-Start Jumpstart", val: "Immediate 95%+" }
      ]
    },
    gateway: {
      step: "05",
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

print(f"Optimal Model Selected: {response.model_routed}")
print(f"Avoided Spend: {response.oir_spend_avoided_pct}%")`,
    node: `// Node.js / TypeScript SDK
import { OutcomeRouter } from "@outcomerouter/sdk";

const oir = new OutcomeRouter({ apiKey: process.env.OIR_API_KEY });

const result = await oir.chat.completions.create({
  taskType: "customer_support",
  slaLatencyMs: 100,
  messages: [{ role: "user", content: "How do I upgrade my seat?" }]
});

console.log("Routed To:", result.model);
console.log("TTFT:", result.ttftMs, "ms");`,
    curl: `# Drop-in OpenAI API Replacement cURL
curl -X POST https://gateway.outcomerouter.ai/v1/chat/completions \\
  -H "Authorization: Bearer oir_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "outcome-auto",
    "task_kpi": "sales_conversion",
    "messages": [{"role": "user", "content": "Generate outbound sequence"}]
  }'`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentArch = archDetails[activeArchTab];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF] antialiased" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-12 sm:pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-24 sm:space-y-32">
        {/* 1. Header */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4 sm:pt-6" suppressHydrationWarning>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08]">
            Architected for <br />
            <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Zero-Loss AI Routing.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed font-normal">
            Five breakthrough infrastructure systems working simultaneously at the network edge to eliminate token waste, accelerate TTFT, and protect SLAs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/auth/signup"
              className="h-12 px-8 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_8px_24px_rgba(0,80,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => setShowSimulate(true)}
              className="h-12 px-8 rounded-full bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-current text-[#0050FF]" />
              <span>Simulate Gateway Request</span>
            </button>
          </div>
        </section>

        {/* 2. Interactive Architecture Deep-Dive Stage Selector */}
        <section className="space-y-8" suppressHydrationWarning>
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-white/80 dark:bg-[#151518]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] max-w-3xl mx-auto shadow-xs">
            {(Object.keys(archDetails) as Array<keyof typeof archDetails>).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveArchTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeArchTab === tab
                    ? "bg-[#0050FF] text-white shadow-xs font-bold"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                }`}
              >
                {tab === "prewarm" ? "1. Pre-Warming" : tab === "sla" ? "2. Micro-SLA" : tab === "diff" ? "3. Delta Diff" : tab === "federation" ? "4. DP Priors" : "5. Core Gateway"}
              </button>
            ))}
          </div>

          <div className="p-8 sm:p-12 rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-[#0050FF] dark:text-[#3374FF] uppercase tracking-wider">
                STAGE {currentArch.step} ARCHITECTURE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {currentArch.title}
              </h2>
              <div className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                {currentArch.tagline}
              </div>
              <p className="text-sm text-[#86868B] leading-relaxed pt-2">
                {currentArch.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
              {currentArch.kpis.map((k, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
                  <span className="text-[11px] text-[#86868B] uppercase font-mono block">{k.label}</span>
                  <span className="text-base font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">{k.val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Structured 4-Pillar Glass Feature Grid */}
        <section className="space-y-12" suppressHydrationWarning>
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Engineered for Outcome Efficiency
            </h2>
            <p className="text-sm text-[#86868B]">
              Every layer designed to run autonomously at network edge proxies
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">Keystroke Pre-Warming</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Predicts user prompt intent while typing via sliding window SLM tensors, reducing TTFT to 68.4ms.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">Sub-70ms Edge Response</span>
              </div>
            </div>

            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">Micro-SLA Escrow</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Cryptographic SHA-256 contracts with instant token refunds if model latency or quality breaches SLA bounds.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">100% Verifiable Refunds</span>
              </div>
            </div>

            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">Semantic Delta Diffing</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Multi-turn chat prompts avoid re-sending conversation prefixes by sending cryptographic &lt;delta_ref&gt; pointers.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">-58.4% Token Payload</span>
              </div>
            </div>

            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">Differential Privacy Priors</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Cross-tenant Bayesian Thompson sampling with ε=0.5 Laplacian noise eliminates cold-start model exploration.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">Zero Cold Start Loss</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 1-Line Code SDK Drop-In Showcase */}
        <section className="p-8 sm:p-12 rounded-[36px] bg-[#0E1117] border border-white/[0.08] text-white shadow-xl max-w-4xl mx-auto space-y-6" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Integrate in Under 60 Seconds
              </h2>
              <p className="text-xs text-neutral-400">
                100% wire-compatible with OpenAI SDK, LangChain, and LiteLLM.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 rounded-full bg-white/10 backdrop-blur-md">
                {(["python", "node", "curl"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                      activeCodeTab === tab ? "bg-white text-black shadow-xs font-bold" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {tab === "node" ? "Node.js" : tab}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-black/60 border border-white/[0.06] overflow-x-auto font-mono text-xs text-neutral-300 leading-relaxed">
            <pre>{codeSnippets[activeCodeTab]}</pre>
          </div>
        </section>

        {/* 5. Enterprise Verification SLA Trust Bar */}
        <section className="p-6 sm:p-8 rounded-[30px] bg-white/60 dark:bg-[#151518]/60 backdrop-blur-2xl border border-black/[0.04] dark:border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-6 text-center" suppressHydrationWarning>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">99.99%</div>
            <div className="text-xs text-[#86868B] font-medium">Gateway Uptime SLA</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">58ms</div>
            <div className="text-xs text-[#86868B] font-medium">Average Edge TTFT</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-xs text-[#86868B] font-medium">Verifiable SHA-256 Escrow</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">0-Code</div>
            <div className="text-xs text-[#86868B] font-medium">SDK Drop-in Migration</div>
          </div>
        </section>

        {/* 6. Apple-Spatial Final Call to Action */}
        <section className="rounded-[36px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-8 sm:p-16 text-white shadow-[0_24px_60px_rgba(0,80,255,0.32)] text-center space-y-6 relative overflow-hidden" suppressHydrationWarning>
          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Upgrade Your AI Gateway?
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              Join leading engineering teams using OutcomeRouter to optimize token spend with zero code changes.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-[#0050FF] font-bold text-xs hover:bg-neutral-100 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/docs"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all border border-white/20 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
              >
                Read API Documentation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Simulation Modal */}
      {showSimulate && <SimulateRequestModal onClose={() => setShowSimulate(false)} />}
    </div>
  );
}
