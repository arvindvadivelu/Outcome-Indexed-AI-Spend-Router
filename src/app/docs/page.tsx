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
  FileCode,
  Lock,
  Activity,
  Sliders,
  ChevronRight
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
      let routed = "DeepSeek Coder V2";
      let cost = "$0.00062";
      let ttft = "58.4ms";
      let savings = "88.2%";

      if (testTargetMetric === "first_contact_resolution") {
        routed = "Groq Llama 3.3 70B";
        cost = "$0.00018";
        ttft = "42.1ms";
        savings = "92.4%";
      } else if (testTargetMetric === "demo_booked") {
        routed = "Claude 3.5 Sonnet";
        cost = "$0.0034";
        ttft = "68.2ms";
        savings = "74.1%";
      }

      setLiveResponse({
        id: "oir_req_" + Math.random().toString(36).substring(2, 9),
        model_routed: routed,
        ttft: ttft,
        cost_usd: cost,
        spend_saved_pct: savings,
        sla_contract_nonce: "0x" + Math.random().toString(16).substring(2, 14),
        delta_cached_tokens: 284,
        content: `OutcomeRouter Gateway synthesized your request under Pareto target [${testTargetMetric}].\n\n- Model Selected: ${routed} (Marginal KPI win probability: 94.6%)\n- TTFT Edge Latency: ${ttft}\n- Avoided Spend vs GPT-4o: -${savings}\n- SHA-256 Micro-SLA Contract Nonce: Active`
      });
      setIsExecuting(false);
    }, 450);
  };

  const customHeaders = [
    {
      header: "X-Outcome-Strategy",
      values: "outcome_optimized | cost_minimal | quality_boost",
      desc: "Dictates Bayesian Dirichlet optimization weights across Pareto frontier models."
    },
    {
      header: "X-Outcome-Target-Metric",
      values: "code_merged | demo_booked | first_contact_resolution | custom",
      desc: "Specific business outcome conversion target used to rank historical Thompson posteriors."
    },
    {
      header: "X-Outcome-SLA-Threshold-Ms",
      values: "150 (integer milliseconds)",
      desc: "Maximum acceptable TTFT latency. If breached, failover triggers at $0 overage with instant token refund."
    },
    {
      header: "X-Outcome-Semantic-Delta",
      values: "true | false",
      desc: "Enables cryptographic <delta_ref> conversation diffing to avoid retransmitting multi-turn chat history."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF] antialiased" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-12 sm:pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-24 sm:space-y-32">
        {/* 1. Header */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4 sm:pt-6" suppressHydrationWarning>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08]">
            Developer &amp; API <br />
            <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Integration Documentation.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed font-normal">
            Drop-in OpenAI wire compatible endpoints, cryptographic Micro-SLA headers, and multi-model autonomous routing specifications.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/app/settings/api-keys"
              className="h-12 px-8 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_8px_24px_rgba(0,80,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Get API Key</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => setShowSimulate(true)}
              className="h-12 px-8 rounded-full bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-current text-[#0050FF]" />
              <span>Simulate Request</span>
            </button>
          </div>
        </section>

        {/* 2. 1-Minute Quickstart Code Box */}
        <section className="p-8 sm:p-12 rounded-[36px] bg-[#0E1117] border border-white/[0.08] text-white shadow-xl max-w-4xl mx-auto space-y-6" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                OpenAI Wire-Compatible Quickstart
              </h2>
              <p className="text-xs text-neutral-400">
                Point your existing SDK baseURL to our gateway endpoint with zero code refactoring.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 rounded-full bg-white/10 backdrop-blur-md">
                {(["python", "node", "curl"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLang(tab)}
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                      activeLang === tab ? "bg-white text-black shadow-xs font-bold" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {tab === "node" ? "Node.js" : tab}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-black/60 border border-white/[0.06] overflow-x-auto font-mono text-xs text-neutral-300 leading-relaxed">
            <pre>{codeSnippets[activeLang]}</pre>
          </div>
        </section>

        {/* 3. Live Interactive Docs API Sandbox */}
        <section className="p-8 sm:p-12 rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm max-w-4xl mx-auto space-y-6" suppressHydrationWarning>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Live API Gateway Sandbox
            </h2>
            <p className="text-xs text-[#86868B]">
              Execute simulated gateway requests live in your browser to inspect model selection and cryptographic headers.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Input Prompt / Agent Instruction</label>
              <textarea
                rows={2}
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/40 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#86868B]">X-Outcome-Target-Metric</label>
                <select
                  value={testTargetMetric}
                  onChange={(e) => setTestTargetMetric(e.target.value)}
                  className="w-full h-10 px-3 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                >
                  <option value="code_merged">code_merged (Software Dev / PRs)</option>
                  <option value="demo_booked">demo_booked (Sales &amp; Copy)</option>
                  <option value="first_contact_resolution">first_contact_resolution (Customer Support)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#86868B]">X-Outcome-Strategy</label>
                <select
                  value={testStrategy}
                  onChange={(e) => setTestStrategy(e.target.value)}
                  className="w-full h-10 px-3 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                >
                  <option value="outcome_optimized">outcome_optimized (70% Quality / 25% Cost)</option>
                  <option value="cost_minimal">cost_minimal (50% Quality / 40% Cost)</option>
                  <option value="quality_boost">quality_boost (85% Quality / 15% Cost)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExecuteLiveTest}
              disabled={isExecuting}
              className="h-11 px-7 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isExecuting ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Arbitrating Priors...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Execute Gateway Call</span>
                </>
              )}
            </button>
          </div>

          {liveResponse && (
            <div className="p-6 rounded-2xl bg-[#0E1117] border border-white/[0.08] text-white font-mono text-xs space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                <span className="text-emerald-400 font-bold">HTTP 200 OK · {liveResponse.id}</span>
                <span className="text-[#0050FF] font-bold">Selected: {liveResponse.model_routed}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-neutral-300">
                <div>
                  <span className="text-neutral-500 block uppercase">TTFT</span>
                  <span className="font-bold text-white">{liveResponse.ttft}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase">Cost</span>
                  <span className="font-bold text-emerald-400">{liveResponse.cost_usd}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase">Savings</span>
                  <span className="font-bold text-[#3374FF]">-{liveResponse.spend_saved_pct}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase">Escrow Nonce</span>
                  <span className="font-bold text-white">{liveResponse.sla_contract_nonce}</span>
                </div>
              </div>

              <pre className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] text-neutral-200 whitespace-pre-wrap leading-relaxed text-[11px]">
                {liveResponse.content}
              </pre>
            </div>
          )}
        </section>

        {/* 4. Custom HTTP Headers Specification Table */}
        <section className="space-y-6 max-w-4xl mx-auto" suppressHydrationWarning>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Gateway Custom Request Headers
            </h2>
            <p className="text-xs text-[#86868B]">
              Inject these optional headers to control Bayesian Dirichlet weighting and Micro-SLA bounds.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                  <th className="pb-3 font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Header Name</th>
                  <th className="pb-3 font-bold text-[#0050FF] dark:text-[#3374FF]">Supported Values</th>
                  <th className="pb-3 font-bold text-[#86868B]">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {customHeaders.map((h, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                    <td className="py-3 font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{h.header}</td>
                    <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400">{h.values}</td>
                    <td className="py-3 text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{h.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Enterprise SLA Trust Bar */}
        <section className="p-6 sm:p-8 rounded-[30px] bg-white/60 dark:bg-[#151518]/60 backdrop-blur-2xl border border-black/[0.04] dark:border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-6 text-center" suppressHydrationWarning>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">99.99%</div>
            <div className="text-xs text-[#86868B] font-medium">Gateway Uptime SLA</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">58ms</div>
            <div className="text-xs text-[#86868B] font-medium">Average Edge TTFT</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-xs text-[#86868B] font-medium">Verifiable SHA-256 Escrow</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">0-Code</div>
            <div className="text-xs text-[#86868B] font-medium">SDK Drop-in Migration</div>
          </div>
        </section>

        {/* 6. Apple-Spatial Final Call to Action */}
        <section className="rounded-[36px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-8 sm:p-16 text-white shadow-[0_24px_60px_rgba(0,80,255,0.32)] text-center space-y-6 relative overflow-hidden" suppressHydrationWarning>
          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Start Integrating in 60 Seconds
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              Claim your free API key with 10,000 monthly tokens. Zero credit card required.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-[#0050FF] font-bold text-xs hover:bg-neutral-100 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                Get API Key
              </Link>
              <Link
                href="/app/dashboard"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all border border-white/20 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
              >
                Launch Console
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
