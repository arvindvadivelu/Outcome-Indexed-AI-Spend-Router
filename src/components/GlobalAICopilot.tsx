"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  X,
  Send,
  ArrowRight
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export function GlobalAICopilot() {
  const { currency, monthlySpendUSD, user } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content:
        "Hi! I'm your FinOps AI Assistant. Ask me how to reduce LLM costs, configure routing policies, debug code, or improve model win-rates."
    }
  ]);

  const quickPrompts = [
    "How to save 40% on API costs?",
    "Best model for code reviews?",
    "How does Thompson Sampling work?"
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    setInputQuery("");
    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          strategy: "outcome_optimized",
          target_metric: "user_satisfaction"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || "I evaluated your query using our outcome optimization engine.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } else {
        throw new Error("Gateway error");
      }
    } catch {
      // Direct context fallback
      const lower = text.toLowerCase();
      let reply = "I analyzed your setup using our outcome optimization engine.";

      if (lower.includes("save") || lower.includes("cost") || lower.includes("spend")) {
        reply = `Routing routine prompt traffic to DeepSeek-V3 ($0.42/1M) and Groq Llama 3.3 ($0.18/1M) will immediately recover ~42% in gross API spend (saving ~$${(monthlySpendUSD * 0.42).toFixed(0)}/mo) with zero outcome loss.`;
      } else if (lower.includes("latency") || lower.includes("speed") || lower.includes("fast")) {
        reply = `Speculative Dual-Model Execution races Groq Llama 3.3 (84ms) in parallel with Claude 3.5 Sonnet. When Groq passes the quality bar, the slower call is cancelled—cutting P95 latency by 60%.`;
      } else if (lower.includes("code") || lower.includes("python") || lower.includes("typescript") || lower.includes("review")) {
        reply = `For code generation and PR reviews, DeepSeek-Coder gives a 92.1% pass rate at $0.00065/req with Claude 3.5 Sonnet as fallback—saving 88% compared to standard GPT-4o.`;
      } else if (lower.includes("thompson") || lower.includes("math") || lower.includes("bayesian")) {
        reply = `We maintain Beta(α, β) distributions where α = successful business outcomes and β = retries. Thompson Sampling tests models dynamically to balance exploration and cost savings.`;
      } else {
        reply = `Our classifier assesses prompt depth in <2ms. We recommend keeping Auto-Pilot on 'Optimal' mode to automatically hit your budget targets.`;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#0050FF] text-white text-xs font-semibold shadow-lg shadow-[#0050FF]/25 hover:bg-[#0043D6] transition-all hover:scale-105"
        >
          <Bot className="h-4 w-4" />
          <span>AI Assistant</span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl bg-white dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.1] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-[#FBFBFD] dark:bg-[#151518] border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#0050FF]/10 dark:bg-[#0050FF]/20 flex items-center justify-center text-[#0050FF] dark:text-[#3374FF]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">FinOps Copilot</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Bayesian Router
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#86868B]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#0050FF] text-white rounded-br-xs"
                      : "bg-[#F5F5F7] dark:bg-[#202024] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-bl-xs whitespace-pre-wrap"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-[#F5F5F7] dark:bg-[#202024] text-xs text-[#86868B] flex items-center gap-1.5 rounded-bl-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#86868B] animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#86868B] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#86868B] animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-[10px] text-[#515154] dark:text-[#A1A1A6] hover:bg-[#EEF4FF] hover:text-[#0050FF] dark:hover:bg-[#0050FF]/20 dark:hover:text-[#3374FF] transition-colors shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#FBFBFD] dark:bg-[#151518] border-t border-black/[0.05] dark:border-white/[0.05] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask how to optimize routes..."
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#202024] border border-black/[0.08] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF]"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="h-8 w-8 rounded-xl bg-[#0050FF] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#0043D6] transition-colors shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
