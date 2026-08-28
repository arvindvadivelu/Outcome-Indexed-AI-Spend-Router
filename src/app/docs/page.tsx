"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Copy,
  Check,
  Bot,
  Sparkles,
  Zap,
  Code2
} from "lucide-react";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"python" | "node" | "curl">("python");
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
          `from outcome_router import OutcomeRouterClient, track_outcome\n\n# 5-line drop-in replacement\nrouter = OutcomeRouterClient(api_key="oir_live_8f39a7b92")\n\n@track_outcome(target_metric="demo_booked", revenue_impact_usd=500.0)\ndef handle_outreach():\n    return router.chat(\n        messages=[{"role": "user", "content": "Draft outreach email"}],\n        strategy="outcome_optimized",\n        speculative=True,\n        auto_critic=True\n    )`
        );
      } else {
        setTranspiledResult(
          `import { OutcomeRouterClient } from "outcome-router";\n\nconst router = new OutcomeRouterClient({ apiKey: "oir_live_8f39a7b92" });\n\nexport async function handleOutreach() {\n  return await router.chat({\n    messages: [{ role: "user", content: "Draft outreach email" }],\n    routing_preferences: {\n      strategy: "outcome_optimized",\n      target_metric: "demo_booked",\n      speculative_mode: true\n    }\n  });\n}`
        );
      }
      setIsTranspiling(false);
    }, 450);
  };

  const codeSnippets = {
    python: `from outcome_router import OutcomeRouterClient

# 1. Initialize client
router = OutcomeRouterClient(api_key="oir_live_8f39a7b92")

# 2. Call chat completion with Outcome-Indexed Routing
response = router.chat(
    messages=[
        {"role": "system", "content": "You are an automated code reviewer."},
        {"role": "user", "content": "Check this TypeScript function for memory leaks"}
    ],
    strategy="outcome_optimized",
    target_metric="code_merged",
    speculative=True,      # Races fast model & flagship (cuts P95 latency by 60%)
    auto_critic=True       # Auto-escalates errors to flagship
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
    speculative_mode: true
  }
});

console.log("Model Selected:", response._routerMetadata.modelUsed);
console.log("Dollars Saved:", response._routerMetadata.savedUsd);`,
    curl: `curl -X POST https://api.outcomerouter.com/v1/chat/completions \\
  -H "Authorization: Bearer oir_live_8f39a7b92" \\
  -H "Content-Type: application/json" \\
  -H "X-Outcome-Strategy: outcome_optimized" \\
  -H "X-Outcome-Target-Metric: code_merged" \\
  -d '{
    "model": "auto",
    "messages": [
      {"role": "user", "content": "Check this function for bugs"}
    ]
  }'`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F]">
              Developer Documentation
            </h1>
            <p className="text-base text-[#6E6E73]">
              Integrate the Outcome-Indexed AI Spend Router into your Python or Node.js apps in 5 minutes.
            </p>
          </div>

          {/* Code Snippet Card */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-black/[0.06] shadow-sm overflow-hidden space-y-0">
            <div className="p-4 sm:p-5 border-b border-black/[0.05] flex items-center justify-between">
              {/* Language Tabs */}
              <div className="inline-flex p-1 rounded-full bg-[#F5F5F7]">
                {[
                  { id: "python", label: "Python SDK" },
                  { id: "node", label: "Node.js / TS" },
                  { id: "curl", label: "cURL API" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-[#1D1D1F] shadow-sm"
                        : "text-[#86868B] hover:text-[#1D1D1F]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs text-[#0050FF] hover:underline font-medium"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            <div className="p-6 bg-[#FBFBFD] overflow-x-auto">
              <pre className="text-xs font-mono text-[#1D1D1F] leading-relaxed">
                {codeSnippets[activeTab]}
              </pre>
            </div>
          </div>

          {/* AI Code Converter Tool */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-black/[0.06] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-[#0050FF]" />
                <h3 className="font-bold text-base text-[#1D1D1F]">AI Code Migrator</h3>
              </div>
              <span className="text-xs text-[#86868B]">Converts standard OpenAI code to Outcome Router</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#86868B]">Existing OpenAI Code</label>
                <textarea
                  value={sourceCodeInput}
                  onChange={(e) => setSourceCodeInput(e.target.value)}
                  rows={8}
                  className="w-full rounded-2xl bg-[#F5F5F7] border border-transparent p-3.5 text-xs font-mono text-[#1D1D1F] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#86868B]">Migrated Outcome Router Code</label>
                <div className="w-full h-44 rounded-2xl bg-[#F5F5F7] p-3.5 text-xs font-mono text-[#0050FF] overflow-y-auto whitespace-pre-wrap">
                  {isTranspiling ? (
                    <span className="text-[#86868B]">Generating 5-line drop-in code...</span>
                  ) : (
                    transpiledResult || "// Click Migrate Code to generate drop-in snippet"
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleTranspile}
                disabled={isTranspiling || !sourceCodeInput.trim()}
                className="px-5 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 shadow-sm transition-all"
              >
                {isTranspiling ? "Migrating..." : "Migrate to Outcome Router"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
