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
  const { currency, monthlySpendUSD } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content:
        "Hi! I'm your FinOps AI Assistant. Ask me how to reduce LLM costs, configure routing policies, or improve model win-rates."
    }
  ]);

  const quickPrompts = [
    "How to save 40% on API costs?",
    "Best model for code reviews?",
    "How does Thompson Sampling work?"
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    setInputQuery("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsTyping(true);

    setTimeout(() => {
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

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply
        }
      ]);
      setIsTyping(false);
    }, 500);
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
          <span>Ask AI Assistant</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] rounded-3xl bg-white border border-black/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#FBFBFD] border-b border-black/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#EEF4FF] text-[#0050FF] flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-[#1D1D1F]">AI Copilot</h4>
                <p className="text-[10px] text-[#86868B]">Spend & Routing Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#0050FF] text-white rounded-br-sm"
                      : "bg-[#F5F5F7] text-[#1D1D1F] rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[#F5F5F7] text-[#86868B] w-20">
                <span className="h-1.5 w-1.5 rounded-full bg-[#86868B] animate-bounce"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#86868B] animate-bounce [animation-delay:0.15s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#86868B] animate-bounce [animation-delay:0.3s]"></span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-[#FBFBFD] border-t border-black/[0.04] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(qp)}
                className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-white border border-black/[0.06] text-[#515154] hover:text-[#0050FF] hover:border-[#0050FF]/30 transition-all flex-shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-black/[0.05] flex gap-2"
          >
            <input
              type="text"
              placeholder="Type your question..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 h-9 px-3 rounded-full bg-[#F5F5F7] text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="h-9 w-9 rounded-full bg-[#0050FF] text-white flex items-center justify-center hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
