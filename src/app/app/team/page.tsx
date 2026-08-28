"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  Shield,
  Bot,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Lock,
  UserCheck,
  Sparkles,
  Zap,
  ChevronRight
} from "lucide-react";

export default function TeamPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [members, setMembers] = useState([
    { id: 1, name: "Alex Vance", email: "alex@company.com", role: "Owner", tokenQuota: "Unlimited", mfaActive: true, lastActive: "Just now" },
    { id: 2, name: "Sarah Chen", email: "sarah@company.com", role: "Admin", tokenQuota: "200,000 / mo", mfaActive: true, lastActive: "15 min ago" },
    { id: 3, name: "Marcus Rossi", email: "marcus@company.com", role: "Engineer", tokenQuota: "100,000 / mo", mfaActive: true, lastActive: "1 hour ago" },
    { id: 4, name: "Priya Patel", email: "priya@company.com", role: "FinOps", tokenQuota: "50,000 / mo", mfaActive: false, lastActive: "Yesterday" }
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Engineer");
  const [inviteNotice, setInviteNotice] = useState(false);

  const [isAuditing, setIsAuditing] = useState(false);
  const [rbacResult, setRbacResult] = useState<any>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
        tokenQuota: inviteRole === "Admin" ? "200,000 / mo" : "50,000 / mo",
        mfaActive: true,
        lastActive: "Invited"
      }
    ]);
    setInviteEmail("");
    setInviteNotice(true);
    setTimeout(() => setInviteNotice(false), 3000);
  };

  const handleRoleChange = (id: number, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
  };

  const handleRemoveMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAuditRBAC = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setRbacResult({
        recommendation: "Least-Privilege Security Check: 3 of 4 team members have active MFA Passkeys. Zero permission leaks detected across API key generation scopes."
      });
      setIsAuditing(false);
    }, 450);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Team Members & Role-Based Access Control
            </h1>
            <p className="text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Manage organization workspace seats, enforce MFA security policies, and allocate per-developer monthly token quotas.
            </p>
          </div>

          <button
            onClick={handleAuditRBAC}
            disabled={isAuditing}
            className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start lg:self-auto shrink-0"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{isAuditing ? "Auditing RBAC..." : "Audit RBAC Scopes"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Active Workspace Seats</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono">{members.length} / 10</div>
            <div className="text-xs text-white/70 mt-1">Unlimited invite allowance</div>
          </div>
          <span className="text-[11px] text-white/80">Pro Tier Allocation</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">MFA Passkey Enforce</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">75% Enrolled</div>
            <div className="text-xs text-[#86868B] mt-1">FIDO2 / WebAuthn Active</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Zero password vulnerabilities</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Role Permissions</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">Least-Privilege</div>
            <div className="text-xs text-[#86868B] mt-1">Granular API Scopes</div>
          </div>
          <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-semibold">Per-seat token budgets</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Audit Trail Status</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">100% Logged</div>
            <div className="text-xs text-[#86868B] mt-1">Immutable session telemetry</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">SOC-2 Type II Compliant</span>
        </div>
      </div>

      {/* RBAC Result Drawer */}
      {rbacResult && (
        <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-2 animate-in fade-in" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>RBAC Security Audit Report</span>
            </h3>
            <button onClick={() => setRbacResult(null)} className="text-xs text-[#86868B] hover:text-[#1D1D1F]">Dismiss</button>
          </div>
          <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{rbacResult.recommendation}</p>
        </div>
      )}

      {/* 3. Invite Member Card */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <div>
          <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Invite Team Member to Organization
          </h3>
          <p className="text-xs text-[#86868B]">
            Invited users will receive an email link to join with pre-assigned RBAC scopes
          </p>
        </div>

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 h-11 px-5 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none"
            required
          />

          <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80">
            {["Engineer", "FinOps", "Admin"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setInviteRole(r)}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all ${
                  inviteRole === r
                    ? "bg-[#0050FF] text-white shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!inviteEmail.trim()}
            className="px-7 h-11 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Send Invitation</span>
          </button>
        </form>

        {inviteNotice && (
          <span className="text-xs text-emerald-600 font-semibold animate-in fade-in block">
            ✓ Invitation email sent successfully!
          </span>
        )}
      </div>

      {/* 4. Team Members Table */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          Active Members ({members.length})
        </h3>

        <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/80 text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Member</th>
                <th className="py-3.5 px-4 font-semibold">RBAC Role</th>
                <th className="py-3.5 px-4 font-semibold">Token Quota</th>
                <th className="py-3.5 px-4 font-semibold text-center">MFA Status</th>
                <th className="py-3.5 px-4 font-semibold">Last Active</th>
                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]" suppressHydrationWarning>
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-[#F7F7F9]/50 dark:hover:bg-[#1B1B1E]/50 transition-all">
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] block">{m.name}</span>
                    <span className="text-[11px] text-[#86868B]">{m.email}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      disabled={m.role === "Owner"}
                      className="px-3 py-1 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none disabled:opacity-60"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Admin">Admin</option>
                      <option value="Engineer">Engineer</option>
                      <option value="FinOps">FinOps</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#515154] dark:text-[#A1A1A6]">
                    {m.tokenQuota}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      m.mfaActive
                        ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                    }`}>
                      {m.mfaActive ? "MFA ENABLED" : "OPTIONAL"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-[#86868B] font-mono text-[11px]">
                    {m.lastActive}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    {m.role !== "Owner" && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-[#86868B] hover:text-red-600 transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
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
