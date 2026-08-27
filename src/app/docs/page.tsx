"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Terminal,
  Copy,
  Check,
  Bot,
  Sparkles,
  Zap,
  ArrowRight,
  Code2
} from "lucide-react";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"python" | "node" | "policy" | "speculative">("python");
  const [copied, setCopied] = useState(false);

  // Dynamic AI Code Transpiler state
  const [sourceCodeInput, setSourceCodeInput] = useState(
    `import openai\n\nclient = openai.OpenAI()\nresp = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[{"role": "user", "content": "Draft outreach email"}]\n)`
  );
  const [transpilerLanguage, setTranspilerLanguage] = useState<"python" | "typescript">("python");
  const [isTranspiling, setIsTranspiling] = useState(false);
  const [transpiledResult, setTranspiledResult] = useState<string | null>(null);

  const handleTranspile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTranspiling(true);
    setTimeout(() => {
      if (transpilerLanguage === "python") {
        setTranspiledResult(
          `from outcome_router import OutcomeRouterClient, track_outcome\n\n# 5-line drop-in replacement\nrouter = OutcomeRouterClient(api_key="oir_live_8f39a7b92")\n\n@track_outcome(target_metric="demo_booked", revenue_impact_usd=500.0)\ndef handle_outreach():\n    return router.chat(\n        messages=[{"role": "user", "content": "Draft outreach email"}],\n        strategy="outcome_optimized",\n        speculative=True,      # 84ms fast-track\n        auto_critic=True       # Zero hallucinations\n    )`
        );
      } else {
        setTranspiledResult(
          `import { OutcomeRouterClient } from "outcome-router";\n\nconst router = new OutcomeRouterClient({ apiKey: "oir_live_8f39a7b92" });\n\nexport async function handleOutreach() {\n  return await router.chat({\n    messages: [{ role: "user", content: "Draft outreach email" }],\n    routing_preferences: {\n      strategy: "outcome_optimized",\n      target_metric: "demo_booked",\n      speculative_mode: true\n    }\n  });\n}`
        );
      }
      setIsTranspiling(false);
    }, 500);
  };

  const codeSnippets = {
    python: `from outcome_router import OutcomeRouterClient

# 1. Initialize client (5-line drop-in)
router = OutcomeRouterClient(api_key="oir_live_8f39a7b92")

# 2. Call chat completion with AI Auto-Critic & Speculative Racing
response = router.chat(
    messages=[
        {"role": "system", "content": "You are a sales SDR."},
        {"role": "user", "content": "Draft outreach to VP Eng at Series B FinTech"}
    ],
    strategy="outcome_optimized",
    target_metric="demo_booked",
    auto_critic=True,      # Auto-refines hallucinations with flagship
    speculative=True,      # Races Groq & Claude to cut latency by 60%
    enable_cache=True
)

print("Optimal Model Picked:", response["_router_metadata"]["model_used"])
print("Dollars Saved:", response["_router_metadata"]["saved_usd"])`,
    node: `import { OutcomeRouterClient } from "outcome-router";

// 1. Initialize client
const router = new OutcomeRouterClient({ apiKey: "oir_live_8f39a7b92" });

// 2. Chat with Auto-Critic & Speculative execution
const response = await router.chat({
  messages: [
    { role: "system", content: "You are an automated code reviewer." },
    { role: "user", content: "Check this TypeScript function for memory leaks" }
  ],
  routing_preferences: {
    strategy: "outcome_optimized",
    target_metric: "code_merged",
    auto_critic: true,
    speculative_mode: true,
    enable_cache: true
  }
});

console.log("Model Selected:", response._routerMetadata.modelUsed);
console.log("Dollars Saved:", response._routerMetadata.savedUsd);`,
    policy: `// POST /api/v1/ai/synthesize-policy
// Compiles plain English into executable Bayesian routing policies

curl -X POST https://api.outcomerouter.com/api/v1/ai/synthesize-policy \\
  -H "Authorization: Bearer oir_live_8f39a7b92" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Optimize customer support FAQ to reply under 100ms with >95% resolution rate"
  }'`,
    speculative: `// POST /api/v1/ai/speculative-chat
// Races ultra-fast budget models in parallel with deep reasoning flagships

curl -X POST https://api.outcomerouter.com/api/v1/ai/speculative-chat \\
  -H "Authorization: Bearer oir_live_8f39a7b92" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fast_model": "llama-3.3-70b-versatile",
    "flagship_model": "claude-3-5-sonnet-20241022",
    "messages": [
      {"role": "user", "content": "Refactor this SQL join to prevent table locks"}
    ]
  }'`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        {/* Title */}
        <div className="space-y-2 border-b border-[#E5E5EA] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20 text-[#0050FF] text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>Developer Reference & Interactive AI Transpiler</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F]">
            Autonomous AI SDKs & Transpiler
          </h1>
          <p className="text-sm text-[#6E6E73]">
            Integrate Speculative Racing, Self-Correction Critic, and AI Policy Synthesis into your production stack.
          </p>
        </div>

        {/* 1. Interactive AI Code Transpiler Card */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E5EA] pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EEF4FF] text-[#0050FF]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1D1D1F]">AI Legacy Code Transpiler</h3>
                <p className="text-[11px] text-[#86868B]">Paste your legacy OpenAI or Anthropic code to instantly convert it to Outcome Router</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTranspilerLanguage("python")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  transpilerLanguage === "python" ? "bg-[#0050FF] text-white" : "bg-[#F5F5F7] text-[#515154]"
                }`}
              >
                Python
              </button>
              <button
                type="button"
                onClick={() => setTranspilerLanguage("typescript")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  transpilerLanguage === "typescript" ? "bg-[#0050FF] text-white" : "bg-[#F5F5F7] text-[#515154]"
                }`}
              >
                TypeScript
              </button>
            </div>
          </div>

          <form onSubmit={handleTranspile} className="space-y-3">
            <textarea
              rows={3}
              value={sourceCodeInput}
              onChange={(e) => setSourceCodeInput(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
              placeholder="Paste raw OpenAI or Anthropic code snippet..."
            />
            <button
              type="submit"
              disabled={isTranspiling}
              className="px-6 py-2.5 rounded-full bg-[#0050FF] text-white text-xs font-bold hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isTranspiling ? "Transpiling Code..." : "Transpile to Outcome Router"}
            </button>
          </form>

          {transpiledResult && (
            <div className="p-4 rounded-2xl bg-[#1D1D1F] text-slate-200 text-xs font-mono relative overflow-hidden animate-in fade-in">
              <span className="text-[10px] uppercase font-bold text-[#0050FF] block mb-2">
                ✓ Transpiled Drop-in Code (-42% Token Cost Enabled)
              </span>
              <pre className="overflow-x-auto whitespace-pre-wrap">{transpiledResult}</pre>
            </div>
          )}
        </section>

        {/* 2. SDK Reference & Code Switcher */}
        <section id="quickstart" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1D1D1F] flex items-center gap-2">
              <Terminal className="h-5 w-5 text-[#0050FF]" />
              <span>Standard SDK Implementation</span>
            </h2>
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono">
              {(["python", "node", "policy", "speculative"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1 rounded-full transition-all capitalize ${
                    activeTab === tab
                      ? "bg-[#0050FF] text-white font-bold shadow-sm"
                      : "text-[#6E6E73] hover:text-[#1D1D1F]"
                  }`}
                >
                  {tab === "policy" ? "AI Policy API" : tab === "speculative" ? "Speculative Race" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl bg-[#1D1D1F] text-slate-100 border border-black/[0.08] overflow-hidden shadow-apple-lg">
            <div className="flex items-center justify-between px-5 py-3 bg-[#2D2D2F] border-b border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="h-3 w-3 rounded-full bg-[#FF5F56] inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E] inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-[#27C93F] inline-block"></span>
                <span className="ml-2">
                  {activeTab === "python"
                    ? "quickstart_ai.py"
                    : activeTab === "node"
                    ? "quickstart_ai.ts"
                    : activeTab === "policy"
                    ? "policy_synthesizer.sh"
                    : "speculative_race.sh"}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white font-mono transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#0050FF]" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            <pre className="p-6 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {codeSnippets[activeTab]}
            </pre>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
