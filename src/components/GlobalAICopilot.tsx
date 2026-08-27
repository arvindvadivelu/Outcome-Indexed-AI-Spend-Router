"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  X,
  Send,
  ArrowRight,
  TrendingDown,
  Zap,
  Code2,
  Gauge,
  CheckCircle2
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export function GlobalAICopilot() {
  const { currency, monthlySpendUSD } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; actions?: any[] }>>([
    {
      role: "assistant",
      content:
        "Hello! I am your Outcome Router AI Copilot. Ask me anything about LLM cost optimization, routing algorithms, token savings, or policy configuration."
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
    setInputQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = "I analyzed your query using our Bayesian Pareto optimization model.";

      if (lower.includes("save") || lower.includes("cost") || lower.includes("spend")) {
        reply = `Based on your monthly spend profile (~$${monthlySpendUSD.toFixed(0)}), routing lower-complexity prompt traffic to DeepSeek-V3 ($0.42/1M) and Groq Llama 3.3 ($0.18/1M) will immediately recover ~42% in gross API spend (saving ~$${(monthlySpendUSD * 0.42).toFixed(0)}/month) with zero conversion degradation.`;
      } else if (lower.includes("latency") || lower.includes("speed") || lower.includes("fast")) {
        reply = `To achieve sub-100ms latency, enable Speculative Dual-Model Execution. It races Groq Llama 3.3 (84ms) in parallel with Claude 3.5 Sonnet. If Groq succeeds, Claude is aborted—cutting P95 latency by 60%.`;
      } else if (lower.includes("code") || lower.includes("python") || lower.includes("typescript")) {
        reply = `For code generation and refactoring, our Pareto frontier prioritizes DeepSeek-Coder as primary (92.1% pass rate at $0.00065/req) with Claude 3.5 Sonnet as fallback. This saves 88% compared to standard GPT-4o.`;
      } else if (lower.includes("math") || lower.includes("thompson") || lower.includes("algorithm")) {
        reply = `We use Beta(alpha, beta) probability distributions where alpha = successful outcomes and beta = failed conversions. Thompson Sampling samples posterior distributions each request, dynamically balancing exploration vs exploitation.`;
      } else {
        reply = `Our Zero-Shot Classifier evaluates token volume and reasoning complexity in <2ms. We recommend activating Autonomous Budget Auto-Pilot to dynamically pace Pareto weights against your monthly budget ceiling.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#0050FF] text-white font-bold text-xs shadow-apple-blue hover:bg-[#0040CC] transition-all hover:scale-105"
        >
          <div className="relative">
            <Bot className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <span>Ask Outcome AI</span>
          <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
            Copilot
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[540px] rounded-3xl bg-white border border-black/[0.12] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#FBFBFD] border-b border-[#E5E5EA] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-[#EEF4FF] text-[#0050FF]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-[#1D1D1F]">Outcome AI Copilot</h4>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-[10px] text-[#86868B]">Autonomous AI FinOps Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="px-4 py-2 bg-[#F5F5F7] border-b border-[#E5E5EA] flex gap-1.5 overflow-x-auto text-[10px] font-mono">
            <button
              onClick={() => setInputQuery("How much will I save?")}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E5E5EA] text-[#515154] hover:text-[#0050FF] flex-shrink-0"
            >
              💰 Cost Savings
            </button>
            <button
              onClick={() => setInputQuery("How to cut latency?")}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E5E5EA] text-[#515154] hover:text-[#0050FF] flex-shrink-0"
            >
              ⚡ Fast-Track Latency
            </button>
            <button
              onClick={() => setInputQuery("Explain Thompson sampling math")}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E5E5EA] text-[#515154] hover:text-[#0050FF] flex-shrink-0"
            >
              🧠 Algorithm Math
            </button>
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-mono">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.role === "user"
                      ? "bg-[#0050FF] text-white rounded-br-none"
                      : "bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA] rounded-bl-none font-sans text-xs leading-relaxed"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-1.5 text-[#86868B] text-[11px] font-mono p-2">
                <span className="h-2 w-2 rounded-full bg-[#0050FF] animate-bounce"></span>
                <span className="h-2 w-2 rounded-full bg-[#0050FF] animate-bounce delay-100"></span>
                <span className="h-2 w-2 rounded-full bg-[#0050FF] animate-bounce delay-200"></span>
                <span className="ml-1">AI Copilot is reasoning...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5E5EA] bg-white flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about AI spend or routing..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] font-mono"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="h-10 w-10 rounded-xl bg-[#0050FF] text-white flex items-center justify-center hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
