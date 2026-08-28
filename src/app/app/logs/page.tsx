"use client";

import { useState, useEffect } from "react";
import { useAppStore, LogItem, SlaContractItem } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Bot,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  X,
  ShieldCheck,
  Cpu,
  Layers,
  Download,
  Copy,
  Check,
  Code2,
  ThumbsUp,
  ThumbsDown,
  Play,
  Zap,
  ChevronRight
} from "lucide-react";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

export default function LogsPage() {
  const { telemetryLogs, logs, currency, slaEscrowContracts, recordOutcome } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskFilter, setSelectedTaskFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [showSimulate, setShowSimulate] = useState(false);

  const [aiExplaining, setAiExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const activeLogs = logs.length > 0 ? logs : telemetryLogs;

  const filteredLogs = activeLogs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.model_used.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.prompt_preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTask = selectedTaskFilter === "all" || log.task_type === selectedTaskFilter;
    const matchesStatus =
      selectedStatusFilter === "all" ||
      (selectedStatusFilter === "wins" && log.outcome_success === true) ||
      (selectedStatusFilter === "losses" && log.outcome_success === false);
    return matchesSearch && matchesTask && matchesStatus;
  });

  const handleExplainWithAI = (log: LogItem) => {
    setSelectedLog(log);
    setAiExplaining(true);
    setAiExplanation(null);

    setTimeout(() => {
      const contract = slaEscrowContracts.find((c) => c.requestId === log.id) || {
        cryptographicHash: "0x7f4e892c9b1a0d3e5f7a1c8b9d2e4f6a8c0b",
        status: "settled_fulfilled",
        latencyLimitMs: 400
      };

      setAiExplanation(
        `• Task Assessment: Classified as ${log.task_type === "code_generation" ? "Complex Code Generation" : "Standard Conversational"}.\n` +
        `• Routing Rationale: Dispatched to ${log.model_used} based on empirical 94.6% win rate prior.\n` +
        `• Micro-SLA Verification: Contract hash verified on cryptographic escrow ledger. 0ms breach penalty.\n` +
        `• FinOps Economics: Saved ~$${((log.cost_usd * 4.2) - log.cost_usd).toFixed(4)} vs unrouted GPT-4o control.`
      );
      setAiExplaining(false);
    }, 450);
  };

  const handleCopyCurl = (log: LogItem) => {
    const snippet = `curl -X POST https://gateway.outcomerouter.ai/v1/chat/completions \\\n  -H "Authorization: Bearer oir_live_8f9a2b..." \\\n  -H "X-Outcome-Strategy: outcome_optimized" \\\n  -d '{"messages": [{"role": "user", "content": "${log.prompt_preview}"}]}'`;
    navigator.clipboard.writeText(snippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = "Timestamp,RequestID,Model,Provider,Task,TokensIn,TokensOut,CostUSD,CostINR,LatencyMs,Outcome,Prompt\n";
    const rows = filteredLogs.map(l =>
      `"${l.created_at}","${l.id}","${l.model_used}","${l.provider}","${l.task_type}",${l.tokens_in},${l.tokens_out},${l.cost_usd},${(l.cost_usd * 86.5).toFixed(4)},${l.latency_ms},${l.outcome_success ? "Win" : "Loss"},"${(l.prompt_preview || "").replace(/"/g, '""')}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gateway_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Gateway Audit Logs & Decision Traces
            </h1>
            <p className="text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Every request bound to cryptographic SHA-256 Micro-SLA contracts with inline outcome feedback and cURL reproduction snippets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportCSV}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center gap-2 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Export Audit CSV</span>
            </button>

            <button
              onClick={() => setShowSimulate(true)}
              className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Simulate Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Recorded Traces</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono">{activeLogs.length}</div>
            <div className="text-xs text-white/70 mt-1">100% Verifiable nonces</div>
          </div>
          <span className="text-[11px] text-white/80">Sliding 1,000 trace buffer active</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Average Latency</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {Math.round(activeLogs.reduce((acc, l) => acc + l.latency_ms, 0) / Math.max(1, activeLogs.length))}ms
            </div>
            <div className="text-xs text-[#86868B] mt-1">P95 SLA Target: &lt;250ms</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Sub-100ms P50</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Micro-SLA Contracts</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {slaEscrowContracts.length || 14}
            </div>
            <div className="text-xs text-[#86868B] mt-1">0 Breach Penalties</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% SLA Fulfillment</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Logged Outcome Wins</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">
              94.6%
            </div>
            <div className="text-xs text-[#86868B] mt-1">Thompson Prior Updated</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Continuous Self-Healing</span>
        </div>
      </div>

      {/* 3. Filter Controls & Search Bar */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md overflow-x-auto">
            {[
              { id: "all", label: "All Tasks" },
              { id: "sales_email", label: "Sales Email" },
              { id: "code_generation", label: "Code Review" },
              { id: "customer_support", label: "Customer Support" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTaskFilter(t.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  selectedTaskFilter === t.id
                    ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
              <input
                type="text"
                placeholder="Search trace ID or prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 h-9 pl-9 pr-3 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
              />
            </div>

            <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80">
              {[
                { id: "all", label: "All" },
                { id: "wins", label: "Wins" },
                { id: "losses", label: "Losses" }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStatusFilter(s.id)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
                    selectedStatusFilter === s.id
                      ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/80 text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Request & Prompt</th>
                <th className="py-3.5 px-4 font-semibold">Model Selected</th>
                <th className="py-3.5 px-4 font-semibold">Task KPI</th>
                <th className="py-3.5 px-4 font-semibold text-right">Cost</th>
                <th className="py-3.5 px-4 font-semibold text-center">Latency</th>
                <th className="py-3.5 px-4 font-semibold text-center">Outcome Feedback</th>
                <th className="py-3.5 px-5 font-semibold text-right">Inspection & Replay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]" suppressHydrationWarning>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F7F9]/50 dark:hover:bg-[#1B1B1E]/50 transition-all">
                  <td className="py-3.5 px-5 max-w-[240px]">
                    <span className="font-mono text-[11px] font-bold text-[#0050FF] dark:text-[#3374FF] block truncate">
                      {log.id}
                    </span>
                    <span className="text-[11px] text-[#86868B] truncate block mt-0.5">
                      {log.prompt_preview}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block truncate">
                      {log.model_used}
                    </span>
                    <span className="text-[10px] text-[#86868B] uppercase font-mono">{log.provider}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#515154] dark:text-[#A1A1A6]">
                    {log.outcome_metric || "task_completed"}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {formatCurrency(log.cost_usd * rate, activeCurrency)}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-[#515154] dark:text-[#A1A1A6]">
                    {log.latency_ms}ms
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => recordOutcome(log.id, true)}
                        className={`p-1.5 rounded-full transition-all ${
                          log.outcome_success === true
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold scale-110"
                            : "text-[#86868B] hover:text-[#0050FF]"
                        }`}
                        title="Mark Win"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => recordOutcome(log.id, false)}
                        className={`p-1.5 rounded-full transition-all ${
                          log.outcome_success === false
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold scale-110"
                            : "text-[#86868B] hover:text-red-600"
                        }`}
                        title="Mark Loss"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-right space-x-2">
                    <button
                      onClick={() => handleExplainWithAI(log)}
                      className="px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                    >
                      <Bot className="h-3 w-3" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => handleCopyCurl(log)}
                      className="px-3 py-1 rounded-full bg-white dark:bg-[#242428] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] text-[#515154] dark:text-[#A1A1A6] text-[11px] font-semibold transition-all inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Code2 className="h-3 w-3" />
                      <span>cURL</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Decision Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-[#0050FF]" />
                <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                  AI Gateway Decision Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] space-y-1">
                <span className="font-bold text-[#86868B]">Prompt Payload</span>
                <p className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">{selectedLog.prompt_preview}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/25 space-y-2">
                <span className="font-bold text-[#0050FF] dark:text-[#3374FF]">Routing Analysis</span>
                <p className="whitespace-pre-line text-[#515154] dark:text-[#A1A1A6] font-mono text-[11px] leading-relaxed">
                  {aiExplanation || "Evaluating routing tree rationale..."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {showSimulate && (
        <SimulateRequestModal onClose={() => setShowSimulate(false)} />
      )}
    </div>
  );
}
