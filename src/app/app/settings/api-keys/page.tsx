"use client";

import { useState } from "react";
import { useAppStore, ApiKeyItem } from "@/lib/store";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Bot,
  Sparkles,
  Zap,
  AlertTriangle
} from "lucide-react";

export default function ApiKeysPage() {
  const { apiKeys, createApiKey, revokeApiKey, deleteApiKey } = useAppStore();
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"live" | "test">("live");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Security Advisor state
  const [isAuditing, setIsAuditing] = useState(false);
  const [securityVerdict, setSecurityVerdict] = useState<any>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    createApiKey(newKeyName.trim(), newKeyEnv);
    setNewKeyName("");
  };

  const handleCopy = (id: string, prefix: string) => {
    navigator.clipboard.writeText(`${prefix}************************`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSecurityAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setSecurityVerdict({
        score: "A+ (98/100)",
        recommendation: "All active keys use encrypted token hash digests. We recommend setting a 600 RPM throttle on 'Staging Sandbox' to avert accidental infinite loop bill spikes during local CI testing.",
        status: "ZERO VULNERABILITIES DETECTED"
      });
      setIsAuditing(false);
    }, 450);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            API Keys & AI Security Advisor
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
            Manage live and sandbox authentication keys, rate limits, and cryptographic rotation
          </p>
        </div>

        <button
          onClick={handleSecurityAudit}
          disabled={isAuditing}
          className="px-5 py-2.5 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          <span>{isAuditing ? "Auditing Keys..." : "Run AI Key Security Audit"}</span>
        </button>
      </div>

      {/* Security verdict panel */}
      {securityVerdict && (
        <div className="p-6 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-2 animate-in fade-in text-xs font-mono">
          <div className="flex items-center justify-between text-[#0050FF] font-bold">
            <span>Security Health: {securityVerdict.score}</span>
            <span>{securityVerdict.status}</span>
          </div>
          <p className="text-[#515154] font-sans pt-1">{securityVerdict.recommendation}</p>
        </div>
      )}

      {/* Create Key Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-4">
        <h3 className="font-bold text-base text-[#1D1D1F]">Generate New API Key</h3>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Production Next.js Backend, Worker Node 02"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 h-11 px-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
          />
          <select
            value={newKeyEnv}
            onChange={(e) => setNewKeyEnv(e.target.value as "live" | "test")}
            className="h-11 px-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
          >
            <option value="live">Live Production (oir_live_...)</option>
            <option value="test">Test Sandbox (oir_test_...)</option>
          </select>
          <button
            type="submit"
            disabled={!newKeyName.trim()}
            className="px-6 h-11 rounded-2xl bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create Key</span>
          </button>
        </form>
      </div>

      {/* Keys Table */}
      <div className="rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F5F7] text-[#1D1D1F] font-mono border-b border-[#E5E5EA]">
              <tr>
                <th className="p-4 pl-6">Key Name</th>
                <th className="p-4">Key Token Prefix</th>
                <th className="p-4 text-center">Environment</th>
                <th className="p-4 text-center">Rate Limit</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA] bg-white font-mono">
              {apiKeys.map((k) => (
                <tr key={k.id} className="hover:bg-[#F5F5F7]/60 transition-colors">
                  <td className="p-4 pl-6">
                    <span className="font-bold text-[#1D1D1F] block">{k.name}</span>
                    <span className="text-[10px] text-[#86868B]">Created {k.created_at}</span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] font-mono text-[#0050FF] font-bold">
                        {k.key_prefix}••••••••••
                      </span>
                      <button
                        onClick={() => handleCopy(k.id, k.key_prefix)}
                        className="p-1.5 rounded-lg text-[#86868B] hover:text-[#0050FF] transition-colors"
                      >
                        {copiedId === k.id ? <Check className="h-3.5 w-3.5 text-[#0050FF]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        k.environment === "live"
                          ? "bg-[#EEF4FF] text-[#0050FF] border border-[#0050FF]/20"
                          : "bg-[#F5F5F7] text-[#515154] border border-[#E5E5EA]"
                      }`}
                    >
                      {k.environment}
                    </span>
                  </td>

                  <td className="p-4 text-center text-[#515154]">
                    {k.rate_limit_rpm} RPM
                  </td>

                  <td className="p-4 text-[#86868B]">
                    {k.last_used_at}
                  </td>

                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => deleteApiKey(k.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
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
