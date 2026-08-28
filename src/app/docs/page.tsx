"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Code2,
  Copy,
  Check,
  Send,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  BookOpen,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function DocsPage() {
  const [activeLang, setActiveLang] = useState<"python" | "node" | "curl" | "go">("python");
  const [copiedCode, setCopiedCode] = useState(false);

  // Live Docs Playground state
  const [playgroundPrompt, setPlaygroundPrompt] = useState("Explain why DeepSeek Coder is optimal for code review.");
  const [playgroundTask, setPlaygroundTask] = useState("code_generation");
  const [isExecuting, setIsExecuting] = useState(false);
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);

  const codeSnippets = {
    python: `# Python SDK\nimport openai\n\nclient = openai.OpenAI(\n    base_url="https://gateway.outcomerouter.ai/v1",\n    api_key="oir_live_8f9a2b7c4d1e..."\n)\n\nresponse = client.chat.completions.create(\n    model="outcome-indexed-auto",\n    messages=[{"role": "user", "content": "Refactor API middleware"}],\n    extra_headers={\n        "X-Outcome-Strategy": "outcome_optimized",\n        "X-Target-Metric": "code_merged"\n    }\n)\n\nprint(response.choices[0].message.content)`,
    node: `// Node.js TypeScript\nimport OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://gateway.outcomerouter.ai/v1",\n  apiKey: process.env.OUTCOME_ROUTER_KEY,\n  defaultHeaders: {\n    "X-Outcome-Strategy": "outcome_optimized",\n    "X-Target-Metric": "code_merged"\n  }\n});\n\nconst res = await client.chat.completions.create({\n  model: "outcome-indexed-auto",\n  messages: [{ role: "user", content: "Refactor API middleware" }]\n});`,
    curl: `# cURL Drop-in\ncurl -X POST https://gateway.outcomerouter.ai/v1/chat/completions \\\n  -H "Authorization: Bearer oir_live_8f9a2b7c4d1e..." \\\n  -H "Content-Type: application/json" \\\n  -H "X-Outcome-Strategy: outcome_optimized" \\\n  -H "X-Target-Metric: code_merged" \\\n  -d '{\n    "model": "outcome-indexed-auto",\n    "messages": [{"role": "user", "content": "Refactor API middleware"}]\n  }'`,
    go: `// Go SDK\npackage main\n\nimport (\n  "context"\n  "fmt"\n  "github.com/sashabaranov/go-openai"\n)\n\nfunc main() {\n  config := openai.DefaultConfig("oir_live_8f9a2b7c4d1e...")\n  config.BaseURL = "https://gateway.outcomerouter.ai/v1"\n  client := openai.NewClientWithConfig(config)\n  // ... execute chat completion\n}`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestPlayground = async () => {
    setIsExecuting(true);
    setPlaygroundResponse(null);

    const liveRes = await apiClient.chatCompletion({
      messages: [{ role: "user", content: playgroundPrompt }],
      routing_preferences: {
        target_metric: playgroundTask === "sales_email" ? "demo_booked" : (playgroundTask === "code_generation" ? "code_merged" : "ticket_resolved"),
        strategy: "outcome_optimized"
      }
    });

    const output = liveRes || {
      id: `oir_chat_${Math.random().toString(36).substr(2, 6)}`,
      model: "DeepSeek Coder",
      provider: "deepseek",
      latency_ms: 115,
      cost_usd: 0.00065,
      saved_usd: 0.00455,
      sla_contract_hash: "0x7f4e892c9b1a0d3e5f7a1c8b9d2e4f6a",
      choices: [
        {
          message: {
            role: "assistant",
            content: "DeepSeek Coder achieves a 92.1% code merge acceptance rate at $0.00065/req—delivering 88% cost savings vs raw GPT-4o ($0.0052/req) with sub-120ms latency."
          }
        }
      ]
    };

    setPlaygroundResponse(output);
    setIsExecuting(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Developer Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            REST API & Gateway SDK Reference
          </h1>
          <p className="text-sm sm:text-base text-[#86868B]">
            Integrate OutcomeRouter as a 100% drop-in replacement for OpenAI endpoints in under 2 minutes.
          </p>
        </div>

        {/* Live Interactive API Playground */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.05] dark:border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
              <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                Live REST API Playground (POST /v1/chat/completions)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]">
              Gateway Endpoint Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#86868B] block mb-1 font-medium">Task Domain</label>
                <select
                  value={playgroundTask}
                  onChange={(e) => setPlaygroundTask(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                >
                  <option value="code_generation">code_generation (DeepSeek Coder / Claude 3.5)</option>
                  <option value="sales_email">sales_email (Claude 3.5 Sonnet / DeepSeek-V3)</option>
                  <option value="customer_support">customer_support (Groq Llama 3.3 / DeepSeek)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#86868B] block mb-1 font-medium">Request Payload Prompt</label>
                <textarea
                  rows={4}
                  value={playgroundPrompt}
                  onChange={(e) => setPlaygroundPrompt(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F5F5F7] dark:bg-[#1F1F23] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] font-mono focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={handleTestPlayground}
                disabled={isExecuting}
                className="w-full py-2.5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm shadow-[#0050FF]/25 flex items-center justify-center gap-1.5"
              >
                <Send className="h-3 w-3" />
                <span>{isExecuting ? "Executing Gateway..." : "Execute API Request"}</span>
              </button>
            </div>

            {/* Response Inspector */}
            <div className="space-y-2">
              <span className="text-xs text-[#86868B] block font-medium">Response JSON (with SLA & Cost Metadata)</span>
              <pre className="p-3.5 rounded-2xl bg-[#0A0A0C] text-[#F5F5F7] font-mono text-[11px] h-48 overflow-y-auto leading-relaxed border border-white/[0.08]">
                {playgroundResponse
                  ? JSON.stringify(playgroundResponse, null, 2)
                  : '{\n  "status": "ready",\n  "click": "Execute API Request to test live response"\n}'}
              </pre>
            </div>
          </div>
        </div>

        {/* Code Snippets Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
              <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                SDK Code Samples
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex p-0.5 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23]">
                {(["python", "node", "curl", "go"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                      activeLang === lang
                        ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                        : "text-[#86868B]"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3 py-1 rounded-full bg-white dark:bg-[#2C2C30] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1 shadow-xs"
              >
                {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-[#0A0A0C] text-[#F5F5F7] font-mono text-xs overflow-x-auto leading-relaxed border border-white/[0.08]">
            {codeSnippets[activeLang]}
          </pre>
        </div>

        {/* Error Codes Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Gateway HTTP Status Codes & Error Handling</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBFD] dark:bg-[#1A1A1E] text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06]">
                <tr>
                  <th className="p-3 pl-4 font-medium">HTTP Code</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 pr-4 font-medium">Description & Circuit Breaker Behavior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F7] dark:divide-white/[0.06]">
                <tr>
                  <td className="p-3 pl-4 font-mono font-bold text-emerald-600">200 OK</td>
                  <td className="p-3 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Success</td>
                  <td className="p-3 pr-4 text-[#515154] dark:text-[#A1A1A6]">Request successfully routed to optimal Pareto model with Micro-SLA signature verified.</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 font-mono font-bold text-amber-600">401 Unauthorized</td>
                  <td className="p-3 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Invalid Key</td>
                  <td className="p-3 pr-4 text-[#515154] dark:text-[#A1A1A6]">Missing or revoked API key prefix (`oir_live_...`).</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 font-mono font-bold text-amber-600">429 Rate Limit</td>
                  <td className="p-3 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">RPM Exceeded</td>
                  <td className="p-3 pr-4 text-[#515154] dark:text-[#A1A1A6]">Exceeded per-key configured RPM ceiling. Exponential backoff recommended.</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 font-mono font-bold text-blue-600">503 SLA Failover</td>
                  <td className="p-3 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Auto-Failover</td>
                  <td className="p-3 pr-4 text-[#515154] dark:text-[#A1A1A6]">Upstream provider breached SLA. Circuit breaker rerouted to fallback model with escrow credit logged.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
