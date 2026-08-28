"use client";

import { useState, useMemo } from "react";
import { useAppStore, TeamMember } from "@/lib/store";
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
  Clock,
  AlertTriangle,
  Activity,
  DollarSign,
  Filter,
  X
} from "lucide-react";

const ROLES = ["Owner", "Admin", "Engineer", "FinOps", "Viewer"];

function formatRelativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hour${Math.floor(diff / 3600000) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diff / 86400000)} day${Math.floor(diff / 86400000) > 1 ? "s" : ""} ago`;
  } catch {
    return "Unknown";
  }
}

export default function TeamPage() {
  const {
    teamMembers,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    updateTeamMemberStatus,
    updateTeamMemberSpendLimit
  } = useAppStore();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Engineer");
  const [inviteSpendLimit, setInviteSpendLimit] = useState(200);
  const [inviteNotice, setInviteNotice] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isAuditing, setIsAuditing] = useState(false);
  const [rbacResult, setRbacResult] = useState<{
    score: string;
    mfaCoverage: number;
    recommendation: string;
    issues: string[];
  } | null>(null);

  const [editingSpend, setEditingSpend] = useState<number | null>(null);
  const [spendInput, setSpendInput] = useState("");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");

    if (!inviteEmail.trim()) {
      setInviteError("Email is required.");
      return;
    }
    if (!validateEmail(inviteEmail)) {
      setInviteError("Please enter a valid email address.");
      return;
    }
    if (teamMembers.some((m) => m.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      setInviteError("This email is already on the team.");
      return;
    }

    const newMember: TeamMember = {
      id: Date.now(),
      name: inviteEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      tokenQuota: inviteRole === "Admin" ? "200,000 / mo" : inviteRole === "Owner" ? "Unlimited" : "50,000 / mo",
      spendLimitUsd: inviteSpendLimit,
      mfaActive: false,
      lastActive: new Date().toISOString(),
      status: "invited"
    };

    addTeamMember(newMember);
    setInviteEmail("");
    setInviteSpendLimit(200);
    setInviteNotice(true);
    setTimeout(() => setInviteNotice(false), 4000);
  };

  const handleAuditRBAC = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const mfaCount = teamMembers.filter((m) => m.mfaActive).length;
      const mfaCoverage = Math.round((mfaCount / Math.max(1, teamMembers.length)) * 100);
      const noMfa = teamMembers.filter((m) => !m.mfaActive && m.role !== "Viewer");
      const issues: string[] = [];
      if (noMfa.length > 0) {
        issues.push(`${noMfa.length} privileged member(s) without MFA: ${noMfa.map((m) => m.name).join(", ")}`);
      }
      const ownersCount = teamMembers.filter((m) => m.role === "Owner").length;
      if (ownersCount > 1) {
        issues.push(`${ownersCount} Owner-level seats detected — recommend single Owner + Admins.`);
      }
      const invitedStale = teamMembers.filter(
        (m) => m.status === "invited" && Date.now() - new Date(m.lastActive).getTime() > 86400000 * 3
      );
      if (invitedStale.length > 0) {
        issues.push(`${invitedStale.length} invitation(s) pending >3 days. Consider resending or removing.`);
      }

      setRbacResult({
        score: issues.length === 0 ? "A+" : issues.length === 1 ? "B+" : "C",
        mfaCoverage,
        recommendation: issues.length === 0
          ? "All permission scopes follow least-privilege best practices. Zero policy leaks detected."
          : "Address flagged issues to reach A+ compliance posture.",
        issues
      });
      setIsAuditing(false);
    }, 500);
  };

  const handleSaveSpend = (id: number) => {
    const val = parseFloat(spendInput);
    if (!isNaN(val) && val >= 0) {
      updateTeamMemberSpendLimit(id, val);
    }
    setEditingSpend(null);
    setSpendInput("");
  };

  const filteredMembers = useMemo(() =>
    teamMembers.filter((m) => {
      const roleOk = filterRole === "all" || m.role === filterRole;
      const statusOk = filterStatus === "all" || m.status === filterStatus;
      return roleOk && statusOk;
    }),
    [teamMembers, filterRole, filterStatus]
  );

  const mfaCount = teamMembers.filter((m) => m.mfaActive).length;

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Team &amp; Organization RBAC
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Manage organization seats, role permissions, per-member budgets, and MFA status
          </p>
        </div>

        <button
          onClick={handleAuditRBAC}
          disabled={isAuditing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#F5F5F7] hover:text-[#1D1D1F] shadow-xs transition-all self-start sm:self-auto disabled:opacity-60"
        >
          <Bot className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF]" />
          <span>{isAuditing ? "Auditing..." : "Audit RBAC Scopes"}</span>
        </button>
      </div>

      {/* RBAC Audit Result */}
      {rbacResult && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[#0050FF] dark:text-[#3374FF] font-semibold flex items-center gap-1.5 text-sm">
              <ShieldCheck className="h-4 w-4" />
              RBAC Audit Complete — Score: {rbacResult.score}
            </span>
            <button onClick={() => setRbacResult(null)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#86868B]">MFA Coverage:</span>
            <div className="flex-1 bg-[#F5F5F7] dark:bg-[#1F1F23] h-2 rounded-full overflow-hidden">
              <div className="bg-[#0050FF] h-full rounded-full transition-all" style={{ width: `${rbacResult.mfaCoverage}%` }} />
            </div>
            <span className="font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{rbacResult.mfaCoverage}%</span>
          </div>
          <p className="text-xs text-[#515154] dark:text-[#8E8E93]">{rbacResult.recommendation}</p>
          {rbacResult.issues.length > 0 && (
            <ul className="space-y-1">
              {rbacResult.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Seats", value: teamMembers.length, icon: <Users className="h-3.5 w-3.5" />, color: "text-[#0050FF]" },
          { label: "MFA Active", value: `${mfaCount}/${teamMembers.length}`, icon: <Lock className="h-3.5 w-3.5" />, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Pending Invites", value: teamMembers.filter(m => m.status === "invited").length, icon: <Clock className="h-3.5 w-3.5" />, color: "text-amber-600 dark:text-amber-400" },
          { label: "Suspended", value: teamMembers.filter(m => m.status === "suspended").length, icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "text-red-600 dark:text-red-400" }
        ].map((kpi, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#86868B] mb-1">
              <span>{kpi.label}</span>
              <span className={kpi.color}>{kpi.icon}</span>
            </div>
            <div className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-[#86868B]">
          <Filter className="h-3.5 w-3.5" /> Filter:
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.06] dark:border-white/[0.08] text-[#515154] dark:text-[#8E8E93]"
        >
          <option value="all">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.06] dark:border-white/[0.08] text-[#515154] dark:text-[#8E8E93]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </select>
        {(filterRole !== "all" || filterStatus !== "all") && (
          <button
            onClick={() => { setFilterRole("all"); setFilterStatus("all"); }}
            className="text-xs text-[#0050FF] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
            Organization Members ({filteredMembers.length})
          </h2>
        </div>

        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#86868B]">No members match the current filters.</div>
          ) : (
            filteredMembers.map((member) => (
              <div key={member.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* Avatar & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">{member.name}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        member.status === "active" ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                        : member.status === "invited" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        {member.status}
                      </span>
                      {member.mfaActive ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <span title="MFA not enabled"><AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" /></span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#86868B] mt-0.5">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#86868B] mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(member.lastActive)}</span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  {/* Role */}
                  <select
                    value={member.role}
                    onChange={(e) => updateTeamMemberRole(member.id, e.target.value)}
                    disabled={member.role === "Owner"}
                    className="text-xs px-2 py-1 rounded-lg bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] disabled:opacity-50"
                  >
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>

                  {/* Spend Limit */}
                  {editingSpend === member.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={spendInput}
                        onChange={(e) => setSpendInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveSpend(member.id);
                          if (e.key === "Escape") { setEditingSpend(null); setSpendInput(""); }
                        }}
                        autoFocus
                        className="w-20 text-xs px-2 py-1 rounded-lg bg-white dark:bg-[#161618] border border-[#0050FF]/50 text-[#1D1D1F] dark:text-[#F5F5F7]"
                        placeholder="USD/mo"
                      />
                      <button onClick={() => handleSaveSpend(member.id)} className="text-xs text-[#0050FF] font-semibold hover:underline">
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingSpend(member.id); setSpendInput(String(member.spendLimitUsd)); }}
                      className="flex items-center gap-1 text-[11px] text-[#86868B] hover:text-[#0050FF] transition-colors px-2 py-1 rounded-lg bg-[#F5F5F7] dark:bg-[#1F1F23]"
                      title="Edit spend limit"
                    >
                      <DollarSign className="h-3 w-3" />
                      <span>{member.spendLimitUsd === 0 ? "Unlimited" : `$${member.spendLimitUsd}/mo`}</span>
                    </button>
                  )}

                  {/* Suspend / Activate */}
                  {member.role !== "Owner" && (
                    <button
                      onClick={() => updateTeamMemberStatus(member.id, member.status === "suspended" ? "active" : "suspended")}
                      title={member.status === "suspended" ? "Activate member" : "Suspend member"}
                      className={`text-[11px] px-2 py-1 rounded-lg font-medium transition-colors ${
                        member.status === "suspended"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
                          : "bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#86868B] hover:text-amber-600 hover:bg-amber-50"
                      }`}
                    >
                      {member.status === "suspended" ? "Activate" : "Suspend"}
                    </button>
                  )}

                  {/* Remove */}
                  {member.role !== "Owner" && (
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      className="text-[#86868B] hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Remove member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite New Member */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Invite Team Member</h2>
        </div>

        {inviteNotice && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-[#E6F4EA] dark:bg-[#1E3A2F] px-3 py-2 rounded-xl">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            Invitation sent successfully — member added to team with "invited" status.
          </div>
        )}

        {inviteError && (
          <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {inviteError}
          </div>
        )}

        <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] text-[#86868B] mb-1 block">Email Address *</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => { setInviteEmail(e.target.value); setInviteError(""); }}
              placeholder="engineer@company.com"
              className="w-full px-3 py-2 text-sm rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none focus:border-[#0050FF]/50"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#86868B] mb-1 block">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7]"
            >
              {ROLES.filter((r) => r !== "Owner").map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#86868B] mb-1 block">Spend Limit (USD/mo)</label>
            <input
              type="number"
              min="0"
              value={inviteSpendLimit}
              onChange={(e) => setInviteSpendLimit(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 text-sm rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none focus:border-[#0050FF]/50"
            />
          </div>

          <div className="sm:col-span-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-sm shadow-[#0050FF]/25 transition-all"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Send Invitation</span>
            </button>
          </div>
        </form>
      </div>

      {/* Permission Matrix */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#0050FF]" />
          <h2 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Permission Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06]">
                <th className="pb-2 text-left font-medium">Permission</th>
                {ROLES.map((r) => <th key={r} className="pb-2 text-center font-medium">{r}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {[
                { perm: "Execute Chat Completions", roles: ["Owner", "Admin", "Engineer"] },
                { perm: "View Telemetry & Logs", roles: ["Owner", "Admin", "Engineer", "FinOps", "Viewer"] },
                { perm: "Manage Routing Rules", roles: ["Owner", "Admin", "Engineer"] },
                { perm: "Manage API Keys", roles: ["Owner", "Admin"] },
                { perm: "Manage Billing & Budget", roles: ["Owner", "FinOps"] },
                { perm: "Invite / Remove Members", roles: ["Owner", "Admin"] },
                { perm: "Configure Webhooks", roles: ["Owner", "Admin"] },
                { perm: "Export / Import Backup", roles: ["Owner"] },
              ].map((row) => (
                <tr key={row.perm}>
                  <td className="py-2 text-[#515154] dark:text-[#8E8E93]">{row.perm}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="py-2 text-center">
                      {row.roles.includes(r) ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-[#D2D2D7] dark:text-[#3A3A3C]">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
