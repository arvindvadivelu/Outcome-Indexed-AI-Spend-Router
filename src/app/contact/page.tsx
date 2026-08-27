"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Mail,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  Bot,
  Building,
  Coins
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [spend, setSpend] = useState("$15,000 / month");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Instant AI FinOps Architect state
  const [isAuditing, setIsAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any>(null);

  const handleRunAiAudit = () => {
    if (!message.trim() && !spend) return;
    setIsAuditing(true);
    setTimeout(() => {
      setAiAuditResult({
        recommendation: `Based on your estimated spend of ${spend}, routing routine task types (customer support FAQ, data extraction, and preliminary code review) to DeepSeek-V3 and Groq Llama 3.3 can instantly recover ~$6,300/month while preserving Claude 3.5 Sonnet for high-stakes conversion moments.`,
        suggestedPlan: "Growth Tier with Speculative Dual-Routing",
        score: "96/100 Optimization Potential"
      });
      setIsAuditing(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20 text-[#0050FF] text-xs font-semibold shadow-apple-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI FinOps Advisory & Direct Team Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F] tracking-tight">
            Talk to an <span className="text-[#0050FF]">AI FinOps Architect</span>
          </h1>
          <p className="text-sm sm:text-base text-[#6E6E73]">
            Whether you spend $5K/mo or $100K/mo on LLMs, we will evaluate your prompt traces and calculate exact savings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-6">
            <h3 className="font-bold text-lg text-[#1D1D1F]">Request Custom Architecture Audit</h3>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#EEF4FF] border border-[#0050FF]/30 text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-[#0050FF] mx-auto" />
                <h4 className="font-bold text-[#1D1D1F] text-sm">Inquiry Received!</h4>
                <p className="text-xs text-[#515154]">
                  An AI Solutions Architect will email your customized routing audit within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1 font-sans">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] focus:outline-none focus:border-[#0050FF] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1 font-sans">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] focus:outline-none focus:border-[#0050FF] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1 font-sans">Monthly LLM Spend</label>
                  <select
                    value={spend}
                    onChange={(e) => setSpend(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] focus:outline-none focus:border-[#0050FF] focus:bg-white"
                  >
                    <option>$2,000 – $5,000 / month</option>
                    <option>$5,000 – $20,000 / month</option>
                    <option>$20,000 – $50,000 / month</option>
                    <option>$50,000+ / month</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1 font-sans">Describe Your AI Workload</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="We run customer support triage and outbound sales emails using GPT-4o..."
                    className="w-full p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] focus:outline-none focus:border-[#0050FF] focus:bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRunAiAudit}
                    className="px-4 py-3 rounded-full bg-[#EEF4FF] text-[#0050FF] font-bold text-xs hover:bg-[#0050FF] hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Bot className="h-4 w-4" />
                    <span>Run Instant AI Diagnosis</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* AI Instant Diagnosis Output Panel */}
          <div className="p-8 rounded-3xl bg-[#FBFBFD] border border-[#0050FF]/25 shadow-apple-md space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EEF4FF] text-[#0050FF]">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1D1D1F]">Instant AI FinOps Architect</h3>
                  <p className="text-xs text-[#86868B]">Real-time pipeline diagnostics</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-1 rounded-full border border-[#0050FF]/20">
                Live Advisor
              </span>
            </div>

            {isAuditing ? (
              <div className="p-8 text-center space-y-2">
                <span className="h-6 w-6 border-2 border-[#0050FF] border-t-transparent rounded-full animate-spin inline-block"></span>
                <p className="text-xs text-[#86868B] font-mono">Analyzing prompt taxonomy & Pareto frontier...</p>
              </div>
            ) : aiAuditResult ? (
              <div className="space-y-4 animate-in fade-in text-xs font-mono">
                <div className="flex items-center justify-between text-[#0050FF] font-bold">
                  <span>Score: {aiAuditResult.score}</span>
                  <span>{aiAuditResult.suggestedPlan}</span>
                </div>
                <p className="text-[#515154] font-sans leading-relaxed bg-white p-4 rounded-2xl border border-[#E5E5EA]">
                  {aiAuditResult.recommendation}
                </p>
              </div>
            ) : (
              <div className="text-xs text-[#86868B] leading-relaxed space-y-3">
                <p>
                  Click <strong>"Run Instant AI Diagnosis"</strong> to have our autonomous AI agent analyze your estimated spend and suggest immediate Pareto model swaps before submitting your form.
                </p>
                <div className="p-4 rounded-2xl bg-white border border-[#E5E5EA] space-y-1 text-[#515154]">
                  <p>• <strong>Average Response Time:</strong> &lt; 2 hours</p>
                  <p>• <strong>SOC 2 Type II:</strong> NDA available on request</p>
                  <p>• <strong>Custom POC:</strong> Free 30-day live trace analysis</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
