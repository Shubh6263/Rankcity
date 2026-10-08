'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { formatINR, rupeesToPaise, paiseToRupees } from '@/lib/currency';
import { BidRecord, Campaign } from '@/types';
import {
  History,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Shield,
  X,
} from 'lucide-react';

export default function PublisherBidsPage() {
  const { currentUser, wallet, refreshUserData } = useAuth();
  const [bids, setBids] = useState<BidRecord[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Bidding & Outbid State
  const [isChangeBidModalOpen, setIsChangeBidModalOpen] = useState(false);
  const [currentMaxBidRupees, setCurrentMaxBidRupees] = useState(500);
  const [newMaxBidRupees, setNewMaxBidRupees] = useState(650);
  const [simulatedPosition, setSimulatedPosition] = useState<'1' | '2'>('1');
  const [showOutbidAlert, setShowOutbidAlert] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/publisher/dashboard?publisherId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setBids(data.recentBids || []);
          setCampaigns(data.campaigns || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [currentUser.id]);

  const handleConfirmBid = () => {
    setCurrentMaxBidRupees(newMaxBidRupees);
    setSimulatedPosition('1');
    setShowOutbidAlert(false);
    setIsChangeBidModalOpen(false);
    setFeedbackMsg(`Maximum bid updated to ₹${newMaxBidRupees}/month! Position #1 secured.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
          Sponsored Ranking Control
        </span>
        <h1 className="text-2xl font-black text-neutral-900 mt-1">
          Bidding & Position Center
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage your monthly maximum bids, monitor active clearing prices, and respond to outbid events.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedbackMsg}
        </div>
      )}

      {/* Outbid Alert Banner (Simulated & Dismissable) */}
      {showOutbidAlert && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Your sponsored position changed</span>
            </div>
            <button
              onClick={() => setShowOutbidAlert(false)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-amber-800">
            A competing business in <strong>Indore → Hotels → Vijay Nagar</strong> has placed a higher maximum bid.
          </p>

          <div className="bg-white rounded-xl p-3 border border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-neutral-500 block">Your Position:</span>
              <strong className="text-amber-700 font-black text-sm">🥈 #2</strong>
            </div>
            <div>
              <span className="text-neutral-500 block">Required for #1:</span>
              <strong className="text-neutral-900 font-black text-sm">₹601 / mo</strong>
            </div>
            <div>
              <span className="text-neutral-500 block">Your Maximum Bid:</span>
              <strong className="text-neutral-900 font-black text-sm">₹{currentMaxBidRupees} / mo</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewMaxBidRupees(650);
                  setIsChangeBidModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
              >
                Increase Maximum Bid
              </button>
              <button
                onClick={() => setShowOutbidAlert(false)}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg text-xs"
              >
                Keep Position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Campaign Live Bidding Card */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Live Placement
            </span>
            <h2 className="text-lg sm:text-xl font-black text-neutral-950 mt-1.5">
              Indore &bull; Hotels &bull; Vijay Nagar
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Hotel The Grand Imperial &bull; 30-Day Monthly Bidding Cycle
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowOutbidAlert(true);
                setSimulatedPosition('2');
              }}
              className="px-3 py-1.5 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              Simulate Outbid Event
            </button>
            <button
              onClick={() => setIsChangeBidModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Change Maximum Bid</span>
            </button>
          </div>
        </div>

        {/* 4 Core Bidding Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 space-y-1">
            <span className="text-xs font-medium text-neutral-500 block">
              Current Sponsored Position
            </span>
            <div className="text-2xl font-black text-neutral-950 flex items-center gap-1.5">
              <span>{simulatedPosition === '1' ? '🥇 Sponsored #1' : '🥈 Sponsored #2'}</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold pt-1">
              {simulatedPosition === '1' ? 'Active #1 visibility in Indore' : 'Active #2 visibility'}
            </p>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 space-y-1">
            <span className="text-xs font-medium text-neutral-500 block">
              Current Required Price
            </span>
            <div className="text-2xl font-black text-blue-700 font-mono">
              ₹{simulatedPosition === '1' ? '401' : '301'} <span className="text-xs font-normal text-neutral-500 font-sans">/ month</span>
            </div>
            <p className="text-[11px] text-neutral-500 pt-1">
              Minimum amount required to maintain rank
            </p>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 space-y-1">
            <span className="text-xs font-medium text-neutral-500 block">
              Your Maximum Bid (Spending Ceiling)
            </span>
            <div className="text-2xl font-black text-neutral-900 font-mono">
              ₹{currentMaxBidRupees} <span className="text-xs font-normal text-neutral-500 font-sans">/ month</span>
            </div>
            <p className="text-[11px] text-neutral-500 pt-1">
              You will never pay more than this cap
            </p>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">
              Immutable Bid History & Audit Log
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Atomic server-authoritative log of all bid updates and position changes
            </p>
          </div>
        </div>

        {bids.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No bids recorded for your account yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Business</th>
                  <th className="py-3 px-6 text-right">Maximum Bid</th>
                  <th className="py-3 px-6 text-right">Sponsored Position</th>
                  <th className="py-3 px-6 text-center">Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {bids.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50">
                    <td className="py-3.5 px-6 font-mono text-neutral-500 text-[11px]">
                      {new Date(b.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-neutral-900">
                      {b.websiteTitle || 'Hotel The Grand Imperial'}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      {formatINR(b.maxBidPaise)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-900">
                        {b.rankAwarded === 1 ? '🥇 #1' : b.rankAwarded === 2 ? '🥈 #2' : `Rank #${b.rankAwarded}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          b.isAutoBid
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {b.isAutoBid ? 'Auto-Defend' : 'Manual'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CHANGE MAXIMUM BID MODAL */}
      {isChangeBidModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-950">
                Increase Maximum Bid
              </h3>
              <button
                onClick={() => setIsChangeBidModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Current Maximum:</span>
                <strong className="text-neutral-900 font-mono">₹{currentMaxBidRupees} / month</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Placement Target:</span>
                <strong className="text-neutral-900">Indore &bull; Hotels</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                New Maximum Bid (Spending Ceiling) (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
                  ₹
                </span>
                <input
                  type="number"
                  min={currentMaxBidRupees + 10}
                  step="50"
                  value={newMaxBidRupees}
                  onChange={(e) => setNewMaxBidRupees(Math.max(100, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-base font-bold font-mono text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 mt-2.5">
                {[550, 650, 800, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setNewMaxBidRupees(amt)}
                    className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-mono"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-blue-900">
              You will never be charged more than your maximum bid, subject to campaign pricing rules.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsChangeBidModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBid}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Maximum Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
