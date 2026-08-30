"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
  ChevronRight,
  Code2,
  Radio,
  FileCode,
  RotateCw,
  Eye,
  X
} from "lucide-react";
import { useAppStore, WebhookLogItem } from "@/lib/store";

export default function WebhooksPage() {
  const { webhookConfig, setWebhookConfig, webhookLogs, addWebhookLog, user } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [copiedSecret, setCopiedSecret] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [savedStatus, setSavedStatus] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("outcome.indexed.success");
  const [snippetLanguage, setSnippetLanguage] = useState<"node" | "python">("node");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [inspectingLog, setInspectingLog] = useState<WebhookLogItem | null>(null);
  const [redeliveringId, setRedeliveringId] = useState<string | null>(null);

  const syncWebhookToSession = (config: any) => {
    if (user?.email) {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, webhookConfig: config })
      }).catch((err) => console.warn("Webhook session sync notice:", err));
    }
  };

  const eventTopics = [
    { id: "outcome.indexed.success", label: "outcome.indexed.success", desc: "Model conversion outcome achieved" },
    { id: "sla.escrow.refund", label: "sla.escrow.refund", desc: "Latency breach refund credited" },
    { id: "budget.ceiling.breach", label: "budget.ceiling.breach", desc: "Monthly spend pacing breach alert" },
    { id: "key.rotated.notice", label: "key.rotated.notice", desc: "API credential rotated" }
  ];

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhookConfig.secretKey);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleUrlChange = (newUrl: string) => {
    const updated = { ...webhookConfig, endpointUrl: newUrl };
    setWebhookConfig({ endpointUrl: newUrl });
    syncWebhookToSession(updated);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleSecretChange = (newSecret: string) => {
    const updated = { ...webhookConfig, secretKey: newSecret };
    setWebhookConfig({ secretKey: newSecret });
    syncWebhookToSession(updated);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleGenerateSecret = () => {
    const randomSecret = `whsec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const updated = { ...webhookConfig, secretKey: randomSecret };
    setWebhookConfig({ secretKey: randomSecret });
    syncWebhookToSession(updated);
  };

  const handleSimulateWebhook = async (customEvent?: string) => {
    const eventToSend = customEvent || selectedEvent;
    setIsSimulating(true);
    setSimResult(null);

    try {
      const res = await fetch("/api/webhooks/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpointUrl: webhookConfig.endpointUrl,
          secretKey: webhookConfig.secretKey,
          eventType: eventToSend
        })
      });
      const data = await res.json();

      if (data.success) {
        setSimResult(data);

        const logEntry: WebhookLogItem = {
          id: `wh_dlv_${Date.now() % 100000}`,
          timestamp: "Just now",
          event: eventToSend,
          targetUrl: webhookConfig.endpointUrl,
          httpStatus: data.http_status,
          latencyMs: data.latency_ms,
          verified: true
        };
        addWebhookLog(logEntry);
      }
    } catch (err) {
      console.warn("Webhook dispatch fallback:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRedeliver = async (log: WebhookLogItem) => {
    setRedeliveringId(log.id);
    await handleSimulateWebhook(log.event);
    setTimeout(() => setRedeliveringId(null), 1200);
  };

  const nodeVerificationCode = `// Verify incoming X-Outcome-Signature header
const crypto = require('crypto');

function verifyOutcomeWebhook(payload, signatureHeader, secret) {
  const parts = signatureHeader.split(',');
  const timestamp = parts[0].split('=')[1];
  const signature = parts[1].split('=')[1];

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(\`\${timestamp}.\${payload}\`)
    .digest('hex');

  return signature === expectedSignature;
}`;

  const pythonVerificationCode = `# Verify incoming X-Outcome-Signature header
import hmac
import hashlib

def verify_outcome_webhook(payload: str, signature_header: str, secret: str) -> bool:
    parts = dict(item.split('=') for item in signature_header.split(','))
    timestamp = parts.get('t')
    signature = parts.get('v1')

    expected = hmac.new(
        secret.encode('utf-8'),
        f"{timestamp}.{payload}".encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)`;

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
                Webhook Subscriptions & Events
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] border border-[#0050FF]/20">
                HMAC-SHA256 Signed
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Stream live routing telemetry, micro-SLA refund confirmations, and budget ceiling breach alerts signed with HMAC-SHA256 cryptographic digests.
            </p>
          </div>

          <button
            onClick={() => handleSimulateWebhook()}
            disabled={isSimulating}
            className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start lg:self-auto shrink-0 disabled:opacity-50"
          >
            <Send className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            <span>{isSimulating ? "Dispatching..." : "Dispatch Test Webhook"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Delivery Rate</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono">99.98%</div>
            <div className="text-xs text-white/70 mt-1">Automatic 3x exponential retry</div>
          </div>
          <span className="text-[11px] text-white/80">0 Dropped Payloads</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Average Dispatch Latency</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">34ms</div>
            <div className="text-xs text-[#86868B] mt-1">Direct HTTPS Edge Delivery</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Real-time HTTP Push</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Signature Verification</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">HMAC-SHA256</div>
            <div className="text-xs text-[#86868B] mt-1">X-Outcome-Signature header</div>
          </div>
          <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-semibold">Anti-Tamper Enforced</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Total Dispatches</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">
              {webhookLogs.length}
            </div>
            <div className="text-xs text-[#86868B] mt-1">Recorded audit ledger</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Verified Nonces</span>
        </div>
      </div>

      {/* Simulation Result Drawer */}
      {simResult && (
        <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-3 animate-in fade-in" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0050FF]" />
              <span>Test Webhook Dispatched (HTTP {simResult.http_status} · {simResult.latency_ms}ms)</span>
            </h3>
            <button onClick={() => setSimResult(null)} className="text-xs text-[#86868B] hover:text-[#1D1D1F]">Dismiss</button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#515154] dark:text-[#A1A1A6]">
              <span className="text-[#86868B]">Signature Header:</span>
              <code className="p-1 px-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] text-[#0050FF] dark:text-[#3374FF]">
                X-Outcome-Signature: {simResult.signature_header}
              </code>
            </div>
            <pre className="p-4 rounded-2xl bg-[#0F172A] text-emerald-400 font-mono text-xs overflow-x-auto">
              {JSON.stringify(simResult.event_payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 3. Endpoint Configuration Card & Event Topics */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Webhook Endpoint & Signing Secret
            </h3>
            <p className="text-xs text-[#86868B]">
              Configure your listener URL and select event subscriptions
            </p>
          </div>
          {savedStatus && (
            <span className="text-xs text-emerald-600 font-semibold animate-in fade-in">
              ✓ Settings saved!
            </span>
          )}
        </div>

        {/* Quick URL Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-[#86868B] font-medium">Quick Presets:</span>
          {[
            { label: "Webhook.site Test Bucket", url: "https://webhook.site/spend-router-demo" },
            { label: "Pipedream Ingestion Edge", url: "https://eok7b12.m.pipedream.net" },
            { label: "Localhost:8080 /events", url: "http://localhost:8080/api/v1/events" }
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleUrlChange(preset.url)}
              className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] hover:border-[#0050FF]/30 transition-all hover:scale-105 active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Event Topic Selector Pills */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#86868B]">Select Test Event Topic</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {eventTopics.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedEvent(t.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-95 ${
                  selectedEvent === t.id
                    ? "bg-[#EEF4FF] dark:bg-[#0050FF]/20 border-[#0050FF] text-[#0050FF] dark:text-[#3374FF] shadow-xs"
                    : "bg-white/80 dark:bg-[#1E1E22] border-black/[0.06] dark:border-white/[0.08] text-[#515154] dark:text-[#A1A1A6] hover:border-[#0050FF]/40"
                }`}
              >
                <div className="font-mono text-xs font-bold">{t.label}</div>
                <div className="text-[10px] text-[#86868B] mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 text-xs pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
          <div className="space-y-1">
            <label className="font-semibold text-[#86868B]">Destination URL</label>
            <input
              type="url"
              value={webhookConfig.endpointUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://api.yourcompany.com/webhooks/spend-router"
              className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#86868B]">Signing Secret (HMAC-SHA256)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={webhookConfig.secretKey}
                onChange={(e) => handleSecretChange(e.target.value)}
                className="flex-1 h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopySecret}
                className="px-4 h-11 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
              >
                {copiedSecret ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSecret ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={handleGenerateSecret}
                className="px-4 h-11 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold hover:bg-[#0050FF] hover:text-white transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Signature Verification Guide */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-4" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Cryptographic Signature Verification Guide
            </h3>
            <p className="text-xs text-[#86868B]">
              Verify incoming payloads against replay attacks using the timestamped HMAC-SHA256 signature
            </p>
          </div>

          <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80">
            {(["node", "python"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSnippetLanguage(lang)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full capitalize transition-all hover:scale-105 active:scale-95 ${
                  snippetLanguage === lang
                    ? "bg-[#0050FF] text-white shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {lang === "node" ? "Node.js" : "Python"}
              </button>
            ))}
          </div>
        </div>

        <div className="relative rounded-2xl bg-[#0F172A] text-white font-mono text-xs p-4 overflow-x-auto shadow-inner">
          <pre className="text-[11px] leading-relaxed text-slate-200">
            {snippetLanguage === "node" ? nodeVerificationCode : pythonVerificationCode}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(snippetLanguage === "node" ? nodeVerificationCode : pythonVerificationCode);
              setCopiedSnippet(true);
              setTimeout(() => setCopiedSnippet(false), 2000);
            }}
            className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 transition-all border border-slate-700 shadow-xs hover:scale-105 active:scale-95"
          >
            {copiedSnippet ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedSnippet ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>
      </div>

      {/* 5. Webhook Delivery Log Table */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          Recent Webhook Delivery Events ({webhookLogs.length})
        </h3>

        <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/80 text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Delivery ID</th>
                <th className="py-3.5 px-4 font-semibold">Event Topic</th>
                <th className="py-3.5 px-4 font-semibold">Endpoint URL</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">Latency</th>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]" suppressHydrationWarning>
              {webhookLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F7F9]/50 dark:hover:bg-[#1B1B1E]/50 transition-all">
                  <td className="py-3.5 px-5 font-mono text-[11px] text-[#0050FF] dark:text-[#3374FF]">
                    {log.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {log.event}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#86868B] truncate max-w-[200px]">
                    {log.targetUrl}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]">
                      HTTP {log.httpStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[11px] text-[#515154] dark:text-[#A1A1A6]">
                    {log.latencyMs}ms
                  </td>
                  <td className="py-3.5 px-4 text-[#86868B] font-mono text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-2">
                    <button
                      onClick={() => setInspectingLog(log)}
                      className="px-2.5 py-1 rounded-full bg-[#F5F5F7] dark:bg-[#242428] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] text-[11px] font-semibold transition-all inline-flex items-center gap-1 hover:scale-105 active:scale-95"
                      title="Inspect Payload"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => handleRedeliver(log)}
                      disabled={redeliveringId === log.id}
                      className="px-2.5 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-[11px] font-semibold hover:bg-[#0050FF] hover:text-white transition-all inline-flex items-center gap-1 hover:scale-105 active:scale-95 disabled:opacity-50"
                      title="Redeliver Event"
                    >
                      <RotateCw className={`h-3 w-3 ${redeliveringId === log.id ? "animate-spin" : ""}`} />
                      <span>{redeliveringId === log.id ? "Sending..." : "Redeliver"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Webhook Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Webhook Dispatch Audit — {inspectingLog.id}
                </h3>
                <span className="text-[11px] text-[#86868B] font-mono">{inspectingLog.event}</span>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] text-xs font-mono space-y-1">
                <div><span className="text-[#86868B]">Endpoint:</span> {inspectingLog.targetUrl}</div>
                <div><span className="text-[#86868B]">HTTP Response:</span> {inspectingLog.httpStatus} OK</div>
                <div><span className="text-[#86868B]">Dispatch Latency:</span> {inspectingLog.latencyMs}ms</div>
                <div><span className="text-[#86868B]">HMAC Signature:</span> SHA-256 Verified ✓</div>
              </div>

              <div className="rounded-2xl bg-[#0F172A] p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{JSON.stringify({
                  event_id: inspectingLog.id,
                  event_type: inspectingLog.event,
                  timestamp: new Date().toISOString(),
                  data: {
                    status: "delivered",
                    target: inspectingLog.targetUrl,
                    latency_ms: inspectingLog.latencyMs
                  }
                }, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
