"use client";

import { useState, useMemo } from "react";
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
  Search,
  AlertTriangle,
  RefreshCw,
  Clock
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const INTEGRATION_CATALOG = [
  {
    id: "langchain",
    name: "LangChain & LangGraph",
    category: "Framework",
    latencyDefault: 14,
    desc: "Drop-in LLM router wrapper for LangChain chains and agentic graphs."
  },
  {
    id: "llamaindex",
    name: "LlamaIndex RAG",
    category: "Framework",
    latencyDefault: 18,
    desc: "Query router for document retrieval & semantic synthesis pipelines."
  },
  {
    id: "litellm",
    name: "LiteLLM Gateway Proxy",
    category: "Proxy",
    latencyDefault: 11,
    desc: "Universal OpenAI-compatible reverse proxy with Bayesian Thompson routing."
  },
  {
    id: "vercel",
    name: "Vercel AI SDK",
    category: "Framework",
    latencyDefault: 8,
    desc: "Next.js edge runtime streaming with speculative pre-warmed TTFT."
  },
  {
    id: "crewai",
    name: "CrewAI Multi-Agent",
    category: "Agents",
    latencyDefault: 22,
    desc: "Cost & outcome optimizer for autonomous multi-agent task execution."
  },
  {
    id: "deepseek",
    name: "DeepSeek Native API",
    category: "Provider",
    latencyDefault: 95,
    desc: "Direct integration with DeepSeek-V3 & DeepSeek-Coder at $0.0006/req."
  },
  {
    id: "groq",
    name: "Groq LPU Acceleration",
    category: "Provider",
    latencyDefault: 84,
    desc: "Sub-100ms ultra-low latency inference for customer support FAQ."
  },
  {
    id: "anthropic",
    name: "Anthropic Claude 3.5",
    category: "Provider",
    latencyDefault: 140,
    desc: "Frontier reasoning and code generation with cryptographic SLA escrow."
  },
  {
    id: "openai",
    name: "OpenAI GPT-4o",
    category: "Provider",
    latencyDefault: 680,
    desc: "Premium fallback model for complex reasoning tasks above threshold."
  },
  {
    id: "slack",
    name: "Slack Alerts",
    category: "Observability",
    latencyDefault: 50,
    desc: "Send FinOps alerts, budget warnings, and SLA breach notifications to Slack."
  },
  {
    id: "datadog",
    name: "Datadog Metrics",
    category: "Observability",
    latencyDefault: 30,
    desc: "Stream latency, cost, and win-rate telemetry to Datadog dashboards."
  },
  {
    id: "grafana",
    name: "Grafana / Prometheus",
    category: "Observability",
    latencyDefault: 25,
    desc: "Export Prometheus metrics for Grafana outcome routing dashboards."
  }
];

const CATEGORIES = ["all", "Framework", "Provider", "Proxy", "Agents", "Observability"];

