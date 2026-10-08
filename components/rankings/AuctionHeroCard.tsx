'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/currency';
import { useAuth } from '@/lib/auth/context';
import { Clock, ShieldCheck, Zap, ArrowRight, Info } from 'lucide-react';

interface AuctionHeroCardProps {
  categoryName: string;
  locationName: string;
  highestBidPaise: number;
  minNextBidPaise: number;
  totalCompetitors: number;
  userCurrentBidPaise?: number;
  userCurrentRank?: number;
  onQuickBidClick: (targetBidPaise: number) => void;
}

export function AuctionHeroCard({
  categoryName,
  locationName,
  highestBidPaise,
  minNextBidPaise,
  totalCompetitors,
  userCurrentBidPaise,
  userCurrentRank,
  onQuickBidClick,
}: AuctionHeroCardProps) {
  const { currentUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState('02d 14h 32m 45s');

  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 2);
    target.setHours(target.getHours() + 14);
    target.setMinutes(target.getMinutes() + 32);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target.getTime() - now;
      if (diff <= 0) {
        setTimeLeft('Auction Expired');
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 border border-neutral-800 shadow-xl relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Auction Info */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="uppercase tracking-widest text-[11px] font-semibold">Active Ranking Auction</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">{totalCompetitors} Bidders Competing</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Sponsored Rankings: {categoryName} in {locationName}
          </h1>

          <p className="text-neutral-400 text-sm leading-relaxed mb-4">
            Compete for top sponsored placement in your city. Set your monthly maximum bid ceiling — you only pay the minimum required price to hold your position.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Time Remaining:</span>
              <strong className="text-white font-mono tabular-nums tracking-wide">{timeLeft}</strong>
            </div>
            <span className="text-neutral-600">·</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant Outbid Defense</span>
            </div>
          </div>
        </div>

        {/* Right: Prominent Bid Display */}
        <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-5 sm:p-6 w-full lg:w-96 shrink-0 backdrop-blur-sm">
          <div className="space-y-3.5 mb-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Current Required Price (#1)</span>
              <span className="text-white font-bold text-base font-mono tabular-nums">
                {highestBidPaise > 0 ? formatINR(highestBidPaise) : 'No bids yet'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">
                {userCurrentBidPaise ? 'Your Maximum Bid' : 'Your Status'}
              </span>
              <span className="font-semibold text-neutral-200 font-mono tabular-nums">
                {userCurrentBidPaise ? (
                  <>
                    {formatINR(userCurrentBidPaise)}{' '}
                    <span className="text-xs text-amber-400">(Rank #{userCurrentRank})</span>
                  </>
                ) : (
                  <span className="text-neutral-400 font-normal">Not participating yet</span>
                )}
              </span>
            </div>

            <div className="h-px bg-neutral-700/60" />

            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-medium">Required Bid for #1</span>
              <span className="text-amber-300 font-bold text-lg font-mono tabular-nums">
                {formatINR(minNextBidPaise)}
              </span>
            </div>
          </div>

          <button
            onClick={() => onQuickBidClick(minNextBidPaise)}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-neutral-950" />
            SET MAXIMUM BID ({formatINR(minNextBidPaise)}) →
          </button>

          <p className="mt-2.5 text-[11px] text-neutral-400 text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3 text-neutral-500" />
            {currentUser?.role === 'PUBLISHER' || currentUser?.role === 'BUSINESS_OWNER' || currentUser?.role === 'ADMIN'
              ? 'Instant deduction from verified business wallet.'
              : 'Sign in as a business owner to place maximum bids.'}
          </p>
        </div>
      </div>
    </div>
  );
}
