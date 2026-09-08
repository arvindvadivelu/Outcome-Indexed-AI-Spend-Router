"use client";

import React, { useRef } from "react";
import { X, Printer, FileText } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto print:p-0 print:bg-white print:static">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-hidden,
          nav,
          header,
          aside,
          button {
            display: none !important;
          }
          #printable-invoice-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
          }
          .page-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Modal Dialog Container */}
      <div className="relative bg-[#18181B] border border-white/10 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:border-none print:shadow-none print:bg-white">
        
        {/* Top Control Bar (Non-Printable) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#121214] border-b border-white/10 shrink-0 print-hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#0050FF]" />
            <span className="font-bold text-sm text-white">Invoice {invoice.id}</span>
            <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold">
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-full bg-[#0050FF] hover:bg-[#0043D6] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 1-Page Printable Professional Clean Invoice */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-neutral-100 dark:bg-neutral-900 flex justify-center print:p-0 print:bg-white">
          <div
            ref={printRef}
            id="printable-invoice-container"
            className="w-full max-w-[720px] bg-white text-[#1D1D1F] p-8 sm:p-10 rounded-xl shadow-md border border-black/5 font-sans space-y-6 print:shadow-none print:border-none print:p-0 print:space-y-5 print:max-w-none text-[13px] leading-normal"
          >
            {/* Header: Company & Invoice Info */}
            <div className="flex justify-between items-start border-b border-neutral-200 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-[#1D1D1F]">
                    OutcomeRouter<span className="text-[#0050FF]">.ai</span>
                  </span>
                </div>
                <p className="font-semibold text-xs text-neutral-800">Outcome-Indexed AI Spend Router Pvt. Ltd.</p>
                <p className="text-[11px] text-neutral-500">215 Nariman Point, Mumbai 400021, India</p>
                <p className="text-[11px] text-neutral-500 font-mono">CIN: U72900MH2024PTC394821 | GSTIN: 27AABCO9182F1ZV</p>
              </div>

              <div className="text-right space-y-1">
                <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight">TAX INVOICE</h1>
                <p className="text-xs font-mono font-bold text-[#0050FF]">{invoice.id}</p>
                <p className="text-[11px] text-neutral-500">Date: {invoice.date}</p>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  STATUS: {invoice.status}
                </div>
              </div>
            </div>

            {/* Bill To & Payment Info */}
            <div className="grid grid-cols-2 gap-6 text-xs pb-1">
              <div>
                <p className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">Billed To</p>
                <p className="font-bold text-sm text-neutral-900">{invoice.customerName || "Customer"}</p>
                <p className="text-neutral-600">{invoice.customerEmail}</p>
                <p className="text-neutral-500">Workspace: {invoice.workspaceName || "Primary Workspace"}</p>
              </div>

              <div>
                <p className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">Payment Method</p>
                <p className="font-semibold text-neutral-800">{invoice.paymentMethod}</p>
                <p className="text-neutral-500 font-mono text-[11px]">Ref / UTR: {invoice.transactionRef || "N/A"}</p>
                <p className="text-neutral-500 text-[11px]">SAC Code: 998313 (Software & Cloud Services)</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-700 font-bold uppercase text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Period</th>
                    <th className="py-2.5 px-3 text-center">Monthly Quota</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="py-3 px-3">
                      <p className="font-bold text-neutral-900">{invoice.planName} Tier Subscription</p>
                      <p className="text-[11px] text-neutral-500">Outcome-Indexed LLM Spend Routing Platform</p>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-600">1 Month</td>
                    <td className="py-3 px-3 text-center font-mono text-neutral-600">
                      {invoice.tokenQuota.toLocaleString()} tokens
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">
                      {currencySymbol}{invoice.amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Subtotal & Taxes Summary */}
            <div className="flex justify-end pt-1">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">{currencySymbol}{invoice.amount.toFixed(2)}</span>
                </div>
                {isINR ? (
                  <>
                    <div className="flex justify-between text-neutral-600">
                      <span>CGST (9%):</span>
                      <span className="font-mono">{currencySymbol}{(invoice.taxAmount / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>SGST (9%):</span>
                      <span className="font-mono">{currencySymbol}{(invoice.taxAmount / 2).toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-neutral-600">
                    <span>Export Tax (0%):</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-sm font-extrabold text-neutral-900">
                  <span>Total Paid:</span>
                  <span className="font-mono text-[#0050FF]">
                    {currencySymbol}{invoice.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer & Signature */}
            <div className="flex justify-between items-end border-t border-neutral-200 pt-4 text-xs text-neutral-500 page-break-avoid">
              <div className="space-y-0.5">
                <p className="font-semibold text-neutral-700">Thank you for your business!</p>
                <p className="text-[11px] text-neutral-400">Questions? Contact billing@outcomerouter.ai</p>
                <p className="font-mono text-[9px] text-neutral-400 truncate max-w-[340px]">Seal: {invoice.sha256Hash}</p>
              </div>

              <div className="text-right">
                <p className="font-serif italic text-sm text-[#0050FF] font-bold">Arvind Vadivelu</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-700">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