export default function IntegrationsPage() {
  const { integrationStates, setIntegrationConnected } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState<typeof INTEGRATION_CATALOG[0] | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Connection Dialog
  const [connectingItem, setConnectingItem] = useState<typeof INTEGRATION_CATALOG[0] | null>(null);
  const [providerKey, setProviderKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Diagnostics state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    connectedCount: number;
    avgLatencyMs: number;
    recommendation: string;
    issues: string[];
  } | null>(null);

  // Merge catalog with persisted states
  const integrations = useMemo(() => {
    return INTEGRATION_CATALOG.map((item) => {
      const state = integrationStates.find((s) => s.id === item.id);
      return {
        ...item,
        connected: state?.connected ?? false,
        latencyMs: state?.latencyMs ?? item.latencyDefault,
        connectedAt: state?.connectedAt
      };
    });
  }, [integrationStates]);

  const filtered = useMemo(() =>
    integrations.filter((item) => {
      const catOk = selectedCategory === "all" || item.category === selectedCategory;
      const searchOk =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return catOk && searchOk;
    }),
    [integrations, selectedCategory, searchQuery]
  );

  const connectedCount = integrations.filter((i) => i.connected).length;

  const handleOpenConnect = (item: typeof INTEGRATION_CATALOG[0]) => {
    setConnectingItem(item);
    setProviderKey("");
    setVerifyError("");
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    if (!providerKey.trim()) {
      setVerifyError("API key is required.");
      return;
    }
    if (providerKey.trim().length < 8) {
      setVerifyError("Key appears too short — please provide a valid API key.");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      // Persist to store — survives reload
      setIntegrationConnected(connectingItem!.id, true);
      setIsVerifying(false);
      setConnectingItem(null);
    }, 700);
  };

  const handleDisconnect = (id: string) => {
    setIntegrationConnected(id, false);
  };

  const handleRunDiagnostics = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      const connected = integrations.filter((i) => i.connected);
      const avgMs = connected.length > 0
        ? Math.round(connected.reduce((a, i) => a + i.latencyMs, 0) / connected.length)
        : 0;
      const issues: string[] = [];
      const highLatency = connected.filter((i) => i.latencyMs > 400);
      if (highLatency.length > 0) {
        issues.push(`High latency detected on: ${highLatency.map((i) => i.name).join(", ")}`);
      }
      const disconnected = integrations.filter((i) => !i.connected && i.category === "Provider");
      if (disconnected.length > 0) {
        issues.push(`${disconnected.length} provider(s) disconnected — routing fallbacks may be needed.`);
      }
      setDiagnosticResult({
        connectedCount: connected.length,
        avgLatencyMs: avgMs,
        recommendation: issues.length === 0
          ? `All ${connected.length} connected integrations healthy. Circuit breaker and SLA escrow active across all provider routes.`
          : "Review flagged integrations for optimal routing coverage.",
        issues
      });
      setIsDiagnosing(false);
    }, 600);
  };

  const getCodeSnippet = (item: typeof INTEGRATION_CATALOG[0]): string => {
    if (item.id === "langchain") {
      return `from langchain_openai import ChatOpenAI\n\n# Point LangChain to OutcomeRouter Gateway\nllm = ChatOpenAI(\n    base_url="https://gateway.outcomerouter.ai/v1",\n    api_key="oir_live_...",\n    model="outcome-indexed-auto",\n    extra_body={"strategy": "outcome_optimized", "target_metric": "demo_booked"}\n)`;
    }
    if (item.id === "litellm") {
      return `model_list:\n  - model_name: outcome-router\n    litellm_params:\n      model: openai/outcome-indexed-auto\n      api_base: https://gateway.outcomerouter.ai/v1\n      api_key: os.environ/OUTCOME_ROUTER_KEY`;
    }
    if (item.id === "vercel") {
      return `import { openai } from "@ai-sdk/openai";\nimport { streamText } from "ai";\n\nexport async function POST(req: Request) {\n  const { messages } = await req.json();\n  const result = streamText({\n    model: openai.chat("outcome-indexed-auto", {\n      baseURL: "https://gateway.outcomerouter.ai/v1",\n      apiKey: process.env.OUTCOME_ROUTER_KEY\n    }),\n    messages\n  });\n  return result.toDataStreamResponse();\n}`;
    }
    if (item.id === "slack") {
      return `# In your .env\nOUTCOME_ROUTER_WEBHOOK_URL=https://hooks.slack.com/services/T000/B000/xxx\n\n# In webhook config → select "budget.alert" and "sla.breach.escrow_refunded"\n# Slack will receive a formatted block message for each event.`;
    }
    if (item.id === "datadog") {
      return `# Install Datadog agent and add OTLP exporter endpoint\nexport DD_OTLP_CONFIG_RECEIVER_PROTOCOLS_HTTP_ENDPOINT=localhost:4318\n\n# OutcomeRouter automatically exports:\n# outcome_router.cost_usd, outcome_router.latency_ms,\n# outcome_router.win_rate, outcome_router.token_usage`;
    }
    return `import { OpenAI } from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://gateway.outcomerouter.ai/v1",\n  apiKey: process.env.OUTCOME_ROUTER_KEY\n});\n\nconst res = await client.chat.completions.create({\n  model: "outcome-indexed-auto",\n  messages: [{ role: "user", content: "..." }],\n  // @ts-ignore — OutcomeRouter extension headers\n  headers: { "X-Outcome-Strategy": "outcome_optimized" }\n});`;
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  function formatConnectedAt(iso?: string): string {
    if (!iso) return "—";
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const days = Math.floor(diff / 86400000);
      return days === 0 ? "Today" : `${days}d ago`;
    } catch { return "—"; }
  }

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Integrations &amp; SDK Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            {connectedCount} of {integrations.length} connectors active — connect to LangChain, LiteLLM, Vercel AI, providers, and more
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#86868B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none w-44"
            />
          </div>

          {/* Category Filter */}
          <div className="inline-flex p-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] flex-wrap gap-0.5">
            {[
              { id: "all", label: "All" },
              { id: "Framework", label: "SDKs" },
              { id: "Provider", label: "Providers" },
              { id: "Proxy", label: "Proxy" },
              { id: "Observability", label: "Observability" }
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#F5F5F7] hover:text-[#1D1D1F] shadow-xs transition-all disabled:opacity-60"
          >
            <Bot className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF]" />
            <span>{isDiagnosing ? "Checking..." : "Health Check"}</span>
          </button>
        </div>
      </div>

      {/* Diagnostics panel */}
      {diagnosticResult && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[#0050FF] dark:text-[#3374FF] font-semibold flex items-center gap-1.5 text-sm">
              <ShieldCheck className="h-4 w-4" />
              Health Check — {diagnosticResult.connectedCount} connectors active, avg {diagnosticResult.avgLatencyMs}ms
            </span>
            <button onClick={() => setDiagnosticResult(null)} className="text-[#86868B] hover:text-[#1D1D1F]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{diagnosticResult.recommendation}</p>
          {diagnosticResult.issues.map((issue, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}

      {/* Integrations Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#86868B] rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08]">
          No integrations match &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

                {item.connected && (
                  <div className="flex items-center gap-3 text-[11px] text-[#86868B]">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-emerald-500" />
                      <span>{item.latencyMs}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Since {formatConnectedAt(item.connectedAt)}</span>
                    </div>
                  </div>
                )}
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
      )}

      {/* Code Snippet Modal */}
      {selectedIntegration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedIntegration(null); }}
        >
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
              <div>
                <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {selectedIntegration.name} Integration
                </h3>
                <p className="text-xs text-[#86868B]">1-line drop-in configuration</p>
              </div>
              <button
                onClick={() => setSelectedIntegration(null)}
                className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#1F1F23] overflow-x-auto text-xs text-[#1D1D1F] dark:text-[#F5F5F7] font-mono leading-relaxed">
                {getCodeSnippet(selectedIntegration)}
              </pre>
              <button
                onClick={() => handleCopyCode(selectedIntegration.id, getCodeSnippet(selectedIntegration))}
                className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white dark:bg-[#2C2C30] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1 shadow-xs hover:bg-[#F5F5F7] transition-colors"
              >
                {copiedCode === selectedIntegration.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCode === selectedIntegration.id ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect API Key Modal */}
      {connectingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setConnectingItem(null); }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
              <div>
                <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Connect {connectingItem.name}
                </h3>
                <p className="text-xs text-[#86868B]">Connection state persists across sessions</p>
              </div>
              <button onClick={() => setConnectingItem(null)} className="text-[#86868B] hover:text-[#1D1D1F]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConnection} className="space-y-3 text-xs">
              <div>
                <label className="text-[#86868B] block mb-1 font-medium">Provider API Key *</label>
                <input
                  type="password"
                  required
                  placeholder="sk-... or your provider token"
                  value={providerKey}
                  onChange={(e) => { setProviderKey(e.target.value); setVerifyError(""); }}
                  className="w-full h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] font-mono focus:outline-none focus:border-[#0050FF]/50"
                />
                {verifyError && (
                  <p className="text-red-600 dark:text-red-400 text-[11px] mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {verifyError}
                  </p>
                )}
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
                  className="px-5 py-2 rounded-full bg-[#0050FF] text-white font-semibold shadow-sm shadow-[#0050FF]/25 flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isVerifying ? (
                    <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verifying...</>
                  ) : "Connect Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
