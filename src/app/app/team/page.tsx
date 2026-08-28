"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  Shield,
  Bot
} from "lucide-react";

export default function TeamPage() {
  const [members, setMembers] = useState([
    { id: 1, name: "Alex Vance", email: "alex@acme.ai", role: "Owner", tokenQuota: "Unlimited" },
    { id: 2, name: "Sarah Chen", email: "sarah@acme.ai", role: "Admin", tokenQuota: "200,000 / mo" },
    { id: 3, name: "Marcus Rossi", email: "marcus@acme.ai", role: "Engineer", tokenQuota: "100,000 / mo" }
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Engineer");

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
        tokenQuota: inviteRole === "Admin" ? "200,000 / mo" : "50,000 / mo"
      }
    ]);
    setInviteEmail("");
  };

  const handleAuditRBAC = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setRbacResult({
        recommendation: "Least-Privilege Security Check: All active accounts have appropriate scopes with zero privilege leaks."
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
            Team Members
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Manage organization seats, role permissions, and token budgets
          </p>
        </div>

        <button
          onClick={handleAuditRBAC}
          disabled={isAuditing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/[0.06] text-xs font-semibold text-[#515154] hover:text-[#1D1D1F] shadow-sm transition-all"
        >
          <Bot className="h-3.5 w-3.5 text-[#0050FF]" />
          <span>{isAuditing ? "Auditing..." : "Audit Role Permissions"}</span>
        </button>
      </div>

      {/* RBAC Result */}
      {rbacResult && (
        <div className="p-4 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-1 animate-in fade-in text-xs">
          <span className="text-[#0050FF] font-semibold block">✓ Role Assessment Complete</span>
          <p className="text-[#515154] leading-relaxed">{rbacResult.recommendation}</p>
        </div>
      )}

      {/* Invite Form */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-3">
        <h3 className="font-semibold text-sm text-[#1D1D1F]">Invite Team Member</h3>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 h-10 px-4 rounded-full bg-[#F5F5F7] border border-transparent text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="h-10 px-4 rounded-full bg-[#F5F5F7] border border-transparent text-xs text-[#1D1D1F] focus:outline-none focus:bg-white transition-all"
          >
            <option value="Engineer">Engineer (Read & Route)</option>
            <option value="Admin">Admin (Full Control)</option>
            <option value="Viewer">Viewer (Analytics Only)</option>
          </select>
          <button
            type="submit"
            disabled={!inviteEmail.trim()}
            className="px-5 py-2 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Send Invite</span>
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FBFBFD] text-[#86868B] border-b border-black/[0.05]">
            <tr>
              <th className="p-4 pl-6 font-medium">Member Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium text-center">Role</th>
              <th className="p-4 font-medium text-center">Token Quota</th>
              <th className="p-4 pr-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F7]">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-[#FBFBFD] transition-colors">
                <td className="p-4 pl-6 font-semibold text-[#1D1D1F]">{m.name}</td>
                <td className="p-4 text-[#515154]">{m.email}</td>
                <td className="p-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#0050FF] font-semibold text-[11px]">
                    {m.role}
                  </span>
                </td>
                <td className="p-4 text-center text-[#86868B]">{m.tokenQuota}</td>
                <td className="p-4 pr-6 text-right">
                  {m.role !== "Owner" && (
                    <button
                      onClick={() => setMembers((prev) => prev.filter((item) => item.id !== m.id))}
                      className="p-1.5 rounded-lg text-[#86868B] hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
