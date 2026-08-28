"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  CheckCircle2,
  ExternalLink,
  Bot,
  Plug,
  Code2,
  Copy,
  Check,
  X,
  Zap,
  Activity,
  Key,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function IntegrationsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [integrations, setIntegrations] = useState([
    {
      id: "langchain",
      name: "LangChain & LangGraph",
      category: "Framework",
      connected: true,
      latency: "14ms",
      desc: "Drop-in LLM router wrapper for LangChain chains and agentic graphs."
    },
    {
      id: "llamaindex",
      name: "LlamaIndex RAG",
      category: "Framework",
      connected: true,
      latency: "18ms",
      desc: "Query router for document retrieval & semantic synthesis pipelines."
    },
    {
      id: "litellm",
      name: "LiteLLM Gateway Proxy",
      category: "Proxy",
      connected: true,
      latency: "11ms",
      desc: "Universal OpenAI-compatible reverse proxy with Bayesian Thompson routing."
    },
    {
      id: "vercel",
      name: "Vercel AI SDK",
      category: "Framework",
      connected: true,
      latency: "8ms",
      desc: "Next.js edge runtime streaming with speculative pre-warmed TTFT."
    },
    {
      id: "crewai",
      name: "CrewAI Multi-Agent",
      category: "Agents",
      connected: false,
      latency: "—",
      desc: "Cost & outcome optimizer for autonomous multi-agent task execution."
    },
    {
      id: "deepseek",
      name: "DeepSeek Native API",
      category: "Provider",
      connected: true,
      latency: "95ms",
      desc: "Direct integration with DeepSeek-V3 & DeepSeek-Coder at $0.0006/req."
    },
    {
      id: "groq",
      name: "Groq LPU Acceleration",
      category: "Provider",
      connected: true,
      latency: "84ms",
      desc: "Sub-100ms ultra-low latency inference for customer support FAQ."
    },
    {
      id: "anthropic",
      name: "Anthropic Claude 3.5",
      category: "Provider",
      connected: true,
      latency: "140ms",
      desc: "Frontier reasoning and code generation with cryptographic SLA escrow."
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Connection Dialog
  const [connectingItem, setConnectingItem] = useState<any>(null);
  const [providerKey, setProviderKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Diagnostics state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  const handleTestDiagnostics = () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);

    setTimeout(() => {
      setDiagnosticResult({
        healthyCount: 7,
        avgPingMs: 12.4,
        status: "All upstream API bridges operational with zero SLA timeout breaches."
      });
      setIsDiagnosing(false);
    }, 500);
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerKey.trim()) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === connectingItem.id
            ? { ...item, connected: true, latency: "24ms" }
            : item
        )
      );
      setIsVerifying(false);
      setConnectingItem(null);
      setProviderKey("");
    }, 600);
  };

  const handleToggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item
      )
    );
  };

  const filteredIntegrations = integrations.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Ecosystem & SDK Integrations
            </h1>
            <p className="text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Connect LangChain, LlamaIndex, LiteLLM, and upstream model providers with zero configuration changes.
            </p>
          </div>

          <button
            onClick={handleTestDiagnostics}
            disabled={isDiagnosing}
            className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start lg:self-auto shrink-0"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>{isDiagnosing ? "Pinging Bridges..." : "Ping Health Diagnostics"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Connected Bridges</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono">
              {integrations.filter(i => i.connected).length} / {integrations.length}
            </div>
            <div className="text-xs text-white/70 mt-1">OpenAI Wire-Compatible</div>
          </div>
          <span className="text-[11px] text-white/80">Active Edge Proxy</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Average Gateway Overhead</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">12.4ms</div>
            <div className="text-xs text-[#86868B] mt-1">Zero-copy streaming pipeline</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Sub-15ms Wire Latency</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">SDK Compatibility</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">100% Drop-In</div>
            <div className="text-xs text-[#86868B] mt-1">Python & TypeScript</div>
          </div>
          <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-semibold">Change 1 base_url parameter</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Security Architecture</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">Encrypted</div>
            <div className="text-xs text-[#86868B] mt-1">Zero Egress Private VPC</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">BYOK Key Vaulting</span>
        </div>
      </div>

      {/* Diagnostics Result Drawer */}
      {diagnosticResult && (
        <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-2 animate-in fade-in" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#0050FF]" />
              <span>Bridge Diagnostics: {diagnosticResult.healthyCount} Operational ({diagnosticResult.avgPingMs}ms Avg Ping)</span>
            </h3>
            <button onClick={() => setDiagnosticResult(null)} className="text-xs text-[#86868B] hover:text-[#1D1D1F]">Dismiss</button>
          </div>
          <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{diagnosticResult.status}</p>
        </div>
      )}

      {/* 3. Category Filter Capsule */}
      <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md overflow-x-auto">
        {[
          { id: "all", label: "All Integrations" },
          { id: "framework", label: "Frameworks" },
          { id: "provider", label: "Providers" },
          { id: "proxy", label: "Proxies" },
          { id: "agents", label: "Agents" }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        {filteredIntegrations.map((item) => (
          <div
            key={item.id}
            className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] uppercase">
                  {item.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  item.connected
                    ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                }`}>
                  {item.connected ? "CONNECTED" : "AVAILABLE"}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0050FF] transition-colors">
                  {item.name}
                </h3>
                <p className="text-[11px] text-[#86868B] mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#86868B]">Latency: {item.latency}</span>
              <button
                onClick={() => {
                  if (item.connected) {
                    setSelectedIntegration(item);
                  } else {
                    setConnectingItem(item);
                  }
                }}
                className="px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-[11px] font-semibold hover:bg-[#0050FF] hover:text-white transition-all flex items-center gap-1"
              >
                <Code2 className="h-3 w-3" />
                <span>{item.connected ? "Snippet" : "Connect"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Code Snippet Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                {selectedIntegration.name} Integration
              </h3>
              <button
                onClick={() => setSelectedIntegration(null)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] text-white font-mono text-xs space-y-2 overflow-x-auto">
              <div className="text-slate-400"># 1-Line Drop-in router base URL wrapper</div>
              <div className="text-emerald-400">from openai import OpenAI</div>
              <div>client = OpenAI(</div>
              <div className="pl-4 text-cyan-300">base_url=&quot;https://gateway.outcomerouter.ai/v1&quot;,</div>
              <div className="pl-4 text-cyan-300">api_key=&quot;oir_live_8f9a2b...&quot;</div>
              <div>)</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedIntegration(null)}
                className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect API Key Modal */}
      {connectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                Connect {connectingItem.name}
              </h3>
              <button
                onClick={() => setConnectingItem(null)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#86868B]">API Secret Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={providerKey}
                  onChange={(e) => setProviderKey(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConnectingItem(null)}
                  className="px-5 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !providerKey.trim()}
                  className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40"
                >
                  {isVerifying ? "Verifying..." : "Verify & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
