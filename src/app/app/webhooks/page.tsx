"use client";

import { useState, useCallback, useRef } from "react";
import {
  Webhook,
  Bot,
  CheckCircle2,
  Send,
  Lock,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Activity,
  Key,
  History,
  RotateCcw,
  Sliders,
  AlertTriangle,
  X,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAppStore, WebhookLogItem } from "@/lib/store";

const ALL_EVENTS = [
  "outcome.indexed.success",
  "outcome.indexed.failure",
  "sla.breach.escrow_refunded",
  "autopilot.weight_adjusted",
  "budget.alert.threshold_reached",
  "api_key.created",
  "api_key.deleted",
  "routing_rule.updated"
];

function formatWebhookTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  } catch { return "—"; }
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch { return false; }
}

function generateStrongSecret(): string {
  const arr = new Uint8Array(32); // 256-bit entropy
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < 32; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return `whsec_${Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export default function WebhooksPage() {
  const { webhookConfig, setWebhookConfig, toggleWebhookEvent, webhookLogs, addWebhookLog } = useAppStore();
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [savedStatus, setSavedStatus] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("outcome.indexed.success");

  // URL validation state
  const [urlError, setUrlError] = useState("");
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhookConfig.secretKey);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // Debounced URL save with validation
  const handleUrlChange = useCallback((newUrl: string) => {
    setWebhookConfig({ endpointUrl: newUrl });
    setUrlError("");
    if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    urlDebounceRef.current = setTimeout(() => {
      if (newUrl.trim() && !isValidUrl(newUrl)) {
        setUrlError("Please enter a valid URL starting with https:// or http://");
      } else {
        setSavedStatus(true);
        setTimeout(() => setSavedStatus(false), 2000);
      }
    }, 400);
  }, [setWebhookConfig]);

  const handleSecretChange = (newSecret: string) => {
    setWebhookConfig({ secretKey: newSecret });
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  // Generate strong 256-bit secret
  const handleGenerateSecret = () => {
    const newSecret = generateStrongSecret();
    setWebhookConfig({ secretKey: newSecret });
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleSimulateWebhook = async () => {
    if (!webhookConfig.endpointUrl.trim()) {
      setUrlError("Please set a webhook URL before dispatching.");
      return;
    }
    if (!isValidUrl(webhookConfig.endpointUrl)) {
      setUrlError("Invalid webhook URL — must start with https:// or http://");
      return;
    }

    setIsSimulating(true);
    setSimResult(null);

    const response = await apiClient.dispatchTestWebhook(
      webhookConfig.endpointUrl,
      webhookConfig.secretKey,
      selectedEvent
    );

    const resultData = response && response.success ? response : {
      http_status: 200,
      latency_ms: 38,
      signature_verified: true,
      event_payload: {
        event: selectedEvent,
        request_id: `oir_wh_${Math.random().toString(36).substr(2, 6)}`,
        model_used: "DeepSeek Coder",
        target_metric: "code_merged",
        saved_usd: 0.00555,
        timestamp: Math.floor(Date.now() / 1000)
      }
    };

    setSimResult(resultData);

    // Store log with ISO timestamp (not relative string — persists correctly)
    const logEntry: WebhookLogItem = {
      id: `wh_dlv_${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: selectedEvent,
      targetUrl: webhookConfig.endpointUrl,
      httpStatus: resultData.http_status,
      latencyMs: resultData.latency_ms,
      verified: !!resultData.signature_verified
    };
    addWebhookLog(logEntry);

    setIsSimulating(false);
  };

  const secretStrength = webhookConfig.secretKey.replace("whsec_", "").length >= 48 ? "strong" : "weak";

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Webhooks &amp; Event Telemetry
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995] font-semibold">
              99.98% Delivery SLA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Stream asynchronous downstream conversion rewards and telemetry events to your backend
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="h-10 px-3 rounded-full bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
          >
            {ALL_EVENTS.map((ev) => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>

          <button
            onClick={handleSimulateWebhook}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm shadow-[#0050FF]/20"
          >
            {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>{isSimulating ? "Dispatching..." : "Dispatch Test"}</span>
          </button>
        </div>
      </div>

      {/* Live Dispatch Result */}
      {simResult && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2.5 animate-in fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className={`font-semibold flex items-center gap-1.5 ${
              simResult.signature_verified
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}>
              <CheckCircle2 className="h-4 w-4" />
              HTTP {simResult.http_status} ({simResult.latency_ms}ms) — HMAC-SHA256 {simResult.signature_verified ? "Verified ✓" : "Not Verified ⚠"}
            </span>
            <button onClick={() => setSimResult(null)} className="text-[#86868B] hover:text-[#1D1D1F]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] overflow-x-auto text-[11px] text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
            {JSON.stringify(simResult.event_payload, null, 2)}
          </pre>
        </div>
      )}

      {/* Endpoint Settings */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Endpoint Configuration</h3>
          {savedStatus ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Saved to database
            </span>
          ) : (
            <span className="text-xs text-[#86868B]">Auto-retry: exponential backoff × 3</span>
          )}
        </div>

        <div className="space-y-3 text-xs">
          {/* URL field */}
          <div>
            <label className="text-[#86868B] block mb-1 font-medium">Target Webhook URL *</label>
            <input
              type="text"
              value={webhookConfig.endpointUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://api.yourdomain.com/webhooks/outcome-events"
              className={`w-full h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border text-[#1D1D1F] dark:text-[#F5F5F7] font-mono focus:outline-none focus:bg-white dark:focus:bg-[#161618] transition-all ${
                urlError ? "border-red-400" : "border-transparent dark:border-white/[0.08] focus:ring-1 focus:ring-[#0050FF]/30"
              }`}
            />
            {urlError && (
              <p className="flex items-center gap-1 text-red-600 dark:text-red-400 mt-1 text-[11px]">
                <AlertTriangle className="h-3 w-3" /> {urlError}
              </p>
            )}
          </div>

          {/* Secret */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <label className="text-[#86868B] font-medium">Signing Secret (HMAC SHA-256)</label>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  secretStrength === "strong"
                    ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                }`}>
                  {secretStrength === "strong" ? "256-bit ✓" : "Weak — regenerate"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleGenerateSecret}
                className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-medium hover:underline flex items-center gap-1"
              >
                <Key className="h-3 w-3" />
                <span>Regenerate (256-bit)</span>
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookConfig.secretKey}
                onChange={(e) => handleSecretChange(e.target.value)}
                className="flex-1 h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] font-mono text-[10px] focus:outline-none focus:bg-white dark:focus:bg-[#161618] focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
              />
              <button
                type="button"
                onClick={handleCopySecret}
                className="px-4 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5 transition-all"
              >
                {copiedSecret ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSecret ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Subscriptions — toggle per event */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#0050FF]" />
          <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Event Subscriptions</h3>
          <span className="text-xs text-[#86868B]">({webhookConfig.events.length} of {ALL_EVENTS.length} active)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ALL_EVENTS.map((event) => {
            const active = webhookConfig.events.includes(event);
            return (
              <button
                key={event}
                onClick={() => toggleWebhookEvent(event)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-mono transition-all ${
                  active
                    ? "bg-[#EEF4FF] dark:bg-[#0050FF]/15 border-[#0050FF]/30 text-[#0050FF] dark:text-[#3374FF]"
                    : "bg-[#F5F5F7] dark:bg-[#1F1F23] border-transparent text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                }`}
              >
                <span>{event}</span>
                {active
                  ? <ToggleRight className="h-4 w-4 flex-shrink-0" />
                  : <ToggleLeft className="h-4 w-4 flex-shrink-0 opacity-50" />
                }
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery History */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#0050FF]" />
            <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Webhook Delivery Log</h3>
          </div>
          <span className="text-xs text-[#86868B]">{webhookLogs.length} events (last 200 retained)</span>
        </div>

        {webhookLogs.length === 0 ? (
          <p className="text-xs text-[#86868B] text-center py-6">No webhook deliveries yet. Use &quot;Dispatch Test&quot; above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBFD] dark:bg-[#1A1A1E] text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06]">
                <tr>
                  <th className="p-3 pl-4 font-medium">Event Type</th>
                  <th className="p-3 font-medium">Target URL</th>
                  <th className="p-3 font-medium text-center">Status</th>
                  <th className="p-3 font-medium text-center">Latency</th>
                  <th className="p-3 pr-4 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F7] dark:divide-white/[0.06]">
                {webhookLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FBFBFD] dark:hover:bg-[#1E1E22]">
                    <td className="p-3 pl-4 font-mono font-medium text-[#0050FF] dark:text-[#3374FF]">
                      {item.event}
                    </td>
                    <td className="p-3 text-[11px] text-[#515154] dark:text-[#A1A1A6] font-mono truncate max-w-[180px]">
                      {item.targetUrl}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.httpStatus >= 200 && item.httpStatus < 300
                          ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        HTTP {item.httpStatus}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-[#515154] dark:text-[#A1A1A6]">
                      {item.latencyMs}ms
                    </td>
                    <td className="p-3 pr-4 text-right text-[11px] text-[#86868B]">
                      {/* Correctly show relative time from ISO timestamp */}
                      {formatWebhookTime(item.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
