"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Code2,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  BookOpen,
  ArrowRight,
  Sparkles,
  Globe,
  Play,
  Key,
  CheckCircle2,
  FileCode
} from "lucide-react";
import Link from "next/link";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

export default function DocsPage() {
  const [activeLang, setActiveLang] = useState<"python" | "node" | "curl">("python");
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);

  // Live Docs Interactive Tester State
  const [testPrompt, setTestPrompt] = useState("Refactor this SQL query for zero race conditions and add an index.");
  const [testStrategy, setTestStrategy] = useState("outcome_optimized");
  const [testTargetMetric, setTestTargetMetric] = useState("code_merged");
  const [isExecuting, setIsExecuting] = useState(false);
  const [liveResponse, setLiveResponse] = useState<any>(null);

  const codeSnippets = {
    python: `# Python SDK Drop-in (OpenAI Wire Compatible)
import openai

client = openai.OpenAI(
    base_url="https://gateway.outcomerouter.ai/v1",
    api_key="oir_live_8f9a2b7c4d1e..."
)

response = client.chat.completions.create(
    model="outcome-indexed-auto",
    messages=[{"role": "user", "content": "Review this pull request for race conditions"}],
    extra_headers={
        "X-Outcome-Strategy": "outcome_optimized",
        "X-Outcome-Target-Metric": "code_merged"
    }
)

print(response.choices[0].message.content)
print("Cost Saved:", response._router_metadata.saved_usd)`,
    node: `// Node.js / TypeScript Drop-in (OpenAI SDK Compatible)
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://gateway.outcomerouter.ai/v1",
  apiKey: process.env.OUTCOME_ROUTER_KEY,
  defaultHeaders: {
    "X-Outcome-Strategy": "outcome_optimized",
    "X-Outcome-Target-Metric": "code_merged"
  }
});

const response = await client.chat.completions.create({
  model: "outcome-indexed-auto",
  messages: [{ role: "user", content: "Review this pull request for race conditions" }]
});

console.log(response.choices[0].message.content);
console.log("Router Nonce:", response._router_metadata.sla_contract_nonce);`,
    curl: `# cURL Drop-in Endpoint (Direct HTTPS Gateway)
curl -X POST https://gateway.outcomerouter.ai/v1/chat/completions \\
  -H "Authorization: Bearer oir_live_8f9a2b7c4d1e..." \\
  -H "Content-Type: application/json" \\
  -H "X-Outcome-Strategy: outcome_optimized" \\
  -H "X-Outcome-Target-Metric: code_merged" \\
  -d '{
    "model": "outcome-indexed-auto",
    "messages": [{"role": "user", "content": "Review this pull request for race conditions"}]
  }'`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExecuteLiveTest = () => {
    setIsExecuting(true);
    setLiveResponse(null);

    setTimeout(() => {
      setLiveResponse({
        id: `oir_chat_${Math.random().toString(36).substring(2, 8)}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "deepseek-coder",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: `-- Optimized Query with Explicit Locking and Covering Index\nCREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trans_status_created ON transactions(status, created_at);\n\nBEGIN;\nSELECT * FROM transactions WHERE status = 'pending' FOR UPDATE SKIP LOCKED LIMIT 100;\n-- Process rows safely\nCOMMIT;`
            },
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: 38,
          completion_tokens: 64,
          total_tokens: 102
        },
        _router_metadata: {
          model_selected: "DeepSeek Coder",
          cost_usd: 0.00065,
          saved_vs_gpt4o_usd: 0.00555,
          latency_ms: 112,
          sla_contract_nonce: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
          critic_verified: true,
          target_metric_confidence: "94.2%"
        }
      });
      setIsExecuting(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-8 sm:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* 1. Spatial Hero Header */}
        <section className="relative overflow-hidden rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-center space-y-6" suppressHydrationWarning>
          <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-[#0050FF]/20 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-md">
              <BookOpen className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF]" />
              <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Developer SDK & API Reference
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
              1-Line Drop-in Integration. <br />
              <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                100% OpenAI Wire-Compatible.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#86868B] max-w-2xl mx-auto leading-relaxed">
              Route production traffic dynamically with zero code refactoring. Change your SDK <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08]">baseURL</code> and pass custom outcome headers.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowSimulate(true)}
                className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Simulate Gateway Prompt</span>
              </button>
              <Link
                href="/app/settings/api-keys"
                className="h-10 px-6 rounded-full bg-white/80 dark:bg-[#242428]/80 border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-2 shadow-xs"
              >
                <Key className="h-3.5 w-3.5 text-[#0050FF]" />
                <span>Get Sandbox API Keys</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Quickstart Code Block */}
        <section className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-10 shadow-sm space-y-6" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.05] dark:border-white/[0.08] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Quickstart Integration
              </h2>
              <p className="text-xs text-[#86868B]">Select your client language to view drop-in syntax</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md">
                {(["python", "node", "curl"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full capitalize transition-all ${
                      activeLang === lang
                        ? "bg-[#0050FF] text-white shadow-xs"
                        : "text-[#86868B] hover:text-[#1D1D1F]"
                    }`}
                  >
                    {lang === "node" ? "Node.js (TS)" : lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                className="h-9 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E5E5EA] dark:hover:bg-[#343438] transition-all flex items-center gap-1.5 border border-black/[0.04] dark:border-white/[0.06] shadow-xs"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-[#86868B]" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl bg-[#0F0F12] p-5 font-mono text-xs text-[#F5F5F7] overflow-x-auto border border-white/[0.08] shadow-inner">
            <pre className="leading-relaxed whitespace-pre-wrap">{codeSnippets[activeLang]}</pre>
          </div>
        </section>

        {/* 3. Interactive Live Gateway Sandbox Request Tester */}
        <section className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-10 shadow-sm space-y-6" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.05] dark:border-white/[0.08] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold mb-1">
                <Sparkles className="h-3 w-3" />
                <span>Interactive Live Sandbox</span>
              </div>
              <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Test Gateway Request Live in Browser
              </h2>
            </div>
            <p className="text-xs text-[#86868B]">Simulates exact wire response including FinOps metadata</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Prompt Message:</label>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/40 resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">X-Outcome-Strategy:</label>
                  <select
                    value={testStrategy}
                    onChange={(e) => setTestStrategy(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#1D1D1F] dark:text-[#F5F5F7]"
                  >
                    <option value="outcome_optimized">outcome_optimized</option>
                    <option value="cost_minimum">cost_minimum</option>
                    <option value="latency_first">latency_first</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">Target Metric:</label>
                  <select
                    value={testTargetMetric}
                    onChange={(e) => setTestTargetMetric(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#1D1D1F] dark:text-[#F5F5F7]"
                  >
                    <option value="code_merged">code_merged</option>
                    <option value="demo_booked">demo_booked</option>
                    <option value="ticket_resolved">ticket_resolved</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteLiveTest}
                disabled={isExecuting}
                className="w-full h-11 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] disabled:opacity-40 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
              >
                {isExecuting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    <span>Execute Gateway Request</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-2xl bg-[#0F0F12] p-4 text-emerald-400 font-mono text-xs overflow-x-auto border border-white/[0.08] flex flex-col justify-between">
              {liveResponse ? (
                <pre className="leading-relaxed overflow-x-auto">
                  {JSON.stringify(liveResponse, null, 2)}
                </pre>
              ) : (
                <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center text-[#86868B] space-y-2">
                  <Terminal className="h-6 w-6 text-[#86868B]" />
                  <p>Click &quot;Execute Gateway Request&quot; to inspect real-time JSON response payload.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. Essential Custom Headers Specification */}
        <section className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-10 shadow-sm space-y-6" suppressHydrationWarning>
          <div className="border-b border-black/[0.05] dark:border-white/[0.08] pb-4">
            <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Gateway Request Headers Specification
            </h2>
            <p className="text-xs text-[#86868B]">Pass optional headers to control routing optimization algorithms per-request</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
              <span className="font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">X-Outcome-Strategy</span>
              <p className="text-[#86868B] leading-relaxed">
                Strategy mode: <code className="font-mono">outcome_optimized</code> (default), <code className="font-mono">cost_minimum</code>, or <code className="font-mono">latency_first</code>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
              <span className="font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">X-Outcome-Target-Metric</span>
              <p className="text-[#86868B] leading-relaxed">
                Target conversion KPI: <code className="font-mono">code_merged</code>, <code className="font-mono">demo_booked</code>, <code className="font-mono">ticket_resolved</code>, etc.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
              <span className="font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">X-Outcome-Max-Latency-MS</span>
              <p className="text-[#86868B] leading-relaxed">
                Hard Micro-SLA latency ceiling in milliseconds (e.g. <code className="font-mono">250</code>). Triggers automatic escrow refund if breached.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Response Transparency Payload */}
        <section className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-10 shadow-sm space-y-6" suppressHydrationWarning>
          <div className="border-b border-black/[0.05] dark:border-white/[0.08] pb-4">
            <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Response Transparency Payload
            </h2>
            <p className="text-xs text-[#86868B]">In addition to standard OpenAI response choices, every completion includes transparent FinOps metadata</p>
          </div>

          <div className="rounded-2xl bg-[#0F0F12] p-5 font-mono text-xs text-[#F5F5F7] overflow-x-auto border border-white/[0.08]">
            <pre className="leading-relaxed">{`{
  "id": "oir_chat_9f8a12",
  "object": "chat.completion",
  "model": "DeepSeek Coder",
  "choices": [
    { "index": 0, "message": { "role": "assistant", "content": "..." }, "finish_reason": "stop" }
  ],
  "_router_metadata": {
    "model_used": "deepseek-coder",
    "saved_usd": 0.00455,
    "latency_ms": 118,
    "sla_contract_nonce": "0x7f4e892c9b1a0d3e5f7a1c8b9d2e4f6a",
    "critic_verified": true
  }
}`}</pre>
          </div>
        </section>

        {/* 6. CTA Footer Card */}
        <section className="rounded-[36px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-8 sm:p-14 text-white shadow-[0_20px_50px_rgba(0,80,255,0.35)] text-center space-y-6 relative overflow-hidden" suppressHydrationWarning>
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Start Routing in Production?
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Create your free API key in under 30 seconds and test against the live gateway sandbox.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/app/settings/api-keys"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-[#0050FF] font-bold text-xs hover:bg-neutral-100 transition-all shadow-md hover:scale-105 active:scale-95"
              >
                Generate API Key
              </Link>
              <Link
                href="/app/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all border border-white/20 hover:scale-105 active:scale-95"
              >
                Open Dashboard Console
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Simulation Modal */}
      {showSimulate && <SimulateRequestModal onClose={() => setShowSimulate(false)} />}
    </div>
  );
}
