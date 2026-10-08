'use client';

import React, { useState } from 'react';
import { Campaign, Website } from '@/types';
import { formatINR, rupeesToPaise, paiseToRupees } from '@/lib/currency';
import { useAuth } from '@/lib/auth/context';
import { X, Zap, Shield, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface QuickBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  categoryName?: string;
  locationName?: string;
  currentHighestBidPaise: number;
  minNextBidPaise: number;
  onBidSuccess: () => void;
  onOpenWallet: () => void;
}

export function QuickBidModal({
  isOpen,
  onClose,
  campaign,
  categoryName,
  locationName,
  currentHighestBidPaise,
  minNextBidPaise,
  onBidSuccess,
  onOpenWallet,
}: QuickBidModalProps) {
  const { currentUser, wallet, refreshUserData } = useAuth();
  const [bidRupees, setBidRupees] = useState<number>(paiseToRupees(minNextBidPaise));
  const [autoBid, setAutoBid] = useState(campaign?.autoBidEnabled ?? true);
  const [maxBudgetRupees, setMaxBudgetRupees] = useState<number>(paiseToRupees(minNextBidPaise) * 2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      const minR = paiseToRupees(minNextBidPaise);
      setBidRupees(minR);
      setMaxBudgetRupees(minR * 2);
      setError(null);
      setSuccessMsg(null);
      if (campaign) {
        setAutoBid(campaign.autoBidEnabled ?? true);
      }
    }
  }, [isOpen, minNextBidPaise, campaign]);

  if (!isOpen) return null;

  const targetPaise = rupeesToPaise(bidRupees);
  const availableWalletPaise = wallet ? wallet.balancePaise - wallet.reservedPaise : 0;
  const currentMaxPaise = campaign?.maxBidPaise || 0;
  const requiredDeltaPaise = Math.max(0, targetPaise - currentMaxPaise);
  const hasSufficientBalance = availableWalletPaise >= requiredDeltaPaise;

  // Expected position calculation
  const willBeRank1 = targetPaise > currentHighestBidPaise;
  const estimatedEffectivePricePaise = willBeRank1
    ? (currentHighestBidPaise > 0 ? Math.min(targetPaise, currentHighestBidPaise + 100) : targetPaise)
    : minNextBidPaise;

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (currentUser.role !== 'PUBLISHER' && currentUser.role !== 'BUSINESS_OWNER' && currentUser.role !== 'ADMIN') {
      setError('Please switch to a Business Owner persona to place ranking bids.');
      return;
    }

    if (!campaign) {
      setError('Please choose or create an active campaign to place a bid.');
      return;
    }

    if (targetPaise < minNextBidPaise) {
      setError(`Minimum bid must be at least ${formatINR(minNextBidPaise)}.`);
      return;
    }

    if (!hasSufficientBalance) {
      setError(`Insufficient wallet balance. You need ${formatINR(requiredDeltaPaise)} available.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisherId: currentUser.id,
          newMaxBidPaise: targetPaise,
          autoBidEnabled: autoBid,
          maxBudgetPaise: rupeesToPaise(maxBudgetRupees),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place bid');
      }

      setSuccessMsg(data.message || 'Bid successfully recorded!');
      await refreshUserData();
      setTimeout(() => {
        onBidSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">
              Live Auction Console
            </div>
            <h2 className="text-lg font-bold">
              Compete for Rank #1 Position
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handlePlaceBid} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auction Context summary */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
            <div>
              <span className="text-neutral-500 block">Current #1 Bid</span>
              <strong className="text-neutral-900 text-sm font-mono tabular-nums">
                {formatINR(currentHighestBidPaise)}
              </strong>
            </div>
            <div>
              <span className="text-neutral-500 block">Next Minimum Bid</span>
              <strong className="text-amber-700 text-sm font-mono tabular-nums">
                {formatINR(minNextBidPaise)}
              </strong>
            </div>
          </div>

          {/* Bid Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="max-bid-input" className="text-xs font-semibold text-neutral-800">
                Your Maximum Bid (Spending Ceiling) (₹)
              </label>
              <span className="text-[11px] text-neutral-500">
                Min: {formatINR(minNextBidPaise)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-500">
                ₹
              </span>
              <input
                id="max-bid-input"
                type="number"
                min={paiseToRupees(minNextBidPaise)}
                step="1"
                value={bidRupees}
                onChange={(e) => setBidRupees(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-base font-bold font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
            </div>

            {/* Quick Increment suggestions */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-neutral-400">Quick set:</span>
              {[0, 50, 100, 250].map((inc) => {
                const val = paiseToRupees(minNextBidPaise) + inc;
                return (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setBidRupees(val)}
                    className="px-2 py-0.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded font-mono transition-colors cursor-pointer"
                  >
                    ₹{val}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimum-Required Price Simulation */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5">
            <div className="font-semibold text-amber-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              Minimum-Required Price Projection
            </div>
            <p className="text-neutral-600 leading-relaxed">
              If no higher bid is placed, you will secure{' '}
              <strong className="text-neutral-900">
                {willBeRank1 ? 'Sponsored #1 🥇' : 'Sponsored #2 🥈'}
              </strong>
              , and you will only be charged approximately{' '}
              <strong className="text-emerald-700 font-mono">
                {formatINR(estimatedEffectivePricePaise)}/mo
              </strong>
              . You will never be charged more than your maximum bid.
            </p>
          </div>

          {/* Auto-Bidding option */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoBid}
                onChange={(e) => setAutoBid(e.target.checked)}
                className="mt-0.5 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-neutral-800 block">
                  Enable Automatic Outbid Defense (Auto-Bidding)
                </span>
                <span className="text-[11px] text-neutral-500">
                  Automatically raises your bid by ₹1 when a rival outbids you, up to your cap.
                </span>
              </div>
            </label>
          </div>

          {/* Wallet Balance check & CTA */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-500">Available Wallet:</span>
              <strong className="ml-1 font-mono text-neutral-900">
                {formatINR(availableWalletPaise)}
              </strong>
            </div>

            {!hasSufficientBalance && (
              <button
                type="button"
                onClick={onOpenWallet}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                + Top Up Wallet <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasSufficientBalance}
              className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{isSubmitting ? 'Placing Bid...' : `Confirm Bid (₹${bidRupees})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
