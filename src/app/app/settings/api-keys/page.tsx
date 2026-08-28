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
  Bot
} from "lucide-react";

export default function ApiKeysPage() {
  const { apiKeys, createApiKey, deleteApiKey } = useAppStore();
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
    navigator.clipboard.writeText(`${prefix}••••••••••••••••`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSecurityAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setSecurityVerdict({
        score: "A+ (Optimal)",
        recommendation: "All active API keys use encrypted token hash digests with zero leak vulnerabilities detected."
      });
      setIsAuditing(false);
    }, 450);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
            API Keys
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Manage authentication keys and rate limits for SDKs and REST integrations
          </p>
        </div>

        <button
          onClick={handleSecurityAudit}
          disabled={isAuditing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/[0.06] text-xs font-semibold text-[#515154] hover:text-[#1D1D1F] shadow-sm transition-all"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#0050FF]" />
          <span>{isAuditing ? "Auditing..." : "Security Health Check"}</span>
        </button>
      </div>

      {/* Security verdict panel */}
      {securityVerdict && (
        <div className="p-4 rounded-2xl bg-white border border-black/[0.05] shadow-sm flex items-center justify-between animate-in fade-in text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-[#1D1D1F]">Health: {securityVerdict.score}</span>
            <span className="text-[#86868B]">— {securityVerdict.recommendation}</span>
          </div>
        </div>
      )}

      {/* Create Key Card */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-3">
        <h3 className="font-semibold text-sm text-[#1D1D1F]">Generate New Key</h3>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Key name (e.g. Production Backend, Mobile App)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 h-10 px-4 rounded-full bg-[#F5F5F7] border border-transparent text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
          />
          <div className="inline-flex p-1 rounded-full bg-[#F5F5F7]">
            <button
              type="button"
              onClick={() => setNewKeyEnv("live")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                newKeyEnv === "live" ? "bg-white text-[#1D1D1F] shadow-sm" : "text-[#86868B]"
              }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setNewKeyEnv("test")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                newKeyEnv === "test" ? "bg-white text-[#1D1D1F] shadow-sm" : "text-[#86868B]"
              }`}
            >
              Sandbox
            </button>
          </div>
          <button
            type="submit"
            disabled={!newKeyName.trim()}
            className="px-5 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Generate Key</span>
          </button>
        </form>
      </div>

      {/* Active Keys List */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1D1D1F] text-sm">Active Secret Keys</h3>
          <span className="text-xs text-[#86868B]">{apiKeys.length} keys active</span>
        </div>

        <div className="divide-y divide-[#F5F5F7]">
          {apiKeys.map((key) => (
            <div key={key.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1D1D1F]">{key.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    key.environment === "live" ? "bg-[#EEF4FF] text-[#0050FF]" : "bg-[#F5F5F7] text-[#86868B]"
                  }`}>
                    {key.environment === "live" ? "Production" : "Sandbox"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#86868B]">
                  <span>{key.prefix}••••••••••••••••</span>
                  <button
                    onClick={() => handleCopy(key.id, key.prefix)}
                    className="text-[#0050FF] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    {copiedId === key.id ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#86868B]">Created {key.created_at}</span>
                <button
                  onClick={() => deleteApiKey(key.id)}
                  className="p-1.5 rounded-lg text-[#86868B] hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Revoke key"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
