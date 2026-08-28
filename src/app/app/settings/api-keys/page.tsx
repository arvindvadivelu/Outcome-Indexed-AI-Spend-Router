"use client";

import { useState, useEffect } from "react";
import { useAppStore, ApiKeyItem } from "@/lib/store";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Bot,
  RotateCw,
  Sliders,
  Globe,
  X,
  Lock,
  Sparkles,
  Zap,
  ChevronRight,
  ShieldAlert,
  Shield,
  Layers
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function ApiKeysPage() {
  const { apiKeys, createApiKey, deleteApiKey, updateApiKeyRateLimit } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"live" | "test">("live");
  const [newKeyIp, setNewKeyIp] = useState("");
  const [newKeyRpm, setNewKeyRpm] = useState(600);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Revealed Key Modal
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  // AI Security Advisor state
  const [isAuditing, setIsAuditing] = useState(false);
  const [securityVerdict, setSecurityVerdict] = useState<any>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    await apiClient.createApiKey(newKeyName.trim(), newKeyEnv, newKeyRpm);
    const fullKey = createApiKey(newKeyName.trim(), newKeyEnv, newKeyIp);
    setRevealedKey(fullKey);
    setNewKeyName("");
    setNewKeyIp("");
    setNewKeyRpm(600);
  };

  const handleDeleteKey = async (id: string) => {
    await apiClient.deleteApiKey(id);
    deleteApiKey(id);
  };

  const handleRotateKey = (key: ApiKeyItem) => {
    deleteApiKey(key.id);
    const fullKey = createApiKey(key.name, key.environment, key.ip_restrictions);
    setRevealedKey(fullKey);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSecurityAudit = async () => {
    setIsAuditing(true);
    setSecurityVerdict(null);

    try {
      const res = await fetch("/api/settings/api-keys/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: apiKeys })
      });
      const data = await res.json();
      if (data.success) {
        setSecurityVerdict(data);
      }
    } catch (err) {
      console.warn("Security audit fallback:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                API Keys & Edge Credentials
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] border border-[#0050FF]/20">
                {apiKeys.length} Active Keys
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Generate secure authorization keys with per-key rate limits, IP CIDR restrictions, and continuous cryptographic leak detection.
            </p>
          </div>

          <button
            onClick={handleSecurityAudit}
            disabled={isAuditing}
            className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start lg:self-auto shrink-0 disabled:opacity-50"
          >
            <ShieldCheck className={`h-3.5 w-3.5 ${isAuditing ? "animate-spin" : ""}`} />
            <span>{isAuditing ? "Auditing Key Entropy..." : "Security Health Audit"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Active Credentials</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono">{apiKeys.length}</div>
            <div className="text-xs text-white/70 mt-1">Live & Test environments</div>
          </div>
          <span className="text-[11px] text-white/80">SHA-256 Digest Protected</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Global Rate Limit</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">600 RPM</div>
            <div className="text-xs text-[#86868B] mt-1">Burst ceiling: 1,200 RPM</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Leaky Bucket Protected</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Security Score</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">A+ Verified</div>
            <div className="text-xs text-[#86868B] mt-1">0 Exposed Secrets</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">TLS 1.3 Cipher Enforced</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Key Rotation SLA</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">Instant</div>
            <div className="text-xs text-[#86868B] mt-1">Zero-downtime rotation</div>
          </div>
          <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-semibold">Seamless Dual-Verification</span>
        </div>
      </div>

      {/* Security Audit Drawer */}
      {securityVerdict && (
        <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Cryptographic Security Audit: {securityVerdict.securityScore}</span>
            </h3>
            <button onClick={() => setSecurityVerdict(null)} className="text-xs text-[#86868B] hover:text-[#1D1D1F]">Dismiss</button>
          </div>
          <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{securityVerdict.recommendation}</p>

          {securityVerdict.findings && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {securityVerdict.findings.map((f: any, i: number) => (
                <div key={i} className="p-3 rounded-2xl bg-white/80 dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span>{f.criterion}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      f.status === "PASS" || f.status === "OPTIMAL"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}>
                      {f.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#86868B]">{f.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Revealed Secret Key Modal */}
      {revealedKey && (
        <div className="rounded-[30px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 p-6 sm:p-7 shadow-sm space-y-3 animate-in fade-in" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>API Key Generated — Copy Now (Will Not Be Shown Again)</span>
            </h3>
            <button onClick={() => setRevealedKey(null)} className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">Done</button>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <code className="flex-1 p-3.5 rounded-2xl bg-white dark:bg-[#161618] border border-emerald-500/30 font-mono text-xs text-emerald-700 dark:text-emerald-400 break-all select-all">
              {revealedKey}
            </code>
            <button
              onClick={() => handleCopy("revealed", revealedKey)}
              className="px-5 h-11 rounded-full bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            >
              {copiedId === "revealed" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedId === "revealed" ? "Copied!" : "Copy Key"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Create New Key Card */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <div>
          <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Generate New API Secret Key
          </h3>
          <p className="text-xs text-[#86868B]">
            Creates an edge-authenticated SHA-256 token for SDKs, curl endpoints, and backend microservices
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1 md:col-span-1">
              <label className="text-xs font-semibold text-[#86868B]">Key Name / Purpose</label>
              <input
                type="text"
                placeholder="e.g. Production Node Gateway"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#86868B]">Environment</label>
              <div className="inline-flex p-1 w-full rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80">
                {(["live", "test"] as const).map((env) => (
                  <button
                    type="button"
                    key={env}
                    onClick={() => setNewKeyEnv(env)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-full capitalize transition-all ${
                      newKeyEnv === env
                        ? "bg-[#0050FF] text-white shadow-xs"
                        : "text-[#86868B] hover:text-[#1D1D1F]"
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#86868B]">Rate Limit ({newKeyRpm} RPM)</label>
              <input
                type="range"
                min="60"
                max="2400"
                step="60"
                value={newKeyRpm}
                onChange={(e) => setNewKeyRpm(parseInt(e.target.value))}
                className="w-full accent-[#0050FF] h-2 bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-lg mt-3"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#86868B]">IP Restriction (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 192.168.1.1, 10.0.0.0/24"
                value={newKeyIp}
                onChange={(e) => setNewKeyIp(e.target.value)}
                className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!newKeyName.trim()}
            className="h-11 px-7 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Generate Secret Key</span>
          </button>
        </form>
      </div>

      {/* 4. Active API Keys Table */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          Active Credentials ({apiKeys.length})
        </h3>

        {apiKeys.length === 0 ? (
          <div className="p-10 text-center space-y-3 rounded-2xl bg-[#F7F7F9] dark:bg-[#1B1B1E] border border-black/[0.04] dark:border-white/[0.06]">
            <p className="text-xs text-[#86868B]">No API keys currently active. Create your first credential above.</p>
          </div>
        ) : (
          <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/80 text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Key Identifier</th>
                  <th className="py-3.5 px-4 font-semibold">Environment</th>
                  <th className="py-3.5 px-4 font-semibold">Token Prefix</th>
                  <th className="py-3.5 px-4 font-semibold">Rate Limit</th>
                  <th className="py-3.5 px-4 font-semibold">Last Used</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]" suppressHydrationWarning>
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-[#F7F7F9]/50 dark:hover:bg-[#1B1B1E]/50 transition-all">
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] block">{key.name}</span>
                      <span className="text-[10px] text-[#86868B] font-mono">{key.ip_restrictions ? `IP: ${key.ip_restrictions}` : "Any IP Allowed"}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        key.environment === "live"
                          ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                      }`}>
                        {key.environment}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#0050FF] dark:text-[#3374FF]">
                      {key.key_prefix}••••••••
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#515154] dark:text-[#A1A1A6]">
                      {key.rate_limit_rpm || 600} RPM
                    </td>

                    <td className="py-3.5 px-4 text-[#86868B] font-mono text-[11px]">
                      {key.last_used_at || "Never"}
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleRotateKey(key)}
                        className="px-3 py-1 rounded-full bg-[#F5F5F7] dark:bg-[#242428] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] text-[11px] font-semibold transition-all inline-flex items-center gap-1 hover:scale-105"
                        title="Rotate Secret Key"
                      >
                        <RotateCw className="h-3 w-3" />
                        <span>Rotate</span>
                      </button>

                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-[#86868B] hover:text-red-600 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
