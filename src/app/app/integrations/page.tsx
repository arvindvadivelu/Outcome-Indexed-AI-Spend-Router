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
  ChevronRight,
  Terminal,
  Cpu,
  Globe,
  Play,
  Plus,
  AlertCircle,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";
import { getPlanFeatures, isConnectorAllowed } from "@/lib/plan-gates";

export default function IntegrationsPage() {
  const { planTier, integrations, setIntegrations, connectIntegration, addCustomIntegration } = useAppStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const plan = getPlanFeatures(planTier);

  // Upgrade Requirement Modal State
  const [upgradeModalInfo, setUpgradeModalInfo] = useState<{ title: string; desc: string; targetPlan: string } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<"python" | "typescript" | "curl">("python");
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);

  // Connection Dialog
  const [connectingItem, setConnectingItem] = useState<any>(null);
  const [providerKey, setProviderKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Custom Integration Modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("Provider");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customKey, setCustomKey] = useState("");

  // Diagnostics state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  // Capacity Limits
  const bridgeLimit = planTier === "starter" ? 10 : (planTier === "growth" ? 20 : (planTier === "enterprise" ? 100 : 5));
  const connectedCount = integrations.filter((i) => i.connected).length;
  const isBridgeLimitReached = connectedCount >= bridgeLimit;

  const handleTestDiagnostics = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);

    try {
      const res = await fetch("/api/integrations/diagnostics", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setDiagnosticResult(data);
      }
    } catch (err) {
      console.warn("Diagnostics fallback:", err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingItem || !providerKey.trim() || isBridgeLimitReached) return;

    setIsVerifying(true);
    try {
      const res = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: connectingItem.id,
          apiKey: providerKey.trim()
        })
      });
      const data = await res.json();

      if (data.success) {
        connectIntegration(connectingItem.id, "24ms");
        setConnectingItem(null);
        setProviderKey("");
      }
    } catch (err) {
      console.warn("Connect fallback:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateCustomIntegration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customBaseUrl.trim() || isBridgeLimitReached) return;

    const newId = `custom_${Date.now()}`;
    const newIntegration = {
      id: newId,
      name: customName.trim(),
      category: customCategory,
      connected: true,
      latency: "19ms",
      desc: customDesc.trim() || `Custom wire-compatible gateway connected at ${customBaseUrl.trim()}`,
      docsUrl: customBaseUrl.trim()
    };

    addCustomIntegration(newIntegration);
    setShowCustomModal(false);
    setCustomName("");
    setCustomBaseUrl("");
    setCustomDesc("");
    setCustomKey("");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredIntegrations = integrations.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getSnippets = (item: any) => {
    return {
      python: `# 1-Line Drop-in router for ${item.name}\nfrom openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://gateway.outcomerouter.ai/v1",\n    api_key="oir_live_8f9a2b..."\n)\n\nresponse = client.chat.completions.create(\n    model="outcome-optimized",\n    messages=[{"role": "user", "content": "Analyze user intent..."}],\n    extra_headers={"X-Outcome-Strategy": "pacing_optimized"}\n)\nprint(response.choices[0].message.content)`,
      typescript: `// Next.js & Vercel AI SDK Integration\nimport { createOpenAI } from '@ai-sdk/openai';\nimport { generateText } from 'ai';\n\nconst gateway = createOpenAI({\n  baseURL: 'https://gateway.outcomerouter.ai/v1',\n  apiKey: process.env.OUTCOME_ROUTER_API_KEY!,\n});\n\nconst { text } = await generateText({\n  model: gateway('outcome-optimized'),\n  prompt: 'Generate unit tests for auth middleware',\n});`,
      curl: `curl -X POST https://gateway.outcomerouter.ai/v1/chat/completions \\\n  -H "Authorization: Bearer oir_live_8f9a2b..." \\\n  -H "Content-Type: application/json" \\\n  -H "X-Outcome-Strategy: cost_minimal" \\\n  -d '{\n    "model": "outcome-optimized",\n    "messages": [{"role": "user", "content": "Hello Outcome Router"}]\n  }'`
    };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Ecosystem & SDK Integrations
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isBridgeLimitReached
                  ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300"
                  : "bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] border border-[#0050FF]/20"
              }`}>
                {connectedCount} / {bridgeLimit} Active Bridges
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Connect LangChain, LlamaIndex, LiteLLM, and upstream model providers with zero configuration changes and 1-line baseURL swaps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Custom Integration Button */}
            <button
              onClick={() => {
                if (!plan.canUseCustomIntegrations) {
                  setUpgradeModalInfo({
                    title: "Custom Ecosystem Integrations (Starter+ Feature)",
                    desc: "Custom private VPC, local Ollama nodes, and dedicated vLLM cluster endpoints are unlocked on Starter & Growth tiers. Free tier includes OpenAI, Anthropic, and Groq standard connectors.",
                    targetPlan: "Starter"
                  });
                } else {
                  setShowCustomModal(true);
                }
              }}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] hover:bg-[#F5F5F7] transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Custom Integration</span>
            </button>

            <button
              onClick={handleTestDiagnostics}
              disabled={isDiagnosing}
              className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start lg:self-auto shrink-0 disabled:opacity-50"
            >
              <Activity className={`h-3.5 w-3.5 ${isDiagnosing ? "animate-spin" : ""}`} />
              <span>{isDiagnosing ? "Pinging Bridges..." : "Ping Health Diagnostics"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Connected Bridges</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono">
              {connectedCount} / {bridgeLimit}
            </div>
            <div className="text-xs text-white/70 mt-1">{isBridgeLimitReached ? "Bridge limit reached" : `${bridgeLimit - connectedCount} bridges available`}</div>
          </div>
          <span className="text-[11px] text-white/80 capitalize">{planTier || "Free"} Plan Allocation</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Average Gateway Overhead</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">12.4ms</div>
            <div className="text-xs text-[#86868B] mt-1">Zero-copy streaming pipeline</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Sub-15ms Wire Latency</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">SDK Compatibility</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">100% Drop-In</div>
            <div className="text-xs text-[#86868B] mt-1">Python & TypeScript</div>
          </div>
          <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-semibold">Change 1 base_url parameter</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Security Architecture</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">Encrypted</div>
            <div className="text-xs text-[#86868B] mt-1">Zero Egress Private VPC</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">BYOK Key Vaulting</span>
        </div>
      </div>

      {/* Bridge Limit Warning Bar */}
      {isBridgeLimitReached && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>You have reached the maximum connected bridges ({connectedCount}/{bridgeLimit}) for your current tier. Upgrade to unlock more bridges.</span>
          </div>
          <Link
            href="/app/billing"
            className="px-4 py-1.5 rounded-full bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-all shrink-0"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Diagnostics Result Drawer */}
      {diagnosticResult && (
        <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#0050FF]" />
              <span>Bridge Diagnostics: {diagnosticResult.healthyCount} Operational ({diagnosticResult.avgPingMs}ms Avg Ping)</span>
            </h3>
            <button onClick={() => setDiagnosticResult(null)} className="text-xs text-[#86868B] hover:text-[#1D1D1F]">Dismiss</button>
          </div>
          <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{diagnosticResult.status}</p>

          {diagnosticResult.bridges && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {diagnosticResult.bridges.map((b: any, i: number) => (
                <div key={i} className="p-3 rounded-2xl bg-white/80 dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span className="truncate">{b.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {b.latencyMs}ms
                    </span>
                  </div>
                  <p className="text-[10px] text-[#86868B]">{b.category} Bridge · 0% loss</p>
                </div>
              ))}
            </div>
          )}
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
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap hover:scale-105 active:scale-95 ${
              selectedCategory === cat.id
                ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. Integrations Grid with Plan Locking */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        {filteredIntegrations.map((item) => {
          const isAllowed = isConnectorAllowed(planTier, item.id);
          const requiredTier = ["langchain", "llamaindex", "vercel", "crewai"].includes(item.id) ? "Growth" : "Starter";

          return (
            <div
              key={item.id}
              className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] uppercase">
                    {item.category}
                  </span>
                  {isAllowed ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.connected
                        ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                    }`}>
                      {item.connected ? "CONNECTED" : "AVAILABLE"}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" />
                      <span>{requiredTier.toUpperCase()}</span>
                    </span>
                  )}
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
                {isAllowed ? (
                  <button
                    onClick={() => {
                      if (item.connected) {
                        setSelectedIntegration(item);
                      } else {
                        if (isBridgeLimitReached) {
                          alert(`Bridge limit reached (${connectedCount}/${bridgeLimit}). Upgrade plan to connect more.`);
                        } else {
                          setConnectingItem(item);
                        }
                      }
                    }}
                    className="px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-[11px] font-semibold hover:bg-[#0050FF] hover:text-white transition-all flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
                  >
                    <Code2 className="h-3 w-3" />
                    <span>{item.connected ? "Snippet" : "Connect"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setUpgradeModalInfo({
                      title: `${item.name} Connector`,
                      desc: `${item.name} is included in ${requiredTier} tier and above. Free tier includes OpenAI, Anthropic, and Groq standard connectors. Upgrade your workspace to unlock this integration.`,
                      targetPlan: requiredTier
                    })}
                    className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-500 hover:text-white transition-all flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
                  >
                    <Lock className="h-3 w-3" />
                    <span>Upgrade</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Integration Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#0050FF]" />
                <span>Add Custom Integration</span>
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomIntegration} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">Integration Name</label>
                <input
                  type="text"
                  placeholder="e.g. Local Ollama Node, vLLM Cluster"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full h-10 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">Category</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full h-10 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                >
                  <option value="Provider">Provider (OpenAI-compatible)</option>
                  <option value="Framework">Framework / Pipeline</option>
                  <option value="Proxy">Proxy Gateway</option>
                  <option value="Agents">Multi-Agent System</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">Gateway Base URL</label>
                <input
                  type="url"
                  placeholder="http://localhost:11434/v1 or https://ai.corp/v1"
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  className="w-full h-10 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">API Key / Secret (Optional)</label>
                <input
                  type="password"
                  placeholder="sk-custom-..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full h-10 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-5 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-xs font-semibold hover:scale-105 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim() || !customBaseUrl.trim()}
                  className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 shadow-xs hover:scale-105 active:scale-95 transition-all"
                >
                  Add Bridge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code Snippet Modal with Language Tabs */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-[#0050FF] text-white flex items-center justify-center shadow-xs">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {selectedIntegration.name} Integration
                  </h3>
                  <span className="text-[11px] text-[#86868B]">1-Line Wire-Compatible baseURL Swap</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIntegration(null)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Language Selector Tabs */}
            <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80">
              {(["python", "typescript", "curl"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSnippetTab(tab)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full capitalize transition-all hover:scale-105 active:scale-95 ${
                    activeSnippetTab === tab
                      ? "bg-[#0050FF] text-white shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  {tab === "typescript" ? "TypeScript (Vercel AI SDK)" : (tab === "python" ? "Python (OpenAI / LangChain)" : "cURL CLI")}
                </button>
              ))}
            </div>

            {/* Code Block Container */}
            <div className="relative rounded-2xl bg-[#0F172A] text-white font-mono text-xs p-4 overflow-x-auto shadow-inner">
              <pre className="text-[11px] leading-relaxed text-slate-200">
                {getSnippets(selectedIntegration)[activeSnippetTab]}
              </pre>
              <button
                onClick={() => handleCopyCode(getSnippets(selectedIntegration)[activeSnippetTab])}
                className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 transition-all border border-slate-700 shadow-xs hover:scale-105 active:scale-95"
              >
                {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setSelectedIntegration(null);
                  setShowSimulate(true);
                }}
                className="px-4 h-10 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Test in Simulator</span>
              </button>

              <button
                onClick={() => setSelectedIntegration(null)}
                className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-xs hover:scale-105 active:scale-95 transition-all"
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
                  className="px-5 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-xs font-semibold hover:scale-105 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !providerKey.trim()}
                  className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 shadow-xs hover:scale-105 active:scale-95 transition-all"
                >
                  {isVerifying ? "Verifying..." : "Verify & Save Bridge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Upgrade Requirement Modal */}
      {upgradeModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Lock className="h-4 w-4" />
                </div>
                <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {upgradeModalInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setUpgradeModalInfo(null)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">
              {upgradeModalInfo.desc}
            </p>

            <div className="p-3.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 text-xs space-y-1">
              <div className="font-bold text-[#0050FF] dark:text-[#3374FF]">
                Recommended: {upgradeModalInfo.targetPlan} Plan
              </div>
              <p className="text-[11px] text-[#86868B]">
                Unlock expanded ecosystem framework connectors, direct provider gateways, and custom endpoints.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUpgradeModalInfo(null)}
                className="px-5 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-xs font-semibold hover:scale-105 active:scale-95 transition-all"
              >
                Dismiss
              </button>
              <Link
                href="/app/billing"
                onClick={() => setUpgradeModalInfo(null)}
                className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Upgrade Plan</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {showSimulate && (
        <SimulateRequestModal onClose={() => setShowSimulate(false)} />
      )}
    </div>
  );
}
