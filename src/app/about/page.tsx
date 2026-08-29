"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Globe,
  Layers,
  Lock,
  Activity,
  ArrowRight,
  Play,
  Server,
  Radio,
  Clock
} from "lucide-react";
import Link from "next/link";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

export default function AboutPage() {
  const [showSimulate, setShowSimulate] = useState(false);
  const [selectedPoP, setSelectedPoP] = useState<string>("iad");

  const edgePoPs = [
    { id: "iad", region: "US-East (Virginia)", latency: "8.4ms", status: "Optimal", activeBridges: 8 },
    { id: "sfo", region: "US-West (Oregon)", latency: "11.2ms", status: "Optimal", activeBridges: 8 },
    { id: "fra", region: "EU-Central (Frankfurt)", latency: "14.6ms", status: "Optimal", activeBridges: 8 },
    { id: "bom", region: "AP-South (Mumbai)", latency: "16.8ms", status: "Optimal", activeBridges: 8 },
    { id: "nrt", region: "AP-East (Tokyo)", latency: "18.1ms", status: "Optimal", activeBridges: 8 }
  ];

  const currentPoP = edgePoPs.find((p) => p.id === selectedPoP) || edgePoPs[0];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-8 sm:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* 1. Spatial Hero Header */}
        <section className="relative overflow-hidden rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-center space-y-6" suppressHydrationWarning>
          <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-[#0050FF]/20 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF]" />
              <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Our Mission & Infrastructure
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
              Engineering the <br />
              <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Outcome-Indexed AI Economy.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#86868B] max-w-2xl mx-auto leading-relaxed">
              We are replacing price-per-token with cost-per-successful-outcome across the global AI ecosystem.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowSimulate(true)}
                className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Simulate Live Gateway Request</span>
              </button>
              <Link
                href="/docs"
                className="h-10 px-6 rounded-full bg-white/80 dark:bg-[#242428]/80 border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-2 shadow-xs"
              >
                <Cpu className="h-3.5 w-3.5 text-[#0050FF]" />
                <span>Explore Architecture Specs</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Core Architectural Bento Grid */}
        <section className="space-y-6" suppressHydrationWarning>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Built for Zero-Overhead Enterprise Scale
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B]">
              Core architectural pillars delivering high throughput and cryptographic data isolation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1 */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center shadow-xs">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Global Anycast PoPs
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Deployed across 35 edge regions worldwide. Zero-shot intent classification executes in under 12ms of network overhead.
                </p>
              </div>
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">Sub-15ms Routing Overhead</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Zero-Egress Privacy
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Ephemeral in-flight token streaming with strict zero disk persistence and SOC 2 Type II compliance guarantees.
                </p>
              </div>
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">Stateless Proxy Pipeline</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Bayesian Prior Engine
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Continual Thompson sampling with Beta(α, β) distributions dynamically updating win rates on every request outcome.
                </p>
              </div>
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">Dynamic Bandit Convergence</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center shadow-xs">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Cryptographic SLA Escrow
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Real-time SHA-256 nonces tracking latency guarantees with automatic upstream model vendor dispute generation.
                </p>
              </div>
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">100% Deterministic Auditing</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Live Edge PoPs Latency Inspector */}
        <section className="rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-12 shadow-sm space-y-6" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.05] dark:border-white/[0.08] pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Global Anycast Edge Network Health
              </h2>
              <p className="text-xs text-[#86868B]">Select an edge PoP to inspect live wire latencies and bridge availability</p>
            </div>

            <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md">
              {edgePoPs.map((pop) => (
                <button
                  key={pop.id}
                  onClick={() => setSelectedPoP(pop.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full uppercase transition-all ${
                    selectedPoP === pop.id
                      ? "bg-[#0050FF] text-white shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  {pop.id}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B]">PoP Node Region:</span>
              <p className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">{currentPoP.region}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B]">Direct HTTPS Wire Ping:</span>
              <p className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{currentPoP.latency}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B]">Active Model Bridges:</span>
              <p className="font-mono font-bold text-sm text-[#0050FF] dark:text-[#3374FF]">{currentPoP.activeBridges} Providers Connected</p>
            </div>
          </div>
        </section>

        {/* 4. Why We Built Outcome Router */}
        <section className="rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-12 shadow-sm space-y-6" suppressHydrationWarning>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Why We Built Outcome Router
          </h2>
          <div className="space-y-4 text-sm text-[#515154] dark:text-[#A1A1A6] leading-relaxed max-w-3xl">
            <p>
              Cost-per-token is a misleading metric in enterprise software. A model that is 50% cheaper per token but fails 20% more often ends up costing 3x more through retries, lost customer conversion, and degraded user trust.
            </p>
            <p>
              Outcome-Indexed AI Spend Router was created to bring capital efficiency and accountability to generative AI engineering. By indexing decisions to real-world business outcomes (PR merge rates, demo bookings, first-contact resolution), engineering teams maximize product quality while cutting spend by 40%+.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-black/[0.05] dark:border-white/[0.08]">
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] space-y-1">
              <span className="text-xs text-[#86868B]">Global Network Nodes</span>
              <div className="text-2xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">35 Edge PoPs</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] space-y-1">
              <span className="text-xs text-[#86868B]">Supported Providers</span>
              <div className="text-2xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">12+ Gateways</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] space-y-1">
              <span className="text-xs text-[#86868B]">Average Spend Recovery</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">42.8% Saved</div>
            </div>
          </div>
        </section>

        {/* 5. CTA Footer Card */}
        <section className="rounded-[36px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-8 sm:p-14 text-white shadow-[0_20px_50px_rgba(0,80,255,0.35)] text-center space-y-6 relative overflow-hidden" suppressHydrationWarning>
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start Optimizing Your AI Infrastructure
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Integrate in 1 line of code. Free tier includes 10,000 monthly tokens with zero credit card required.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-[#0050FF] font-bold text-xs hover:bg-neutral-100 transition-all shadow-md hover:scale-105 active:scale-95"
              >
                Get Started Free
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all border border-white/20 hover:scale-105 active:scale-95"
              >
                Contact Sales
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
