"use client";

import { useState } from "react";
import {
  Layers,
  CheckCircle2,
  ExternalLink,
  Bot,
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
        status: "All Connectors Healthy",
        recommendation: "LangChain and Vercel AI SDK streams verified with sub-15ms proxy latency. 100% circuit breaker uptime active."
      });
      setIsDiagnosing(false);
    }, 450);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
            Integrations
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Connect Outcome Router into your LangChain, Vercel AI, and agent workflows
          </p>
        </div>

        <button
          onClick={handleRunDiagnostics}
          disabled={isDiagnosing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/[0.06] text-xs font-semibold text-[#515154] hover:text-[#1D1D1F] shadow-sm transition-all"
        >
          <Bot className="h-3.5 w-3.5 text-[#0050FF]" />
          <span>{isDiagnosing ? "Checking..." : "Connector Diagnostics"}</span>
        </button>
      </div>

      {/* Diagnostics panel */}
      {diagnosticResult && (
        <div className="p-4 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-1 animate-in fade-in text-xs">
          <span className="text-[#0050FF] font-semibold block">✓ {diagnosticResult.status}</span>
          <p className="text-[#515154] leading-relaxed">{diagnosticResult.recommendation}</p>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    item.connected
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-[#F5F5F7] text-[#86868B]"
                  }`}
                >
                  {item.connected ? "Connected" : "Inactive"}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1D1D1F]">{item.name}</h3>
                <p className="text-xs text-[#86868B] mt-0.5">Proxy Latency: {item.latency}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F5F5F7] flex items-center justify-between">
              <button
                onClick={() => toggleConnection(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  item.connected
                    ? "bg-[#F5F5F7] text-[#515154] hover:text-red-600 hover:bg-red-50"
                    : "bg-[#0050FF] text-white hover:bg-[#0043D6] shadow-sm"
                }`}
              >
                {item.connected ? "Disconnect" : "Connect Adapter"}
              </button>

              <span className="text-[11px] text-[#86868B]">v1.2</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
