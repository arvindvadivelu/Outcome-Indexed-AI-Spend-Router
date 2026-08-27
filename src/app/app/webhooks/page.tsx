"use client";

import { useState } from "react";
import {
  Webhook,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  Bot,
  Sparkles,
  Zap,
  ShieldCheck
} from "lucide-react";

export default function WebhooksPage() {
  const [endpointUrl, setEndpointUrl] = useState("https://api.acme.ai/webhooks/outcome-events");
  const [secretKey, setSecretKey] = useState("whsec_99a8b7c6d5e4f3a2b1");

  // AI Synthetic Webhook Simulator state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const handleSimulateWebhook = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimResult({
        httpStatus: 200,
        latencyMs: 38,
        signature: "sha256=8f39a7b92c419c8e7d6a5b4c3d2e1f0",
        eventPayload: {
          event: "outcome.indexed.success",
          request_id: `oir_wh_${Math.random().toString(36).substr(2, 7)}`,
          model_used: "deepseek-coder",
          target_metric: "code_merged",
          saved_usd: 0.00555,
          timestamp: 1787769900
        }
      });
      setIsSimulating(false);
    }, 450);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Webhooks & AI Payload Simulator
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
            Stream asynchronous downstream conversion rewards and telemetry events to your backend
          </p>
        </div>

        <button
          onClick={handleSimulateWebhook}
          disabled={isSimulating}
          className="px-5 py-2.5 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          <span>{isSimulating ? "Dispatching..." : "Simulate AI Webhook Event"}</span>
        </button>
      </div>

      {/* Webhook Simulation Result */}
      {simResult && (
        <div className="p-6 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-3 animate-in fade-in text-xs font-mono">
          <div className="flex items-center justify-between text-[#0050FF] font-bold">
            <span>HTTP Status: {simResult.httpStatus} OK ({simResult.latencyMs}ms)</span>
            <span>HMAC SHA-256 Validated</span>
          </div>
          <pre className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] overflow-x-auto text-[11px] text-[#1D1D1F]">
            {JSON.stringify(simResult.eventPayload, null, 2)}
          </pre>
        </div>
      )}

      {/* Webhook Endpoint Settings */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-4">
        <h3 className="font-bold text-base text-[#1D1D1F]">Active Webhook Configuration</h3>
        <div className="space-y-3 text-xs font-mono">
          <div>
            <label className="text-[#86868B] block mb-1">Target Endpoint URL</label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
            />
          </div>

          <div>
            <label className="text-[#86868B] block mb-1">Webhook Secret Key (HMAC SHA-256)</label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
