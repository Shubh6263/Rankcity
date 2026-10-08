'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  X,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function CampaignBiddingPage() {
  const params = useParams();
  const campaignId = (params?.id as string) || 'c_demo';
  const router = useRouter();

  const [currentMaxBid, setCurrentMaxBid] = useState(500);
  const [newMaxBid, setNewMaxBid] = useState(650);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulatedRank, setSimulatedRank] = useState<'1' | '2'>('1');
  const [showOutbidBanner, setShowOutbidBanner] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleConfirmBid = () => {
    setCurrentMaxBid(newMaxBid);
    setSimulatedRank('1');
    setShowOutbidBanner(false);
    setIsModalOpen(false);
    setNotification(`Maximum bid increased to ₹${newMaxBid}/month! You are now holding Sponsored #1.`);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Breadcrumb Back */}
        <Link
          href="/publisher"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Business Dashboard
        </Link>

        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {notification}
          </div>
        )}

        {/* Outbid Alert Experience */}
        {showOutbidBanner && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-black text-base">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>⚠️ Your sponsored position changed</span>
              </div>
              <button
                onClick={() => setShowOutbidBanner(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-amber-800">
              Another verified business has placed a higher maximum bid. You are now in position <strong>#2</strong>.
            </p>

            <div className="bg-white rounded-2xl p-4 border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-neutral-500 block">Your Current Position:</span>
                <strong className="text-amber-800 text-base font-black">🥈 #2</strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Current Required Price for #1:</span>
                <strong className="text-neutral-950 text-base font-black font-mono">₹601 / month</strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Your Maximum Bid:</span>
                <strong className="text-neutral-950 text-base font-black font-mono">₹{currentMaxBid} / month</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  setNewMaxBid(650);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Increase Maximum Bid
              </button>
              <button
                onClick={() => setShowOutbidBanner(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Keep Current Position
              </button>
            </div>
          </div>
        )}

        {/* Header Placement Info */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Sponsored Ranking Placement
              </span>
              <h1 className="text-2xl font-black text-neutral-950 mt-2">
                Indore &bull; Hotels &bull; Vijay Nagar
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Campaign ID: {campaignId} &bull; 30-Day Monthly Maximum Bid
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowOutbidBanner(true);
                  setSimulatedRank('2');
                }}
                className="px-3 py-2 text-xs font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50"
              >
                Simulate Outbid Event
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Change Maximum Bid</span>
              </button>
            </div>
          </div>

          {/* Core Position Metrics Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-1">
              <span className="text-xs font-medium text-neutral-500">Current Position</span>
              <div className="text-2xl font-black text-neutral-950">
                {simulatedRank === '1' ? '🥇 #1' : '🥈 #2'}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                {simulatedRank === '1' ? 'Top Sponsored Placement' : 'Second Sponsored Spot'}
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-1">
              <span className="text-xs font-medium text-neutral-500">Current Required Price</span>
              <div className="text-2xl font-black text-blue-700 font-mono">
                ₹{simulatedRank === '1' ? '401' : '301'} <span className="text-xs font-normal text-neutral-500 font-sans">/ month</span>
              </div>
              <p className="text-[11px] text-neutral-500 pt-1">
                Determined by active auction rules
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-1">
              <span className="text-xs font-medium text-neutral-500">Your Maximum Bid</span>
              <div className="text-2xl font-black text-neutral-900 font-mono">
                ₹{currentMaxBid} <span className="text-xs font-normal text-neutral-500 font-sans">/ month</span>
              </div>
              <p className="text-[11px] text-neutral-500 pt-1">
                Your spending ceiling
              </p>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-900 leading-relaxed">
              Your maximum bid is confidential. Competing businesses only see the current price required to compete for the next position.
            </p>
          </div>
        </div>
      </main>

      {/* CHANGE MAXIMUM BID MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-950">
                Increase Maximum Bid
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Current Maximum:</span>
                <strong className="text-neutral-900 font-mono">₹{currentMaxBid} / month</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Placement:</span>
                <strong className="text-neutral-900">Indore &bull; Hotels &bull; Vijay Nagar</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                New Maximum Bid (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
                  ₹
                </span>
                <input
                  type="number"
                  min={currentMaxBid + 10}
                  step="50"
                  value={newMaxBid}
                  onChange={(e) => setNewMaxBid(Math.max(100, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-base font-bold font-mono text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 mt-2.5">
                {[550, 650, 800, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setNewMaxBid(amt)}
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
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBid}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
