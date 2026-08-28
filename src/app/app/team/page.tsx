"use client";

import { useState } from "react";
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
  UserCheck
} from "lucide-react";

export default function TeamPage() {
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
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Team & Organization RBAC
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Manage organization seats, role permissions, and monthly token budgets
          </p>
        </div>

        <button
          onClick={handleAuditRBAC}
          disabled={isAuditing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#F5F5F7] hover:text-[#1D1D1F] shadow-xs transition-all self-start sm:self-auto"
        >
          <Bot className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF]" />
          <span>{isAuditing ? "Auditing..." : "Audit RBAC Scopes"}</span>
        </button>
      </div>

      {/* RBAC Result */}
      {rbacResult && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-1 animate-in fade-in text-xs">
          <span className="text-[#0050FF] dark:text-[#3374FF] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Role Assessment Complete</span>
          </span>
          <p className="text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{rbacResult.recommendation}</p>
        </div>
      )}

      {/* Invite Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-3">
        <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Invite Team Member</h3>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:bg-white dark:focus:bg-[#161618] focus:border-[#0050FF]/30 transition-all"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
          >
            <option value="Engineer">Engineer (Read & Route)</option>
            <option value="Admin">Admin (Full Control)</option>
            <option value="FinOps">FinOps (Billing & Audits)</option>
            <option value="Viewer">Viewer (Analytics Only)</option>
          </select>
          <button
            type="submit"
            disabled={!inviteEmail.trim()}
            className="px-5 h-10 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm shadow-[#0050FF]/25 shrink-0 flex items-center gap-1.5 justify-center"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Send Invite</span>
          </button>
        </form>

        {inviteNotice && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Invitation sent with cryptographic onboarding token.</span>
          </p>
        )}
      </div>

      {/* Members Table */}
      <div className="rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFD] dark:bg-[#1A1A1E] text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06]">
              <tr>
                <th className="p-4 pl-6 font-medium">Member</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Token Allocation</th>
                <th className="p-4 font-medium text-center">Security (MFA)</th>
                <th className="p-4 font-medium text-center">Last Active</th>
                <th className="p-4 pr-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7] dark:divide-white/[0.06]">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-[#FBFBFD] dark:hover:bg-[#1E1E22] transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{m.name}</div>
                    <div className="text-[11px] text-[#86868B]">{m.email}</div>
                  </td>
                  <td className="p-4">
                    {m.role === "Owner" ? (
                      <span className="font-semibold text-xs text-[#0050FF] dark:text-[#3374FF]">Owner</span>
                    ) : (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] dark:bg-[#1F1F23] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Engineer">Engineer</option>
                        <option value="FinOps">FinOps</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    )}
                  </td>
                  <td className="p-4 font-mono text-[#515154] dark:text-[#A1A1A6]">{m.tokenQuota}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        m.mfaActive
                          ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {m.mfaActive ? "Passkey Active" : "MFA Pending"}
                    </span>
                  </td>
                  <td className="p-4 text-center text-[#86868B]">{m.lastActive}</td>
                  <td className="p-4 pr-6 text-right">
                    {m.role !== "Owner" && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1.5 rounded-full text-[#86868B] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Remove member"
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
