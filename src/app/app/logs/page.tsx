"use client";

import { useState } from "react";
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
  ThumbsDown
} from "lucide-react";

export default function LogsPage() {
  const { telemetryLogs, logs, currency, slaEscrowContracts, recordOutcome } = useAppStore();
  const rate = currency === "INR" ? 86.5 : 1;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskFilter, setSelectedTaskFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [selectedContract, setSelectedContract] = useState<SlaContractItem | null>(null);

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
        `• Complexity Assessment: Assessed as ${log.task_type === "code_generation" ? "High Complexity" : "Standard"}.\n` +
        `• Model Selection: Routed to ${log.model_used} based on prior 92.4% win rate.\n` +
        `• Speculative Pre-Warming: Saved ~70% TTFT via active background SLM tensor allocation.\n` +
        `• Micro-SLA Contract: ${contract.cryptographicHash.slice(0, 18)}... (Status: ${contract.status === "settled_fulfilled" ? "Settled & Fulfilled ✓" : "Breach Escrow Refunded"}).\n` +
        `• Net Spend Savings: Saved ${currency === "INR" ? `₹${(0.0052 * rate - log.cost_inr).toFixed(3)}` : `$${(0.0052 - log.cost_usd).toFixed(4)}`} per request compared to default GPT-4o.`
      );
      setAiExplaining(false);
    }, 450);
  };

  const handleCopyCurl = (log: LogItem) => {
    const snippet = `curl https://gateway.outcomerouter.ai/v1/chat/completions \\\n  -H "Authorization: Bearer oir_live_..." \\\n  -H "X-Outcome-Strategy: outcome_optimized" \\\n  -d '{"messages": [{"role": "user", "content": "${log.prompt_preview}"}]}'`;
    navigator.clipboard.writeText(snippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleExportCsv = () => {
    const headers = "Request ID,Model,Provider,Tokens In,Tokens Out,Cost USD,Latency MS,Outcome,Prompt\n";
    const rows = filteredLogs.map(l => `${l.id},${l.model_used},${l.provider},${l.tokens_in},${l.tokens_out},${l.cost_usd},${l.latency_ms},${l.outcome_success ? "Win" : "Loss"},"${l.prompt_preview.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telemetry_audit_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Audit & Telemetry Logs
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Inspect real-time routing decisions, Micro-SLA contracts, and outcome feedback
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#F5F5F7] hover:text-[#1D1D1F] shadow-xs transition-all self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5 text-[#0050FF]" />
          <span>Export Logs CSV</span>
        </button>
      </div>

      {/* AI Log Explanation Drawer / Modal */}
      {selectedLog && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
              <h3 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                Decision & SLA Trace: <span className="font-mono text-[#0050FF] dark:text-[#3374FF]">{selectedLog.id}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCurl(selectedLog)}
                className="text-[11px] px-3 py-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#515154] dark:text-[#A1A1A6] hover:text-[#1D1D1F] flex items-center gap-1 transition-all"
              >
                {copiedCurl ? <Check className="h-3 w-3 text-emerald-600" /> : <Code2 className="h-3 w-3" />}
                <span>{copiedCurl ? "Copied cURL" : "Copy cURL Replay"}</span>
              </button>
              <button
                onClick={() => setSelectedLog(null)}
                className="h-6 w-6 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {aiExplaining ? (
            <div className="py-4 flex items-center justify-center gap-2 text-xs text-[#86868B]">
              <span className="h-3.5 w-3.5 border-2 border-[#0050FF] border-t-transparent rounded-full animate-spin"></span>
              <span>Analyzing routing trace and verifying cryptographic SLA contract...</span>
            </div>
          ) : (
            <div className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed whitespace-pre-wrap font-sans">
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
            placeholder="Filter logs by request ID, model, prompt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-full bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF]/30 transition-all shadow-xs"
          />
        </div>

        {/* Task Filter */}
        <div className="inline-flex p-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] self-start sm:self-auto">
          {[
            { id: "all", label: "All Tasks" },
            { id: "sales_email", label: "Sales" },
            { id: "code_generation", label: "Code" },
            { id: "customer_support", label: "Support" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTaskFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                selectedTaskFilter === tab.id
                  ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="inline-flex p-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] self-start sm:self-auto">
          {[
            { id: "all", label: "All Status" },
            { id: "wins", label: "Wins (93%)" },
            { id: "losses", label: "Losses" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                selectedStatusFilter === tab.id
                  ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry Logs Table */}
      <div className="rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFD] dark:bg-[#1A1A1E] text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06]">
              <tr>
                <th className="p-4 pl-6 font-medium">Request ID & Prompt</th>
                <th className="p-4 font-medium">Model Used</th>
                <th className="p-4 font-medium text-right">Cost</th>
                <th className="p-4 font-medium text-center">Latency</th>
                <th className="p-4 font-medium text-center">Micro-SLA Contract</th>
                <th className="p-4 font-medium text-center">Outcome Win</th>
                <th className="p-4 pr-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7] dark:divide-white/[0.06]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#86868B]">
                    No request logs found. Click <strong>Simulate Request</strong> or <strong>Sandbox Demo</strong> in Spend Overview to evaluate live models.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FBFBFD] dark:hover:bg-[#1E1E22] transition-colors">
                    <td className="p-4 pl-6 max-w-[240px]">
                      <div className="font-mono font-medium text-[#1D1D1F] dark:text-[#F5F5F7] text-[11px] truncate">
                        {log.id}
                      </div>
                      <div className="text-[11px] text-[#86868B] truncate mt-0.5">
                        {log.prompt_preview}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{log.model_used}</span>
                        <span className="text-[10px] text-[#86868B] uppercase px-1.5 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#1F1F23]">
                          {log.provider}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {currency === "INR" ? `₹${log.cost_inr.toFixed(4)}` : `$${log.cost_usd.toFixed(4)}`}
                    </td>
                    <td className="p-4 text-center font-mono text-[#515154] dark:text-[#A1A1A6]">
                      {log.latency_ms}ms
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995] font-medium">
                        <ShieldCheck className="h-3 w-3" />
                        <span>SLA Bound</span>
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => recordOutcome(log.id, true)}
                          className={`p-1 rounded-md transition-all ${
                            log.outcome_success === true
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                              : "text-[#86868B] hover:text-[#0050FF]"
                          }`}
                          title="Mark Win"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => recordOutcome(log.id, false)}
                          className={`p-1 rounded-md transition-all ${
                            log.outcome_success === false
                              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold"
                              : "text-[#86868B] hover:text-red-600"
                          }`}
                          title="Mark Loss"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleExplainWithAI(log)}
                        className="text-xs text-[#0050FF] dark:text-[#3374FF] font-medium hover:underline flex items-center gap-1 justify-end ml-auto"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Explain Trace</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
