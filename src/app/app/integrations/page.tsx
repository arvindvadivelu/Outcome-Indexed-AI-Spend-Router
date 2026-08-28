"use client";

import { useState } from "react";
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
  ShieldCheck
} from "lucide-react";

export default function IntegrationsPage() {
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

  const filtered = integrations.filter(
    (item) => selectedCategory === "all" || item.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const handleOpenConnect = (item: any) => {
    setConnectingItem(item);
    setProviderKey("");
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerKey.trim()) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((it) => (it.id === connectingItem.id ? { ...it, connected: true, latency: "12ms" } : it))
      );
      setIsVerifying(false);
      setConnectingItem(null);
    }, 600);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((it) => (it.id === id ? { ...it, connected: false, latency: "—" } : it))
    );
  };

  const handleRunDiagnostics = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      setDiagnosticResult({
        status: "All 7 Connected Connectors Healthy",
        recommendation: "LiteLLM, LangChain, and Vercel AI SDK edge routes verified with sub-15ms proxy latency. Circuit breaker and SLA escrow active."
      });
      setIsDiagnosing(false);
    }, 450);
  };

  const getCodeSnippet = (item: any) => {
    if (item.id === "langchain") {
      return `from langchain_openai import ChatOpenAI\n\n# Point LangChain to OutcomeRouter Gateway\nllm = ChatOpenAI(\n    base_url="https://gateway.outcomerouter.ai/v1",\n    api_key="oir_live_...",\n    model="outcome-indexed-auto",\n    extra_body={"strategy": "outcome_optimized", "target_metric": "demo_booked"}\n)`;
    }
    if (item.id === "litellm") {
      return `model_list:\n  - model_name: outcome-router\n    litellm_params:\n      model: openai/outcome-indexed-auto\n      api_base: https://gateway.outcomerouter.ai/v1\n      api_key: os.environ/OUTCOME_ROUTER_KEY`;
    }
    return `import { OpenAI } from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://gateway.outcomerouter.ai/v1",\n  apiKey: process.env.OUTCOME_ROUTER_KEY\n});\n\nconst res = await client.chat.completions.create({\n  model: "outcome-indexed-auto",\n  messages: [{ role: "user", content: "..." }],\n  headers: { "X-Outcome-Strategy": "outcome_optimized" }\n});`;
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Integrations & SDK Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Connect OutcomeRouter into your LangChain, LiteLLM, Vercel AI, and agent workflows
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <div className="inline-flex p-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23]">
            {[
              { id: "all", label: "All" },
              { id: "framework", label: "Frameworks" },
              { id: "provider", label: "Providers" },
              { id: "proxy", label: "Proxies" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  selectedCategory === tab.id
                    ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRunDiagnostics}
            disabled={isDiagnosing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#F5F5F7] hover:text-[#1D1D1F] shadow-xs transition-all"
          >
            <Bot className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF]" />
            <span>{isDiagnosing ? "Checking..." : "Health Check"}</span>
          </button>
        </div>
      </div>

      {/* Diagnostics panel */}
      {diagnosticResult && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-1 animate-in fade-in text-xs">
          <span className="text-[#0050FF] dark:text-[#3374FF] font-semibold block flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>{diagnosticResult.status}</span>
          </span>
          <p className="text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{diagnosticResult.recommendation}</p>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#0050FF] dark:text-[#3374FF] bg-[#EEF4FF] dark:bg-[#0050FF]/20 px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.connected
                      ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                      : "bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#86868B]"
                  }`}
                >
                  {item.connected ? "Active ✓" : "Disconnected"}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">{item.name}</h3>
                <p className="text-xs text-[#86868B] mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
              <button
                onClick={() => setSelectedIntegration(item)}
                className="text-xs text-[#0050FF] dark:text-[#3374FF] font-medium hover:underline flex items-center gap-1"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Code Setup</span>
              </button>

              {item.connected ? (
                <button
                  onClick={() => handleDisconnect(item.id)}
                  className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleOpenConnect(item)}
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-[#0050FF] text-white hover:bg-[#0043D6] transition-all shadow-xs"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Code Snippet Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
              <div>
                <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {selectedIntegration.name} Integration
                </h3>
                <p className="text-xs text-[#86868B]">1-line drop-in configuration</p>
              </div>
              <button onClick={() => setSelectedIntegration(null)} className="text-[#86868B] hover:text-[#1D1D1F]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#1F1F23] overflow-x-auto text-xs text-[#1D1D1F] dark:text-[#F5F5F7] font-mono leading-relaxed">
                {getCodeSnippet(selectedIntegration)}
              </pre>
              <button
                onClick={() => handleCopyCode(getCodeSnippet(selectedIntegration))}
                className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white dark:bg-[#2C2C30] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1 shadow-xs"
              >
                {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect API Key Modal */}
      {connectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
              <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                Connect {connectingItem.name}
              </h3>
              <button onClick={() => setConnectingItem(null)} className="text-[#86868B] hover:text-[#1D1D1F]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConnection} className="space-y-3 text-xs">
              <div>
                <label className="text-[#86868B] block mb-1 font-medium">Provider API Key</label>
                <input
                  type="password"
                  required
                  placeholder="sk-..."
                  value={providerKey}
                  onChange={(e) => setProviderKey(e.target.value)}
                  className="w-full h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] font-mono focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConnectingItem(null)}
                  className="px-4 py-2 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#515154] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !providerKey.trim()}
                  className="px-5 py-2 rounded-full bg-[#0050FF] text-white font-semibold shadow-sm shadow-[#0050FF]/25 flex items-center gap-1.5"
                >
                  {isVerifying ? "Verifying..." : "Connect Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
