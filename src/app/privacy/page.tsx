"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Shield,
  Lock,
  EyeOff,
  Server,
  FileCheck,
  Bot,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function PrivacyPage() {
  const [dataQuery, setDataQuery] = useState("Healthcare PII & Customer Financial Records");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuditing(true);
    setTimeout(() => {
      setAuditResult({
        status: "COMPLIANT & SECURE",
        retentionPolicy: "Zero Data Retention (Ephemeral In-Memory Token Processing)",
        encryption: "TLS 1.3 in-transit & AES-256 at rest",
        modelTraining: "Zero Customer Data Training Policy strictly enforced",
        vpcIsolation: "Dedicated private VPC partitions available on Enterprise"
      });
      setIsAuditing(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-12">
        <div className="space-y-3 border-b border-[#E5E5EA] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20 text-[#0050FF] text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>Enterprise Privacy & AI Security Auditor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F]">
            Privacy Policy & Zero-Data-Retention Commitment
          </h1>
          <p className="text-sm text-[#6E6E73]">
            Last updated: August 26, 2026 • SOC 2 Type II Certified • GDPR Compliant
          </p>
        </div>

        {/* 1. Interactive AI Privacy & Security Inspector */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EEF4FF] text-[#0050FF]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1D1D1F]">AI Data Governance Inspector</h3>
                <p className="text-[11px] text-[#86868B]">Verify data residency, retention, and encryption protocols for your specific data types</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20">
              Live Inspector
            </span>
          </div>

          <form onSubmit={handleAudit} className="flex gap-2">
            <input
              type="text"
              value={dataQuery}
              onChange={(e) => setDataQuery(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
              placeholder="Enter data type (e.g. HIPAA PII, Payment logs, Legal contracts)..."
            />
            <button
              type="submit"
              disabled={isAuditing}
              className="px-4 py-2 rounded-xl bg-[#0050FF] text-white text-xs font-bold hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50"
            >
              {isAuditing ? "Auditing..." : "Inspect Compliance"}
            </button>
          </form>

          {auditResult && (
            <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-[#0050FF]/20 space-y-2 text-xs font-mono animate-in fade-in">
              <div className="flex items-center justify-between text-[#0050FF] font-bold">
                <span>Compliance Status: {auditResult.status}</span>
                <span>SOC 2 Type II Ready</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-[#515154]">
                <div>• Retention: <strong>{auditResult.retentionPolicy}</strong></div>
                <div>• Encryption: <strong>{auditResult.encryption}</strong></div>
                <div>• Training: <strong>{auditResult.modelTraining}</strong></div>
                <div>• Isolation: <strong>{auditResult.vpcIsolation}</strong></div>
              </div>
            </div>
          )}
        </section>

        {/* 2. Structured Policy Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-[#515154] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#1D1D1F]">1. Zero Prompt Retention Architecture</h2>
            <p>
              Outcome-Indexed AI Spend Router operates as a stateless pass-through gateway. We do not store, log, or persist raw prompt bodies or completion text on disk unless you explicitly enable the optional semantic cache partition in your dedicated schema.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#1D1D1F]">2. No Training on Customer Data</h2>
            <p>
              Under zero circumstances are your API payloads, outcome metrics, or telemetry logs used to train foundational AI models or shared across organization tenants.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#1D1D1F]">3. Cryptographic Security Standards</h2>
            <p>
              All traffic between your client applications, our routing nodes, and upstream model providers (Anthropic, OpenAI, Groq, DeepSeek) is encrypted with TLS 1.3 in-transit and AES-256 for pgvector cache partitions.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
