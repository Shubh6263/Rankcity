'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Website, Campaign, Business } from '@/types';
import { formatINR } from '@/lib/currency';
import { useAuth } from '@/lib/auth/context';
import { Star, Heart, CheckCircle2, TrendingUp, Phone, MessageCircle, Navigation } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/cache/dataCache';

interface RankingItem {
  campaign: Campaign;
  website: Website;
  business?: Business;
  publisher: {
    id: string;
    name: string;
    companyName?: string;
  };
}

interface RankingListProps {
  items: RankingItem[];
  onBidClick: (campaign: Campaign) => void;
  onRecordClick: (websiteId: string, targetUrl: string) => void;
}

export function RankingList({ items, onBidClick, onRecordClick }: RankingListProps) {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8">
        <p className="text-neutral-500 text-sm mb-4">No active sponsored businesses matching your filters.</p>
        <Link
          href="/publisher/campaigns/new"
          className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          Be the First to Bid for Rank #1
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(({ campaign, website, publisher }) => {
        const isOwner = currentUser.id === campaign.publisherId;
        const rank = campaign.currentRank;
        const biz = website;
        const isFav = !!favorites[biz.id];

        const coverImage = getOptimizedImageUrl(
          biz.coverImage,
          biz.categoryId,
          400,
          65
        );

        // Tags
        const tags = biz.services && biz.services.length > 0
          ? biz.services.slice(0, 3)
          : ['Verified Merchant', 'Quality Service', 'Top Rated'];

        const isSponsored = rank <= 3;

        return (
          <div
            key={campaign.id}
            className="bg-white rounded-2xl border border-neutral-100 hover:border-neutral-200 shadow-xs hover:shadow-md transition-all p-4 flex flex-col sm:flex-row items-stretch gap-4 group relative"
          >
            {/* Left: Thumbnail Image */}
            <div className="relative w-full sm:w-52 md:w-56 h-40 sm:h-36 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
              <img
                src={coverImage}
                alt={biz.name}
                loading={rank <= 2 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Right: Business Details matching Mockup Screen 2 */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                {/* Top Row: #Rank Sponsored Badge (Left) & Heart Button (Right) */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {isSponsored && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                        {rank === 1 ? '🥇 Sponsored #1' : rank === 2 ? '🥈 Sponsored #2' : '🥉 Sponsored #3'}
                      </span>
                    )}
                    {biz.isVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Heart Outline Button matching Mockup Screen 2 */}
                  <button
                    onClick={(e) => toggleFavorite(e, biz.id)}
                    className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform hover:scale-110 ${
                        isFav ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Business Name */}
                <h3 className="text-base font-bold text-neutral-900 group-hover:text-blue-600 transition-colors truncate">
                  <Link href={`/business/${biz.slug}`}>
                    {biz.name}
                  </Link>
                </h3>

                {/* Rating & Review Count */}
                <div className="flex items-center gap-1.5 text-xs mt-0.5">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-bold text-neutral-900">{biz.rating || 4.8}</span>
                  </div>
                  <span className="text-neutral-400 font-normal">
                    ({biz.reviewCount ? (biz.reviewCount >= 1000 ? `${(biz.reviewCount / 1000).toFixed(1)}K` : biz.reviewCount) : '1.2K'} reviews)
                  </span>
                </div>

                {/* Locality */}
                <div className="text-xs text-neutral-500 truncate mt-0.5">
                  {biz.locality ? `${biz.locality}, ${biz.city || 'Indore'}` : biz.address || 'Indore, Madhya Pradesh'}
                </div>
              </div>

              {/* Bottom Row: Tag Pills on Left, View Details CTA on Right */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-1 border-t border-neutral-100/80">
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                  {/* Subtle owner / bidder control */}
                  <button
                    onClick={() => onBidClick(campaign)}
                    className="text-[10px] text-neutral-400 hover:text-blue-600 hover:underline cursor-pointer ml-1"
                    title="Sponsored Ranking"
                  >
                    {isOwner ? '⚡ Manage Bid' : ''}
                  </button>
                </div>

                <Link
                  href={`/business/${biz.slug}`}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center shadow-xs transition-all whitespace-nowrap cursor-pointer shrink-0"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
