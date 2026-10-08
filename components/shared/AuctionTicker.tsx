'use client';

import React, { useEffect, useState } from 'react';
import { BidRecord } from '@/types';
import { formatINR } from '@/lib/currency';
import { TrendingUp, Radio } from 'lucide-react';
import Link from 'next/link';

export function AuctionTicker() {
  const [bids, setBids] = useState<BidRecord[]>([]);

  useEffect(() => {
    async function loadRecentBids() {
      try {
        const res = await fetch('/api/rankings?category=hotels&location=indore');
        if (res.ok) {
          const data = await res.json();
          if (data.recentBids) {
            setBids(data.recentBids);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadRecentBids();
    const interval = setInterval(loadRecentBids, 10000);
    return () => clearInterval(interval);
  }, []);

  if (bids.length === 0) return null;

  return (
    <div className="bg-neutral-50 border-b border-neutral-200 py-2 overflow-hidden text-xs">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-rose-600 font-semibold shrink-0">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span className="uppercase tracking-wider text-[11px]">Live Bid Stream</span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-neutral-600">
          {bids.map((b) => (
            <div key={b.id} className="flex items-center gap-2 shrink-0">
              <span className="font-medium text-neutral-900">{b.websiteTitle}</span>
              <span className="text-neutral-400">bid</span>
              <span className="font-semibold text-emerald-700 font-mono tabular-nums">
                {formatINR(b.maxBidPaise)}
              </span>
              <span className="text-neutral-400">→ Awarded #{b.rankAwarded}</span>
              {b.isAutoBid && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                  Auto-Bid
                </span>
              )}
              <span className="text-neutral-300">·</span>
            </div>
          ))}
        </div>

        <Link
          href="/indore/hotels"
          className="text-neutral-500 hover:text-neutral-900 shrink-0 font-medium flex items-center gap-1"
        >
          View Board <TrendingUp className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
