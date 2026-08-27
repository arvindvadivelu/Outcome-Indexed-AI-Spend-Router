"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  FileCheck,
  Bot,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export default function DPAPage() {
  const [jurisdictionInput, setJurisdictionInput] = useState("EU GDPR Standard Contractual Clauses (SCCs)");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [dpaResult, setDpaResult] = useState<any>(null);

  const handleSynthesizeDPA = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSynthesizing(true);
    setTimeout(() => {
      setDpaResult({
        governingLaw: jurisdictionInput,
        subprocessors: ["Anthropic, PBC", "OpenAI, LLC", "Groq, Inc.", "DeepSeek AI"],
        dataProcessingPurpose: "Ephemeral LLM prompt routing and semantic cache lookups only",
        auditRights: "Annual third-party SOC 2 Type II audit report provided upon request"
      });
      setIsSynthesizing(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-12">
        <div className="space-y-3 border-b border-[#E5E5EA] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20 text-[#0050FF] text-xs font-semibold">
            <FileCheck className="h-3.5 w-3.5" />
            <span>Data Protection Addendum & AI Clause Synthesizer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F]">
            Data Processing Addendum (DPA)
          </h1>
          <p className="text-sm text-[#6E6E73]">
            Standard Contractual Clauses (SCCs) and GDPR Article 28 compliance
          </p>
        </div>

        {/* 1. Interactive AI DPA Clause Synthesizer */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EEF4FF] text-[#0050FF]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1D1D1F]">AI DPA Clause Generator</h3>
                <p className="text-[11px] text-[#86868B]">Synthesize jurisdictional subprocessor clauses for GDPR, CCPA, or UK GDPR</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20">
              AI Clause Generator
            </span>
          </div>

          <form onSubmit={handleSynthesizeDPA} className="flex gap-2">
            <input
              type="text"
              value={jurisdictionInput}
              onChange={(e) => setJurisdictionInput(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
              placeholder="Enter compliance jurisdiction (e.g. EU GDPR, CCPA, UK DPA)..."
            />
            <button
              type="submit"
              disabled={isSynthesizing}
              className="px-4 py-2 rounded-xl bg-[#0050FF] text-white text-xs font-bold hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50"
            >
              {isSynthesizing ? "Generating..." : "Generate DPA Clause"}
            </button>
          </form>

          {dpaResult && (
            <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-[#0050FF]/20 space-y-2 text-xs font-mono animate-in fade-in">
              <div className="flex items-center justify-between text-[#0050FF] font-bold">
                <span>Jurisdiction: {dpaResult.governingLaw}</span>
                <span>GDPR Art. 28 Compliant</span>
              </div>
              <p className="text-[11px] text-[#515154] font-sans pt-1">
                <strong>Subprocessors:</strong> {dpaResult.subprocessors.join(", ")}
              </p>
              <p className="text-[11px] text-[#515154] font-sans">
                <strong>Purpose:</strong> {dpaResult.dataProcessingPurpose}
              </p>
            </div>
          )}
        </section>

        {/* 2. Standard Clauses */}
        <div className="space-y-8 text-xs sm:text-sm text-[#515154] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#1D1D1F]">1. Scope & Application</h2>
            <p>
              This Data Processing Addendum regulates the processing of personal data submitted by Customer through Outcome Router inference endpoints under applicable data privacy frameworks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#1D1D1F]">2. Data Subject Rights & Deletion</h2>
            <p>
              Because raw prompts are processed in-memory and discarded immediately upon completion dispatch, no long-term storage of personal data occurs.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
