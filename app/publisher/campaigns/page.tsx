'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { formatINR } from '@/lib/currency';
import { Campaign } from '@/types';
import { QuickBidModal } from '@/components/publisher/QuickBidModal';
import { WalletTopupModal } from '@/components/publisher/WalletTopupModal';
import { TrendingUp, Plus, ExternalLink, Shield, Zap } from 'lucide-react';

export default function PublisherCampaignsListPage() {
  const { currentUser } = useAuth();
  const [campaigns, setCampaigns] = useState<Array<Campaign & {
    websiteTitle: string;
    categoryName: string;
    locationName: string;
    currentHighestBidPaise?: number;
    minNextBidPaise?: number;
  }>>([]);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<(Campaign & {
    currentHighestBidPaise?: number;
    minNextBidPaise?: number;
  }) | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`/api/campaigns?publisherId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [currentUser.id]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Rankings
          </span>
          <h1 className="text-2xl font-bold text-neutral-900">
            Active Campaigns
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor and raise bids across your regional directory auctions.
          </p>
        </div>

        <Link
          href="/publisher/campaigns/new"
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Campaign</span>
        </Link>
      </div>

      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <p className="text-neutral-500 text-xs mb-4">No active campaigns found.</p>
            <Link
              href="/publisher/campaigns/new"
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
            >
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-neutral-100 font-mono font-bold text-xs text-neutral-900">
                    {camp.currentRank === 1 ? '🥇 Rank #1' : `#${camp.currentRank}`}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      camp.status === 'ACTIVE' || camp.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : camp.status === 'PAYMENT_SUBMITTED' || camp.status === 'UNDER_REVIEW'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : camp.status === 'PAYMENT_PENDING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : camp.status === 'OUTBID'
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {camp.status}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900">
                    {camp.websiteTitle}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    in {camp.categoryName} ({camp.locationName})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-5 text-xs font-mono">
                  <span className="text-neutral-500">
                    Max Bid: <strong className="text-neutral-900">{formatINR(camp.maxBidPaise)}</strong>
                  </span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-neutral-500">
                    Effective Price: <strong className="text-emerald-700 font-bold">{formatINR(camp.effectiveBidPaise)}/mo</strong>
                  </span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-neutral-500">
                    Duration: <strong className="text-neutral-900">{camp.durationDays} Days</strong>
                  </span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-neutral-500">
                    Auto-Bid: <strong className={camp.autoBidEnabled ? 'text-emerald-700' : 'text-neutral-400'}>{camp.autoBidEnabled ? 'Enabled' : 'Disabled'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedCamp(camp);
                    setIsBidModalOpen(true);
                  }}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Increase Bid</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <QuickBidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        campaign={selectedCamp}
        currentHighestBidPaise={selectedCamp?.currentHighestBidPaise || selectedCamp?.maxBidPaise || 1000}
        minNextBidPaise={selectedCamp?.minNextBidPaise || (selectedCamp?.maxBidPaise ? selectedCamp.maxBidPaise + 100 : 1100)}
        onBidSuccess={fetchCampaigns}
        onOpenWallet={() => {
          setIsBidModalOpen(false);
          setIsWalletModalOpen(true);
        }}
      />

      <WalletTopupModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
}
