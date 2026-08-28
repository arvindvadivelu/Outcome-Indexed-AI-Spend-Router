"use client";

import { useState } from "react";
import {
  Webhook,
  Bot,
  CheckCircle2
} from "lucide-react";

export default function WebhooksPage() {
  const [endpointUrl, setEndpointUrl] = useState("https://api.acme.ai/webhooks/outcome-events");
  const [secretKey, setSecretKey] = useState("whsec_99a8b7c6d5e4f3a2b1");

  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const handleSimulateWebhook = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimResult({
        httpStatus: 200,
        latencyMs: 38,
        eventPayload: {
          event: "outcome.indexed.success",
          request_id: `oir_wh_${Math.random().toString(36).substr(2, 6)}`,
          model_used: "DeepSeek Coder",
          target_metric: "code_merged",
          saved_usd: 0.00555,
          timestamp: 1787769900
        }
      });
      setIsSimulating(false);
    }, 450);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
            Webhooks
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Stream asynchronous downstream conversion rewards and telemetry events to your backend
          </p>
        </div>

        <button
          onClick={handleSimulateWebhook}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm shadow-[#0050FF]/20"
        >
          <Bot className="h-3.5 w-3.5" />
          <span>{isSimulating ? "Dispatching..." : "Test Webhook Event"}</span>
        </button>
      </div>

      {/* Webhook Simulation Result */}
      {simResult && (
        <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-2.5 animate-in fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-600">
              ✓ HTTP {simResult.httpStatus} OK ({simResult.latencyMs}ms) — Signature Verified
            </span>
          </div>
          <pre className="p-3.5 rounded-xl bg-[#F5F5F7] overflow-x-auto text-[11px] text-[#1D1D1F] font-mono">
            {JSON.stringify(simResult.eventPayload, null, 2)}
          </pre>
        </div>
      )}

      {/* Webhook Endpoint Settings */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-4">
        <h3 className="font-semibold text-sm text-[#1D1D1F]">Endpoint Configuration</h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[#86868B] block mb-1 font-medium">Target URL</label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full h-10 px-4 rounded-full bg-[#F5F5F7] border border-transparent text-[#1D1D1F] font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
            />
          </div>

          <div>
            <label className="text-[#86868B] block mb-1 font-medium">Signing Secret (HMAC SHA-256)</label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full h-10 px-4 rounded-full bg-[#F5F5F7] border border-transparent text-[#1D1D1F] font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
