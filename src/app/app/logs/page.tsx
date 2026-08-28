"use client";

import { useState } from "react";
import { useAppStore, LogItem } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Bot,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  X
} from "lucide-react";

export default function LogsPage() {
  const { telemetryLogs, currency } = useAppStore();
  const rate = currency === "INR" ? 86.5 : 1;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskFilter, setSelectedTaskFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

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
        `• Complexity Assessment: Assessed as ${log.task_type === "code_generation" ? "High Complexity" : "Standard"}.\n` +
        `• Model Selection: Routed to ${log.model_used} based on prior 92.4% win rate.\n` +
        `• Net Spend Savings: Saved ${currency === "INR" ? `₹${(0.0052 * rate - log.cost_inr).toFixed(3)}` : `$${(0.0052 - log.cost_usd).toFixed(4)}`} per request compared to default GPT-4o.`
      );
      setAiExplaining(false);
    }, 450);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
          Audit & Telemetry Logs
        </h1>
        <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
          Inspect real-time routing decisions, costs, and outcome feedback
        </p>
      </div>

      {/* AI Log Explanation Drawer / Modal */}
      {selectedLog && (
        <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0050FF]" />
              <h3 className="font-semibold text-xs text-[#1D1D1F]">
                Decision Trace: <span className="font-mono text-[#0050FF]">{selectedLog.id}</span>
              </h3>
            </div>
            <button
              onClick={() => setSelectedLog(null)}
              className="h-6 w-6 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {aiExplaining ? (
            <div className="py-4 flex items-center justify-center gap-2 text-xs text-[#86868B]">
              <span className="h-3.5 w-3.5 border-2 border-[#0050FF] border-t-transparent rounded-full animate-spin"></span>
              <span>Analyzing routing trace...</span>
            </div>
          ) : (
            <div className="text-xs text-[#515154] leading-relaxed whitespace-pre-wrap font-sans">
              {aiExplanation}
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
          <input
            type="text"
            placeholder="Search by Request ID, model, prompt keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-full bg-white border border-black/[0.06] text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF]/30 shadow-sm transition-all"
          />
        </div>

        {/* Task Filter */}
        <div className="inline-flex p-1 rounded-full bg-[#F5F5F7]">
          {[
            { id: "all", label: "All Logs" },
            { id: "sales_email", label: "Sales" },
            { id: "code_generation", label: "Code" },
            { id: "customer_support", label: "Support" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTaskFilter(t.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                selectedTaskFilter === t.id
                  ? "bg-white text-[#1D1D1F] shadow-sm"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFD] text-[#86868B] border-b border-black/[0.05]">
              <tr>
                <th className="p-4 pl-6 font-medium">Request ID</th>
                <th className="p-4 font-medium">Model Used</th>
                <th className="p-4 font-medium">Task Domain</th>
                <th className="p-4 font-medium text-right">Cost</th>
                <th className="p-4 font-medium text-center">Latency</th>
                <th className="p-4 font-medium text-center">Outcome</th>
                <th className="p-4 pr-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FBFBFD] transition-colors">
                  <td className="p-4 pl-6 font-mono font-medium text-[#0050FF]">
                    {log.id}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-[#1D1D1F]">{log.model_used}</span>
                  </td>
                  <td className="p-4 text-[#515154] capitalize">
                    {log.task_type.replace("_", " ")}
                  </td>
                  <td className="p-4 text-right font-mono text-[#1D1D1F]">
                    {currency === "INR" ? `₹${log.cost_inr.toFixed(3)}` : `$${log.cost_usd.toFixed(4)}`}
                  </td>
                  <td className="p-4 text-center font-mono text-[#515154]">
                    {log.latency_ms}ms
                  </td>
                  <td className="p-4 text-center">
                    {log.outcome_success === true ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Win
                      </span>
                    ) : log.outcome_success === false ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        <XCircle className="h-3 w-3" /> Lost
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#86868B] bg-[#F5F5F7] px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleExplainWithAI(log)}
                      className="text-xs font-semibold text-[#0050FF] hover:underline"
                    >
                      Explain
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
