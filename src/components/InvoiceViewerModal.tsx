"use client";

import React, { useRef } from "react";
import { X, Printer, Download, CheckCircle2, ShieldCheck, FileText, ArrowDownToLine, Zap } from "lucide-react";

export interface InvoiceData {
  id: string;
  date: string;
  dueDate?: string;
  customerName: string;
  customerEmail: string;
  workspaceName: string;
  planName: string;
  tokenQuota: number;
  currency: "USD" | "INR";
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: "GPay UPI" | "ICICI Business Wire" | "Card" | string;
  transactionRef: string;
  status: "PAID" | "SETTLED";
  sha256Hash: string;
}

interface InvoiceViewerModalProps {
  invoice: InvoiceData | null;
  onClose: () => void;
}

export function InvoiceViewerModal({ invoice, onClose }: InvoiceViewerModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const isINR = invoice.currency === "INR";
  const currencySymbol = isINR ? "₹" : "$";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Trigger native browser print-to-PDF
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
      {/* Container Box */}
      <div className="relative bg-[#1A1A1E] border border-white/10 rounded-[28px] max-w-4xl w-full shadow-2xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Non-Printable) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141416] border-b border-white/10 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#0050FF] text-white flex items-center justify-center shadow-xs">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">
                Official Tax Invoice ({invoice.id})
              </h2>
              <p className="text-[11px] text-[#86868B]">
                MAANG/FAANG Enterprise PDF Invoice Template · Pure White Format
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* The Printable FAANG/MAANG Pure-White Invoice Body */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-[#F4F4F6] flex justify-center">
          <div
            ref={printRef}
            id="printable-invoice"
            className="w-full max-w-[780px] bg-white text-[#1D1D1F] p-8 sm:p-12 rounded-2xl shadow-lg border border-black/10 font-sans space-y-8 print:shadow-none print:border-none print:p-0 print:m-0"
          >
            {/* Header: Company Info + Status Badge */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#0050FF] text-white flex items-center justify-center font-black text-base shadow-sm">
                    ⚡
                  </div>
                  <div>
                    <h1 className="font-extrabold text-lg text-[#1D1D1F] tracking-tight leading-none">
                      Outcome-Indexed AI Spend Router Pvt. Ltd.
                    </h1>
                    <span className="text-[10px] font-bold text-[#0050FF] uppercase tracking-widest block mt-0.5">
                      Enterprise Inference Cloud Infrastructure
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-600 space-y-0.5 leading-relaxed pt-1">
                  <p>Level 14, Free Press House, 215 Nariman Point</p>
                  <p>Mumbai, Maharashtra 400021, India</p>
                  <p className="font-mono text-[10px] text-gray-500">
                    CIN: U72900MH2024PTC394821 | GSTIN: 27AABCO9182F1ZV
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Email: billing@outcomerouter.ai | Web: https://outcomerouter.ai
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-right space-y-2 shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{invoice.status} · VERIFIED</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-800">INVOICE NO: <span className="font-mono text-[#0050FF]">{invoice.id}</span></p>
                  <p className="text-[11px] text-gray-500">Invoice Date: {invoice.date}</p>
                  <p className="text-[11px] text-gray-500">Payment Due: Immediate (Settled)</p>
                  <p className="text-[10px] font-mono text-gray-400">SAC Code: 998313 (IT Software)</p>
                </div>
              </div>
            </div>

            {/* Bill To & Payment Channel Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-200/80">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billed To (Customer)</span>
                <p className="font-bold text-sm text-[#1D1D1F]">{invoice.customerName || "Enterprise Customer"}</p>
                <p className="text-xs text-gray-600">{invoice.customerEmail}</p>
                <p className="text-xs text-gray-600 font-medium">Workspace: {invoice.workspaceName || "Default Workspace"}</p>
                <p className="text-[11px] text-gray-500">Place of Supply: {isINR ? "Maharashtra (27)" : "Export of Services (Outside India - Zero Rated)"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment & Settlement Channel</span>
                <p className="font-bold text-xs text-gray-800">{invoice.paymentMethod}</p>
                <p className="text-xs text-gray-600 font-mono">Reference / UTR: {invoice.transactionRef || "TXN_AUTO_SETTLED"}</p>
                <p className="text-[11px] text-emerald-700 font-medium">Settlement Status: Direct Bank Reconciliation Completed</p>
                <p className="text-[10px] font-mono text-gray-500">Dispute Window: 30-Day SLA Micro-Escrow Bound</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/80 text-gray-700 border-b border-gray-200 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-3 text-center">HSN/SAC</th>
                    <th className="py-3 px-3 text-center">Qty / Period</th>
                    <th className="py-3 px-3 text-right">Unit Rate</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900 text-xs">
                        Outcome-Indexed AI Spend Router — {invoice.planName.toUpperCase()} Tier
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Autonomous Pareto Bayesian Gateway Ingestion ({invoice.tokenQuota.toLocaleString()} tokens/mo), Sub-50ms Speculative Pre-warming, Cryptographic SLA Escrow, and Multi-Agent Bridges.
                      </p>
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-gray-600">998313</td>
                    <td className="py-4 px-3 text-center text-gray-700 font-medium">1 Month</td>
                    <td className="py-4 px-3 text-right font-mono text-gray-800">
                      {currencySymbol}{invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-gray-900">
                      {currencySymbol}{invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
              <div className="space-y-2 max-w-sm">
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-[#0050FF]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Cryptographic Nonce Verification</span>
                  </div>
                  <p className="font-mono text-[9px] text-gray-600 break-all select-all">
                    SHA-256: {invoice.sha256Hash}
                  </p>
                </div>
                <p className="text-[10px] text-gray-500 italic">
                  * Payment received in full. No physical signature required as this is an electronically generated and cryptographically verifiable tax invoice.
                </p>
              </div>

              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-bold text-gray-800">
                    {currencySymbol}{invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {isINR ? (
                  <>
                    <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                      <span>CGST (9.0%):</span>
                      <span className="font-mono text-gray-800">
                        {currencySymbol}{(invoice.taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                      <span>SGST (9.0%):</span>
                      <span className="font-mono text-gray-800">
                        {currencySymbol}{(invoice.taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                    <span>Export Tax (Zero-Rated LUT):</span>
                    <span className="font-mono text-gray-800">$0.00</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-t-2 border-gray-900 text-sm font-extrabold text-gray-900">
                  <span>Total Paid:</span>
                  <span className="font-mono text-[#0050FF] text-base">
                    {currencySymbol}{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature & Seal Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 text-xs text-gray-500">
              <div className="text-center sm:text-left space-y-0.5">
                <p className="font-bold text-gray-700">Thank you for powering your AI infrastructure with OutcomeRouter.</p>
                <p className="text-[10px]">For billing inquiries: billing@outcomerouter.ai | Terms: outcomerouter.ai/terms</p>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <div className="h-9 flex items-end justify-center sm:justify-end">
                  <span className="font-serif italic text-sm text-[#0050FF] font-bold border-b border-gray-400 px-3">
                    Arvind Vadivelu
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                  Authorized Signatory · OutcomeRouter Pvt Ltd
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
