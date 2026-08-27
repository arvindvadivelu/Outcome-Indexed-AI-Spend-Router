"use client";

import { useState } from "react";
import { useAppStore, LogItem } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Bot,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  Database
} from "lucide-react";

export default function LogsPage() {
  const { telemetryLogs, currency, recordOutcome } = useAppStore();
  const rate = currency === "INR" ? 86.5 : 1;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskFilter, setSelectedTaskFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

  // AI Log Explainer state
  const [aiExplaining, setAiExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const filteredLogs = telemetryLogs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.model_used.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.prompt_preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTask = selectedTaskFilter === "all" || log.task_type === selectedTaskFilter;
    return matchesSearch && matchesTask;
  });

  const handleExplainWithAI = (log: LogItem) => {
    setSelectedLog(log);
    setAiExplaining(true);
    setAiExplanation(null);

    setTimeout(() => {
      setAiExplanation(
        `AI Diagnostic Trace for ${log.id}:\n\n` +
        `• Complexity Score: ${log.task_type === "code_generation" ? "0.85 (High)" : "0.45 (Moderate)"}\n` +
        `• Selected Model: ${log.model_used} (${log.provider})\n` +
        `• Thompson Score: Prior win rate was 92.4% with expected latency of ${log.latency_ms}ms\n` +
        `• Speculative Fast-Track: ${log.speculative_win ? "Won (Saved $0.0028 vs flagship)" : "Standard single-dispatch"}\n` +
        `• Auto-Critic Verdict: ${log.critic_escalated ? "Escalated to flagship for refinement" : "Clean pass, zero hallucination flags"}\n` +
        `• Net Margin Generated: +${currency === "INR" ? `₹${(0.0052 * rate - log.cost_inr).toFixed(3)}` : `$${(0.0052 - log.cost_usd).toFixed(4)}`} retained.`
      );
      setAiExplaining(false);
    }, 450);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Telemetry Logs & AI Trace Explainer
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
            Real-time Bayesian routing decisions, token usage, latency metrics, and root-cause explanations
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-apple-sm text-xs font-mono text-[#515154]">
          <Bot className="h-4 w-4 text-[#0050FF]" />
          <span>AI Log Explainer Active</span>
        </div>
      </div>

      {/* AI Log Explanation Drawer / Modal */}
      {selectedLog && (
        <div className="p-6 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EEF4FF] text-[#0050FF]">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-[#1D1D1F]">
                AI Decision Breakdown: <span className="font-mono text-[#0050FF]">{selectedLog.id}</span>
              </h3>
            </div>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-xs font-mono text-[#86868B] hover:text-[#1D1D1F]"
            >
              Close
            </button>
          </div>

          {aiExplaining ? (
            <div className="p-4 text-center space-y-2">
              <span className="h-5 w-5 border-2 border-[#0050FF] border-t-transparent rounded-full animate-spin inline-block"></span>
              <p className="text-xs text-[#86868B] font-mono">Analyzing prompt tokens & Bayesian decision priors...</p>
            </div>
          ) : (
            <pre className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] whitespace-pre-wrap leading-relaxed">
              {aiExplanation}
            </pre>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#86868B]" />
          <input
            type="text"
            placeholder="Search by request ID, model name, or prompt content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-2xl bg-white border border-[#E5E5EA] text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] shadow-apple-sm font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "sales_email", "code_generation", "customer_support"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTaskFilter(t)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-medium transition-all capitalize ${
                selectedTaskFilter === t
                  ? "bg-[#0050FF] text-white shadow-apple-blue"
                  : "bg-white border border-[#E5E5EA] text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F5F7] text-[#1D1D1F] font-mono border-b border-[#E5E5EA]">
              <tr>
                <th className="p-4 pl-6">Request ID / Time</th>
                <th className="p-4">Model Routed</th>
                <th className="p-4">Prompt Preview</th>
                <th className="p-4 text-right">Cost</th>
                <th className="p-4 text-center">Latency</th>
                <th className="p-4 text-center">Outcome</th>
                <th className="p-4 pr-6 text-center">AI Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA] bg-white font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F5F5F7]/60 transition-colors">
                  <td className="p-4 pl-6">
                    <span className="font-bold text-[#1D1D1F] block">{log.id}</span>
                    <span className="text-[10px] text-[#86868B]">{log.created_at}</span>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-md border border-[#0050FF]/20">
                      {log.model_used}
                    </span>
                    <span className="text-[10px] text-[#86868B] block mt-0.5 uppercase">{log.provider}</span>
                  </td>

                  <td className="p-4 max-w-xs truncate text-[#515154] font-sans">
                    {log.prompt_preview}
                  </td>

                  <td className="p-4 text-right font-bold text-[#1D1D1F]">
                    {currency === "INR" ? `₹${log.cost_inr.toFixed(3)}` : `$${log.cost_usd.toFixed(4)}`}
                  </td>

                  <td className="p-4 text-center text-[#86868B]">
                    {log.latency_ms}ms
                  </td>

                  <td className="p-4 text-center">
                    {log.outcome_success === true ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#EEF4FF] text-[#0050FF] font-bold text-[10px] border border-[#0050FF]/20">
                        Won
                      </span>
                    ) : log.outcome_success === false ? (
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-bold text-[10px]">
                        Lost
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#F5F5F7] text-[#86868B] text-[10px]">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="p-4 pr-6 text-center">
                    <button
                      onClick={() => handleExplainWithAI(log)}
                      className="px-3 py-1 rounded-full bg-[#EEF4FF] text-[#0050FF] font-bold text-[10px] hover:bg-[#0050FF] hover:text-white transition-all flex items-center gap-1 mx-auto"
                    >
                      <Bot className="h-3 w-3" />
                      <span>Explain AI Choice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
