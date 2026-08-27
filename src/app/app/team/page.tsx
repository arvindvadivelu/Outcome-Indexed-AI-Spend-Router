"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  Mail,
  Shield,
  Bot,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function TeamPage() {
  const [members, setMembers] = useState([
    { id: 1, name: "Alex Vance", email: "alex@acme.ai", role: "Owner", tokenQuota: "Unlimited" },
    { id: 2, name: "Sarah Chen", email: "sarah@acme.ai", role: "Admin", tokenQuota: "200,000 / mo" },
    { id: 3, name: "Marcus Rossi", email: "marcus@acme.ai", role: "Engineer", tokenQuota: "100,000 / mo" }
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Engineer");

  // AI RBAC Recommender state
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
        recommendation: "Least-Privilege Security Check: All 3 active accounts have appropriate scopes. We recommend enforcing MFA for the 'Admin' role before generating live production API keys."
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
            Team Members & AI Role Advisor
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
            Manage organization seats, role-based access control (RBAC), and per-seat token limits
          </p>
        </div>

        <button
          onClick={handleAuditRBAC}
          disabled={isAuditing}
          className="px-5 py-2.5 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          <span>{isAuditing ? "Auditing Roles..." : "Run AI RBAC Security Audit"}</span>
        </button>
      </div>

      {/* RBAC Result */}
      {rbacResult && (
        <div className="p-6 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-2 animate-in fade-in text-xs font-mono">
          <span className="text-[#0050FF] font-bold block">✓ AI RBAC Security Assessment Complete</span>
          <p className="text-[#515154] font-sans pt-1 leading-relaxed">{rbacResult.recommendation}</p>
        </div>
      )}

      {/* Invite Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-4">
        <h3 className="font-bold text-base text-[#1D1D1F]">Invite Team Member</h3>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 h-11 px-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="h-11 px-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
          >
            <option value="Engineer">Engineer (Read & Route)</option>
            <option value="Admin">Admin (Full Control)</option>
            <option value="Viewer">Viewer (Analytics Only)</option>
          </select>
          <button
            type="submit"
            disabled={!inviteEmail.trim()}
            className="px-6 h-11 rounded-2xl bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Send Invite</span>
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F5F7] text-[#1D1D1F] font-mono border-b border-[#E5E5EA]">
            <tr>
              <th className="p-4 pl-6">Member Name</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Role</th>
              <th className="p-4 text-center">Token Quota</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5EA] bg-white font-mono">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-[#F5F5F7]/60 transition-colors">
                <td className="p-4 pl-6 font-bold text-[#1D1D1F]">{m.name}</td>
                <td className="p-4 text-[#515154]">{m.email}</td>
                <td className="p-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#0050FF] font-bold text-[10px] border border-[#0050FF]/20">
                    {m.role}
                  </span>
                </td>
                <td className="p-4 text-center text-[#515154]">{m.tokenQuota}</td>
                <td className="p-4 pr-6 text-right">
                  {m.role !== "Owner" && (
                    <button
                      onClick={() => setMembers((prev) => prev.filter((item) => item.id !== m.id))}
                      className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
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
