'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Invoice } from '@/types';
import { formatINR } from '@/lib/currency';
import {
  Receipt,
  Download,
  FileText,
  CheckCircle2,
  Calendar,
  Building2,
  Printer,
} from 'lucide-react';

export default function BusinessInvoicesPage() {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await fetch(`/api/invoices?userId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setInvoices(data.invoices || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadInvoices();
  }, [currentUser.id]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const totalSpentPaise = invoices.reduce((acc, inv) => acc + inv.totalPaise, 0);
  const totalTaxPaise = invoices.reduce((acc, inv) => acc + inv.taxPaise, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            GST Tax Invoices & Billing
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Official Indian GST-compliant tax invoices for monthly auction placements and wallet top-ups.
          </p>
        </div>

        <div className="text-xs font-semibold text-neutral-600 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs self-start sm:self-auto">
          GSTIN: <strong className="text-neutral-900">23AABCR1234F1Z9</strong> (RankCity India)
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Total Campaign Spend
          </span>
          <span className="text-2xl font-black text-neutral-900">{formatINR(totalSpentPaise)}</span>
          <span className="text-[10px] text-neutral-500 block">Inclusive of 18% Goods & Services Tax</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Input Tax Credit (GST 18%)
          </span>
          <span className="text-2xl font-black text-emerald-600">{formatINR(totalTaxPaise)}</span>
          <span className="text-[10px] text-neutral-500 block">Eligible for business ITC set-off</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Total Invoices Issued
          </span>
          <span className="text-2xl font-black text-blue-600">{invoices.length}</span>
          <span className="text-[10px] text-neutral-500 block">All receipts verified & reconciled</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-600" />
            <span>Tax Invoice Ledger</span>
          </h3>
          <span className="text-xs text-neutral-400 font-medium">{invoices.length} records</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Loading invoice ledger...</div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400">
            No invoices generated yet. Invoices appear automatically upon campaign hold settlement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Business / Description</th>
                  <th className="py-3 px-4">Taxable</th>
                  <th className="py-3 px-4">18% GST</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {new Date(inv.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 block">{inv.businessName}</span>
                      <span className="text-[11px] text-neutral-500 block max-w-xs truncate">
                        {inv.description}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-medium text-neutral-700">
                      {formatINR(inv.amountPaise)}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-medium text-neutral-700">
                      {formatINR(inv.taxPaise)}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-bold text-neutral-900">
                      {formatINR(inv.totalPaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        PAID
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal Preview */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl relative animate-in fade-in">
            <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
              <div>
                <span className="text-2xl font-black text-blue-600 tracking-tight">RankCity</span>
                <span className="text-xs text-neutral-400 block mt-0.5">RankCity Technologies Pvt Ltd</span>
                <span className="text-[11px] text-neutral-400">GSTIN: 23AABCR1234F1Z9 · Indore, MP</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-neutral-500 uppercase">Tax Invoice</span>
                <span className="text-sm font-mono font-bold text-neutral-900 block">
                  {selectedInvoice.invoiceNumber}
                </span>
                <span className="text-[11px] text-neutral-400">
                  Date: {new Date(selectedInvoice.date).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-neutral-400 uppercase text-[10px]">Billed To:</span>
              <div className="font-bold text-neutral-900 text-sm">{currentUser.name}</div>
              <div className="text-neutral-600">{selectedInvoice.businessName}</div>
              <div className="text-neutral-500">{currentUser.email}</div>
            </div>

            <div className="border border-neutral-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-neutral-50 p-3 font-semibold text-neutral-600 border-b border-neutral-200 flex justify-between">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="p-3.5 space-y-2">
                <div className="flex justify-between font-medium text-neutral-800">
                  <span>{selectedInvoice.description}</span>
                  <span className="tabular-nums">{formatINR(selectedInvoice.amountPaise)}</span>
                </div>
                <div className="flex justify-between text-neutral-500 text-[11px]">
                  <span>Central GST (CGST 9%)</span>
                  <span className="tabular-nums">{formatINR(selectedInvoice.taxPaise / 2)}</span>
                </div>
                <div className="flex justify-between text-neutral-500 text-[11px]">
                  <span>State GST (SGST 9%)</span>
                  <span className="tabular-nums">{formatINR(selectedInvoice.taxPaise / 2)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-900 text-sm">
                  <span>Total Paid (INR)</span>
                  <span className="text-emerald-700 tabular-nums">{formatINR(selectedInvoice.totalPaise)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
