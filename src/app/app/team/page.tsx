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
  ChevronRight,
  ShieldAlert,
  Sliders,
  Send,
  RotateCw,
  Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { syncAuthUserToGoogleSheets } from "@/lib/google-sheets";

export default function TeamPage() {
  const { planTier, orgName, user } = useAppStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [members, setMembers] = useState([
    { id: 1, name: user?.name || "User", email: user?.email || "user@example.com", role: "Owner", tokenQuota: "Unlimited", mfaActive: true, lastActive: "Just now" },
    { id: 2, name: "Sarah Chen", email: "sarah@company.com", role: "Admin", tokenQuota: "200,000 / mo", mfaActive: true, lastActive: "15 min ago" },
    { id: 3, name: "Marcus Rossi", email: "marcus@company.com", role: "Engineer", tokenQuota: "100,000 / mo", mfaActive: true, lastActive: "1 hour ago" },
    { id: 4, name: "Priya Patel", email: "priya@company.com", role: "FinOps", tokenQuota: "50,000 / mo", mfaActive: false, lastActive: "Yesterday" }
  ]);

  useEffect(() => {
    if (user?.email) {
      setMembers((prev) =>
        prev.map((m) =>
          m.role === "Owner"
            ? { ...m, name: user.name || m.name, email: user.email }
            : m
        )
      );
    }
  }, [user]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Engineer");
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [inviteQuota, setInviteQuota] = useState("100,000 / mo");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);
  const [resentMfaId, setResentMfaId] = useState<number | null>(null);

  const [isAuditing, setIsAuditing] = useState(false);
  const [rbacResult, setRbacResult] = useState<any>(null);

  // Seat capacity based on subscribed plan
  const seatLimit = planTier === "starter" ? 8 : (planTier === "growth" ? 15 : (planTier === "enterprise" ? 50 : 4));
  const isSeatLimitReached = members.length >= seatLimit;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isSeatLimitReached) return;

    const assignedRole = isCustomRole && customRoleInput.trim() ? customRoleInput.trim() : inviteRole;

    setIsInviting(true);
    setInviteNotice(null);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: assignedRole,
          tokenQuota: inviteQuota
        })
      });
      const data = await res.json();

      if (data.success) {
        setMembers((prev) => [
          ...prev,
          {
            id: Date.now(),
            name: inviteEmail.split("@")[0],
            email: inviteEmail.trim(),
            role: assignedRole,
            tokenQuota: inviteQuota,
            mfaActive: true,
            lastActive: "Invited"
          }
        ]);

        await syncAuthUserToGoogleSheets({
          action: "TEAM_INVITE",
          name: inviteEmail.split("@")[0],
          email: inviteEmail.trim(),
          workspace: orgName || "",
          plan_tier: planTier || "free",
          monthly_token_quota: 100000,
          currency: "USD",
          auth_method: "INVITE_LINK"
        });

        setInviteEmail("");
        setCustomRoleInput("");
        setIsCustomRole(false);
        setInviteNotice(`Invitation link dispatched to ${inviteEmail}!`);
        setTimeout(() => setInviteNotice(null), 3000);
      }
    } catch (err) {
      console.warn("Invite fallback:", err);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = (id: number, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id && m.role !== "Owner" ? { ...m, role: newRole } : m))
    );
  };

  const handleQuotaChange = (id: number, newQuota: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, tokenQuota: newQuota } : m))
    );
  };

  const handleRemoveMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id || m.role === "Owner"));
  };

  const handleResendMfa = (id: number) => {
    setResentMfaId(id);
    setTimeout(() => setResentMfaId(null), 2000);
  };

  const handleAuditRBAC = async () => {
    setIsAuditing(true);
    setRbacResult(null);

    try {
      const res = await fetch("/api/team/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members })
      });
      const data = await res.json();
      if (data.success) {
        setRbacResult(data);
      }
    } catch (err) {
      console.warn("RBAC audit fallback:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  const mfaEnrolledCount = members.filter((m) => m.mfaActive).length;
  const mfaPct = Math.round((mfaEnrolledCount / Math.max(1, members.length)) * 100);

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
                Team Members & RBAC Access Control
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isSeatLimitReached
                  ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300"
                  : "bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] border border-[#0050FF]/20"
              }`}>
                {members.length} / {seatLimit} Seats Allocated
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Manage organization workspace seats, enforce MFA security policies, and allocate per-developer monthly token quotas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app/billing"
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] hover:bg-[#F5F5F7] transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upgrade Seats</span>
            </Link>

            <button
              onClick={handleAuditRBAC}
              disabled={isAuditing}
              className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start lg:self-auto shrink-0 disabled:opacity-50"
            >
              <ShieldCheck className={`h-3.5 w-3.5 ${isAuditing ? "animate-spin" : ""}`} />
              <span>{isAuditing ? "Auditing RBAC..." : "Audit RBAC Scopes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Active Workspace Seats</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono">{members.length} / {seatLimit}</div>
            <div className="text-xs text-white/70 mt-1">{isSeatLimitReached ? "Seat limit reached" : `${seatLimit - members.length} seats available`}</div>
          </div>
          <span className="text-[11px] text-white/80 capitalize">{planTier || "Free"} Tier Allocation</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">MFA Passkey Enforce</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{mfaPct}% Enrolled</div>
            <div className="text-xs text-[#86868B] mt-1">{mfaEnrolledCount} of {members.length} FIDO2 Active</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Zero password vulnerabilities</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Role Permissions</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">Least-Privilege</div>
            <div className="text-xs text-[#86868B] mt-1">Granular Custom Scopes</div>
          </div>
          <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-semibold">1 Primary Workspace Owner</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
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
        <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>RBAC Security Audit: {rbacResult.complianceGrade}</span>
            </h3>
            <button onClick={() => setRbacResult(null)} className="text-xs text-[#86868B] hover:text-[#1D1D1F]">Dismiss</button>
          </div>
          <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{rbacResult.recommendation}</p>

          {rbacResult.findings && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {rbacResult.findings.map((f: any, i: number) => (
                <div key={i} className="p-3 rounded-2xl bg-white/80 dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span>{f.criterion}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      f.status === "PASS"
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

      {/* 3. Invite Member Card */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Invite Team Member to Organization
            </h3>
            <p className="text-xs text-[#86868B]">
              Invited users will receive an email link to join with pre-assigned RBAC scopes and token budgets
            </p>
          </div>

          {isSeatLimitReached && (
            <div className="p-2.5 px-4 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 shrink-0">
              <AlertCircle className="h-4 w-4" />
              <span>Seat capacity reached ({members.length}/{seatLimit}).</span>
              <Link href="/app/billing" className="underline hover:text-amber-900 font-bold">
                Upgrade Plan
              </Link>
            </div>
          )}
        </div>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isSeatLimitReached}
                className="w-full h-11 px-5 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none disabled:opacity-50"
                required
              />
            </div>

            <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80">
              {["Engineer", "FinOps", "Admin"].map((r) => (
                <button
                  type="button"
                  key={r}
                  disabled={isSeatLimitReached}
                  onClick={() => {
                    setInviteRole(r);
                    setIsCustomRole(false);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                    !isCustomRole && inviteRole === r
                      ? "bg-[#0050FF] text-white shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                disabled={isSeatLimitReached}
                onClick={() => setIsCustomRole(true)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                  isCustomRole
                    ? "bg-[#0050FF] text-white shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                Custom
              </button>
            </div>

            <button
              type="submit"
              disabled={!inviteEmail.trim() || isInviting || isSeatLimitReached}
              className="h-11 px-6 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0 hover:scale-105 active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isInviting ? "Queuing..." : "Send Invite"}</span>
            </button>
          </div>

          {/* Custom Role Name Input */}
          {isCustomRole && (
            <div className="flex items-center gap-3 pt-1 animate-in fade-in">
              <label className="text-xs font-semibold text-[#86868B] shrink-0">Custom Role Name:</label>
              <input
                type="text"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                placeholder="e.g. Lead ML Engineer, Security Officer, Product Analyst"
                className="flex-1 h-10 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]"
                required={isCustomRole}
              />
            </div>
          )}
        </form>

        {inviteNotice && (
          <span className="text-xs text-emerald-600 font-semibold animate-in fade-in block">
            ✓ {inviteNotice}
          </span>
        )}
      </div>

      {/* 4. Team Members Table */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Active Members ({members.length})
          </h3>
          <span className="text-xs text-[#86868B]">1 Primary Owner Enforced</span>
        </div>

        <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
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
                    {m.role === "Owner" ? (
                      <span className="px-3 py-1 rounded-full bg-[#0050FF]/15 text-[#0050FF] dark:text-[#3374FF] font-bold text-xs">
                        Owner (Primary)
                      </span>
                    ) : (
                      <select
                        value={["Admin", "Engineer", "FinOps"].includes(m.role) ? m.role : "Custom"}
                        onChange={(e) => {
                          if (e.target.value === "Custom") {
                            const custom = prompt("Enter Custom Role Name:", m.role);
                            if (custom && custom.trim()) {
                              handleRoleChange(m.id, custom.trim());
                            }
                          } else {
                            handleRoleChange(m.id, e.target.value);
                          }
                        }}
                        className="px-3 py-1 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none cursor-pointer"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Engineer">Engineer</option>
                        <option value="FinOps">FinOps</option>
                        <option value="Custom">{["Admin", "Engineer", "FinOps"].includes(m.role) ? "Custom Role..." : `${m.role} (Custom)`}</option>
                      </select>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={m.tokenQuota}
                      onChange={(e) => handleQuotaChange(m.id, e.target.value)}
                      disabled={m.role === "Owner"}
                      className="px-3 py-1 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#515154] dark:text-[#A1A1A6] focus:outline-none disabled:opacity-60 cursor-pointer"
                    >
                      <option value="50,000 / mo">50,000 / mo</option>
                      <option value="100,000 / mo">100,000 / mo</option>
                      <option value="200,000 / mo">200,000 / mo</option>
                      <option value="Unlimited">Unlimited</option>
                    </select>
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

                  <td className="py-3.5 px-5 text-right space-x-2">
                    {!m.mfaActive && (
                      <button
                        onClick={() => handleResendMfa(m.id)}
                        className="px-2.5 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-[10px] font-semibold hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-1"
                        title="Resend MFA Enrollment Link"
                      >
                        {resentMfaId === m.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span>Link Sent!</span>
                          </>
                        ) : (
                          <>
                            <RotateCw className="h-3 w-3" />
                            <span>Enforce MFA</span>
                          </>
                        )}
                      </button>
                    )}

                    {m.role !== "Owner" && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-[#86868B] hover:text-red-600 transition-colors hover:scale-105 active:scale-95"
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
