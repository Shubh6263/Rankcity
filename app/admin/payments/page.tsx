'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/currency';
import { WalletTransaction, Invoice, AdminPlatformStats, PaymentRequest } from '@/types';
import {
  CreditCard,
  CheckCircle2,
  RefreshCw,
  Receipt,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Search,
  AlertCircle,
  X,
  ExternalLink,
  Clock,
  XCircle,
  Eye,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [activeTab, setActiveTab] = useState<'verification' | 'transactions' | 'invoices'>('verification');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal state
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const [dashRes, invRes, payRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/invoices'),
        fetch('/api/payments'),
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setTransactions(data.recentTransactions || []);
        setStats(data.stats || null);
      }

      if (invRes.ok) {
        const iData = await invRes.json();
        setInvoices(iData.invoices || []);
      }

      if (payRes.ok) {
        const pData = await payRes.json();
        setPayments(pData.payments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalGmvPaise = stats?.gmvPaise || 0;
  const commissionRevenuePaise = stats?.commissionRevenuePaise || 0;
  const gstCollectedPaise = invoices.reduce((acc, inv) => acc + inv.taxPaise, 0);

  const pendingPayments = payments.filter(
    (p) => p.status === 'PAYMENT_SUBMITTED' || p.status === 'UNDER_REVIEW' || p.status === 'PAYMENT_PENDING'
  );

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      (p.businessName && p.businessName.toLowerCase().includes(q)) ||
      (p.utr && p.utr.toLowerCase().includes(q)) ||
      p.status.toLowerCase().includes(q)
    );
  });

  const filteredTxs = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.id.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      tx.userId.toLowerCase().includes(q)
    );
  });

  const handleConfirm = async (paymentId: string) => {
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'usr_admin' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm payment');
      }
      setActionSuccess('Payment confirmed! Campaign activated.');
      await fetchPayments();
      setTimeout(() => {
        setSelectedPayment(null);
        setActionSuccess(null);
      }, 1200);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!rejectionReason.trim()) {
      setActionError('Rejection reason is required.');
      return;
    }
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim(),
          verifiedBy: 'usr_admin',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject payment');
      }
      setActionSuccess('Payment rejected.');
      await fetchPayments();
      setTimeout(() => {
        setSelectedPayment(null);
        setIsRejecting(false);
        setRejectionReason('');
        setActionSuccess(null);
      }, 1200);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xs">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
          Finance & Verification
        </span>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
          Payment Verification & Reconciliation
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Verify merchant bank/UPI UTR transactions, approve sponsored ranking activations, and audit statutory tax ledgers.
        </p>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Pending Verifications
          </span>
          <span className="text-2xl font-black text-amber-600">{pendingPayments.length}</span>
          <span className="text-[10px] text-amber-700 font-semibold block">Awaiting admin transaction check</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Auction GMV
          </span>
          <span className="text-2xl font-black text-neutral-900">{formatINR(totalGmvPaise)}</span>
          <span className="text-[10px] text-blue-600 font-semibold block">Total active auction commitments</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Platform Fee (15%)
          </span>
          <span className="text-2xl font-black text-emerald-600">{formatINR(commissionRevenuePaise)}</span>
          <span className="text-[10px] text-neutral-500 block">Direct marketplace net revenue</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            GST Collected (18%)
          </span>
          <span className="text-2xl font-black text-indigo-600">{formatINR(gstCollectedPaise)}</span>
          <span className="text-[10px] text-neutral-500 block">Government statutory tax ledger</span>
        </div>
      </div>

      {/* Tab Switcher & Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 bg-neutral-200/60 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Payment Verification</span>
            {pendingPayments.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-neutral-950 font-black rounded-full text-[10px]">
                {pendingPayments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Wallet Ledger Mutations ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Tax Invoices Ledger ({invoices.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search payment or UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-neutral-900"
          />
        </div>
      </div>

      {/* TAB 1: Payment Verification Queue */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-6">Payment ID</th>
                  <th className="py-3 px-6">Business</th>
                  <th className="py-3 px-6">Campaign</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 font-mono">UTR / Reference</th>
                  <th className="py-3 px-6">Submitted At</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-neutral-500">
                      No payment requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const isPending =
                      p.status === 'PAYMENT_SUBMITTED' ||
                      p.status === 'UNDER_REVIEW' ||
                      p.status === 'PAYMENT_PENDING';
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/50">
                        <td className="py-3.5 px-6 font-mono font-bold text-[11px] text-neutral-900">
                          {p.id}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-neutral-900">
                          {p.businessName || 'Business Listing'}
                        </td>
                        <td className="py-3.5 px-6 text-neutral-600 font-mono text-[11px]">
                          {p.campaignId}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono font-bold tabular-nums text-neutral-900">
                          {formatINR(p.totalAmountPaise)}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-neutral-800">
                          {p.utr ? (
                            <span className="px-2 py-0.5 rounded bg-neutral-100 font-bold text-neutral-900">
                              {p.utr}
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic">Not entered yet</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-neutral-500 text-[11px]">
                          {p.submittedAt
                            ? new Date(p.submittedAt).toLocaleString('en-IN')
                            : new Date(p.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === 'PAYMENT_CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : p.status === 'PAYMENT_SUBMITTED' || p.status === 'UNDER_REVIEW'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : p.status === 'PAYMENT_REJECTED'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPayment(p);
                              setIsRejecting(false);
                              setRejectionReason('');
                              setActionError(null);
                              setActionSuccess(null);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer shadow-xs"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Wallet Ledger Mutations */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-6">Transaction ID</th>
                  <th className="py-3 px-6">User ID</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Gateway / VPA</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-neutral-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/50">
                      <td className="py-3.5 px-6 font-mono text-[11px] font-bold text-neutral-900">{tx.id}</td>
                      <td className="py-3.5 px-6 font-semibold text-neutral-800">{tx.userId}</td>
                      <td className="py-3.5 px-6 text-neutral-700">{tx.description}</td>
                      <td className="py-3.5 px-6 font-mono text-neutral-500 text-[11px]">
                        {tx.upiId || tx.gatewayRef || 'INTERNAL_RESERVE'}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold tabular-nums text-neutral-900">
                        {formatINR(tx.amountPaise)}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {tx.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Tax Invoices Ledger */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Business / Client</th>
                  <th className="py-3 px-6 text-right">Taxable</th>
                  <th className="py-3 px-6 text-right">GST (18%)</th>
                  <th className="py-3 px-6 text-right">Total Amount</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-neutral-500">
                      No invoices recorded yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-50/50">
                      <td className="py-3.5 px-6 font-mono font-bold text-neutral-900">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-6 text-neutral-500">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                      <td className="py-3.5 px-6 font-semibold text-neutral-800">{inv.businessName || inv.userId}</td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums">{formatINR(inv.amountPaise)}</td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums text-indigo-700 font-semibold">{formatINR(inv.taxPaise)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold tabular-nums text-neutral-900">{formatINR(inv.totalPaise)}</td>
                      <td className="py-3.5 px-6 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Payment Verification Inspection
                </span>
                <h3 className="text-base font-bold">
                  {selectedPayment.businessName || 'Business Payment'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              {actionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Breakdown Card */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2">
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Payment ID:</span>
                  <span className="font-mono font-bold text-neutral-900">{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Campaign ID:</span>
                  <span className="font-mono text-neutral-800">{selectedPayment.campaignId}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Campaign Amount:</span>
                  <span className="font-mono font-semibold text-neutral-900">{formatINR(selectedPayment.amountPaise)}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Platform Fee (15%):</span>
                  <span className="font-mono font-semibold text-neutral-900">{formatINR(selectedPayment.platformFeePaise)}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>GST (18%):</span>
                  <span className="font-mono font-semibold text-neutral-900">{formatINR(selectedPayment.gstPaise)}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between items-center font-bold text-sm text-neutral-950">
                  <span>Total Amount:</span>
                  <span className="font-mono text-emerald-700 text-base">{formatINR(selectedPayment.totalAmountPaise)}</span>
                </div>
              </div>

              {/* UTR Verification details */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  Submitted UTR / Transaction Reference:
                </div>
                <div className="font-mono text-base font-black text-neutral-900 bg-white p-2.5 rounded-xl border border-amber-300">
                  {selectedPayment.utr || 'No UTR Submitted Yet'}
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  ⚠️ Verify this UTR against your merchant UPI bank statement before confirming. Payment screenshot is supporting evidence only.
                </p>
              </div>

              {/* Screenshot Preview if available */}
              {selectedPayment.screenshotUrl && (
                <div className="space-y-1">
                  <span className="text-neutral-500 font-semibold block">Supporting Screenshot:</span>
                  <a
                    href={selectedPayment.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Uploaded Screenshot
                  </a>
                </div>
              )}

              {/* Rejection Input */}
              {isRejecting && (
                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <label className="block font-bold text-rose-700">
                    Reason for Rejection *
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. UTR not found in bank statement, incorrect transaction amount..."
                    className="w-full p-2.5 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-200 flex items-center gap-3">
                {selectedPayment.status === 'PAYMENT_CONFIRMED' ? (
                  <div className="w-full p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payment Already Confirmed</span>
                  </div>
                ) : (
                  <>
                    {!isRejecting ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsRejecting(true)}
                          disabled={isProcessing}
                          className="flex-1 py-2.5 px-4 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                        >
                          Reject Payment
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirm(selectedPayment.id)}
                          disabled={isProcessing || !selectedPayment.utr}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isProcessing ? 'Verifying...' : 'Confirm Payment'}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsRejecting(false)}
                          disabled={isProcessing}
                          className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-bold"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(selectedPayment.id)}
                          disabled={isProcessing || !rejectionReason.trim()}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-neutral-300 text-white font-bold"
                        >
                          {isProcessing ? 'Rejecting...' : 'Submit Rejection'}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
