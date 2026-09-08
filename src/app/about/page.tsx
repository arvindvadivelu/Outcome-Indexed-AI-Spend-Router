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
  Clock,
  ChevronRight
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
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF] antialiased" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-12 sm:pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-24 sm:space-y-32">
        {/* 1. Header */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4 sm:pt-6" suppressHydrationWarning>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08]">
            Engineering the <br />
            <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Outcome-Indexed AI Economy.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed font-normal">
            We are replacing price-per-token with cost-per-successful-outcome across the global AI ecosystem.
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
              <span>Simulate Gateway</span>
            </button>
          </div>
        </section>

        {/* 2. Interactive Global Edge PoP Network Telemetry */}
        <section className="p-8 sm:p-12 rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm max-w-4xl mx-auto space-y-6" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#0050FF]" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Global Anycast Edge Network
                </h2>
              </div>
              <p className="text-xs text-[#86868B]">
                Sub-20ms multi-region gateway points arbitrating upstream LLM connections worldwide.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {edgePoPs.map((pop) => (
                <button
                  key={pop.id}
                  onClick={() => setSelectedPoP(pop.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase font-mono transition-all ${
                    selectedPoP === pop.id
                      ? "bg-[#0050FF] text-white shadow-xs font-bold"
                      : "bg-black/[0.03] dark:bg-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                  }`}
                >
                  {pop.id}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <span className="text-[#86868B] block text-[10px] uppercase font-bold">PoP Location</span>
              <span className="font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">{currentPoP.region}</span>
            </div>
            <div>
              <span className="text-[#86868B] block text-[10px] uppercase font-bold">Edge Ping Latency</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{currentPoP.latency}</span>
            </div>
            <div>
              <span className="text-[#86868B] block text-[10px] uppercase font-bold">Active LLM Bridges</span>
              <span className="font-extrabold text-[#0050FF] dark:text-[#3374FF] text-sm">{currentPoP.activeBridges} Synchronized</span>
            </div>
          </div>
        </section>

        {/* 3. Core Architectural Pillars Bento Grid */}
        <section className="space-y-12" suppressHydrationWarning>
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Built for Zero-Overhead Scale
            </h2>
            <p className="text-sm text-[#86868B]">
              Core architectural pillars delivering high throughput and cryptographic data isolation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
                  <Server className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">Zero-State Proxies</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Ephemeral edge nodes process request streams without persisting raw prompt payloads to disk.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">SOC2 Type II Ready</span>
              </div>
            </div>

            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">SHA-256 Escrow</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Deterministic cryptographic validation for quality, latency, and automated token recovery.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">100% Verifiable</span>
              </div>
            </div>

            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">Dynamic Cache</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Sub-10ms semantic prefix diffing avoiding multi-turn token bloat across LLM endpoints.
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
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">DP Priors</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Differential privacy priors with mathematical ε=0.5 guarantees for immediate routing convergence.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">Zero Cold Start</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Enterprise SLA Trust Bar */}
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

        {/* 5. Apple-Spatial Final Call to Action */}
        <section className="rounded-[36px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-8 sm:p-16 text-white shadow-[0_24px_60px_rgba(0,80,255,0.32)] text-center space-y-6 relative overflow-hidden" suppressHydrationWarning>
          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Join the Outcome-Indexed Movement
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              Deploy the gateway in under 60 seconds with zero infrastructure changes.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-[#0050FF] font-bold text-xs hover:bg-neutral-100 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all border border-white/20 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
              >
                Contact Team
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
