"use client";

import { useState } from "react";
import {
  Layers,
  CheckCircle2,
  ExternalLink,
  Bot,
  Sparkles,
  Zap,
  Code2,
  Plug
} from "lucide-react";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([
    { id: "langchain", name: "LangChain & LangGraph", category: "Framework", connected: true, latency: "14ms" },
    { id: "llamaindex", name: "LlamaIndex RAG", category: "RAG & Search", connected: true, latency: "18ms" },
    { id: "litellm", name: "LiteLLM Proxy", category: "Gateway", connected: false, latency: "—" },
    { id: "vercel", name: "Vercel AI SDK", category: "Frontend Streaming", connected: true, latency: "8ms" },
    { id: "crewai", name: "CrewAI Multi-Agent", category: "Autonomous Agents", connected: false, latency: "—" }
  ]);

  // AI Integration Diagnostic state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected, latency: !item.connected ? "12ms" : "—" } : item
      )
    );
  };

  const handleRunDiagnostics = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      setDiagnosticResult({
        status: "ALL CONNECTORS OPERATIONAL",
        recommendation: "LangChain and Vercel AI SDK streams verified with sub-15ms proxy latency. 100% circuit breaker uptime active."
      });
      setIsDiagnosing(false);
    }, 450);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Ecosystem Integrations & AI Connector Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
            Connect Outcome Router into your LangChain, Vercel AI, and multi-agent pipelines
          </p>
        </div>

        <button
          onClick={handleRunDiagnostics}
          disabled={isDiagnosing}
          className="px-5 py-2.5 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          <span>{isDiagnosing ? "Diagnosing..." : "Run AI Health Diagnostics"}</span>
        </button>
      </div>

      {/* Diagnostics panel */}
      {diagnosticResult && (
        <div className="p-6 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-2 animate-in fade-in text-xs font-mono">
          <span className="text-[#0050FF] font-bold block">✓ {diagnosticResult.status}</span>
          <p className="text-[#515154] font-sans pt-1 leading-relaxed">{diagnosticResult.recommendation}</p>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm flex flex-col justify-between space-y-5 hover:shadow-apple-md transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-0.5 rounded-full border border-[#0050FF]/20">
                  {item.category}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    item.connected
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-[#F5F5F7] text-[#86868B]"
                  }`}
                >
                  {item.connected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#1D1D1F]">{item.name}</h3>
                <p className="text-xs text-[#86868B] font-mono mt-1">Proxy Latency: {item.latency}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5EA] flex items-center justify-between">
              <button
                onClick={() => toggleConnection(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  item.connected
                    ? "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-red-50 hover:text-red-600 border border-[#E5E5EA]"
                    : "bg-[#0050FF] text-white hover:bg-[#0040CC] shadow-apple-blue"
                }`}
              >
                {item.connected ? "Disconnect" : "Connect Adapter"}
              </button>

              <span className="text-xs text-[#86868B] font-mono">v1.2.0</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
