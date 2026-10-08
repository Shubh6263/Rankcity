'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { formatINR } from '@/lib/currency';
import { WalletTransaction } from '@/types';
import { WalletTopupModal } from '@/components/publisher/WalletTopupModal';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PublisherWalletPage() {
  const { currentUser, wallet, refreshUserData } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/wallet?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentUser.id]);

  const totalPaise = wallet?.balancePaise || 0;
  const reservedPaise = wallet?.reservedPaise || 0;
  const availablePaise = totalPaise - reservedPaise;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Paise Safe Ledger
          </span>
          <h1 className="text-2xl font-bold text-neutral-900">
            Business Wallet
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Instant UPI deposits & transparent second-price campaign holds.
          </p>
        </div>

        <button
          onClick={() => setIsTopupModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Money via UPI / NetBanking</span>
        </button>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Available for Bidding
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
            {formatINR(availablePaise)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Ready for instant auction allocation
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Active Campaign Holds
          </span>
          <div className="text-3xl font-extrabold text-amber-700 font-mono tabular-nums">
            {formatINR(reservedPaise)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Locked to guarantee active ranking slots
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Total Account Balance
          </span>
          <div className="text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
            {formatINR(totalPaise)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block font-mono">
            {totalPaise} paise (Minor unit safe)
          </span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Transaction History</h2>
            <p className="text-xs text-neutral-500">All deposits, holds, and campaign charges</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No transactions found on this account yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Method / Ref</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50">
                    <td className="py-3.5 px-6 font-mono text-neutral-500 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-neutral-900">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-6 text-neutral-500 font-mono text-[11px]">
                      {tx.paymentMethod || 'SYSTEM'} {tx.gatewayRef ? `· ${tx.gatewayRef}` : ''}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold tabular-nums">
                      <span
                        className={
                          tx.type === 'deposit'
                            ? 'text-emerald-700'
                            : 'text-neutral-900'
                        }
                      >
                        {tx.type === 'deposit' ? '+' : '-'}
                        {formatINR(tx.amountPaise)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WalletTopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        onSuccess={() => {
          fetchTransactions();
          refreshUserData();
        }}
      />
    </div>
  );
}
