'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { formatINR } from '@/lib/currency';
import { Campaign, Business, NotificationItem } from '@/types';
import { QuickBidModal } from '@/components/publisher/QuickBidModal';
import { WalletTopupModal } from '@/components/publisher/WalletTopupModal';
import {
  TrendingUp,
  MoreHorizontal,
  Plus,
  ArrowUpRight,
  Building2,
  Phone,
  Sparkles,
  ShieldCheck,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface BusinessDashboardData {
  stats: {
    activeCampaignsCount: number;
    totalBusinessesCount: number;
    bestRank: number | null;
    totalSpendPaise: number;
    totalViews: number;
    totalCalls: number;
    totalWhatsapp: number;
    totalDirections: number;
    totalWebsiteClicks: number;
    totalLeads: number;
    ctr: string;
    walletBalancePaise: number;
    walletAvailablePaise: number;
    walletReservedPaise: number;
  };
  campaigns: Array<Campaign & {
    businessName: string;
    businessAddress: string;
    categoryName: string;
    locationName: string;
    currentHighestBidPaise?: number;
    minNextBidPaise?: number;
  }>;
  businesses: Business[];
  notifications: NotificationItem[];
}

export default function BusinessOwnerDashboard() {
  const { currentUser, isLoaded } = useAuth();
  const [data, setData] = useState<BusinessDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedCampaignForBid, setSelectedCampaignForBid] = useState<(Campaign & {
    currentHighestBidPaise?: number;
    minNextBidPaise?: number;
  }) | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const fetchDashboardData = React.useCallback(async () => {
    if (!currentUser.id || currentUser.id === 'guest_user') {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/publisher/dashboard?publisherId=${currentUser.id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-white rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const businesses = data?.businesses || [];
  const campaigns = data?.campaigns || [];
  const stats = data?.stats || {
    activeCampaignsCount: 0,
    totalBusinessesCount: 0,
    bestRank: null,
    totalSpendPaise: 0,
    totalViews: 0,
    totalCalls: 0,
    totalWhatsapp: 0,
    totalDirections: 0,
    totalWebsiteClicks: 0,
    totalLeads: 0,
    ctr: '0.0%',
    walletBalancePaise: 0,
    walletAvailablePaise: 0,
    walletReservedPaise: 0,
  };

  const primaryBusiness = businesses[0];
  const activeCampaign = campaigns.find((c) => c.status === 'active') || campaigns[0];

  return (
    <div className="space-y-6">
      {/* If new user has no business listed yet: Friendly Onboarding Welcome Screen */}
      {businesses.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-blue-500/30">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Welcome to RankCity, {currentUser.name || 'Partner'}!
            </span>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight">
              List Your Business & Start Capturing Verified Local Customers
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Your business dashboard is ready. Add your first local listing to unlock direct customer calls, WhatsApp leads, direction requests, and top sponsored visibility in your city.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/add-business"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your Business (Free)</span>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-700/60 hover:bg-blue-700/80 text-white font-semibold text-xs border border-white/20 transition-all"
              >
                <span>View Sponsored Ranks & Pricing</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Business Owner Greeting & Active Campaign Banner */
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-950">
                Good morning, {primaryBusiness?.name || currentUser.companyName || currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                ✓ Verified Business
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {primaryBusiness ? `${primaryBusiness.locality}, ${primaryBusiness.city}` : 'Local Business'}
            </p>
          </div>

          {/* Current Sponsored Campaign Highlight Card */}
          <div className="bg-neutral-900 text-white rounded-2xl p-5 border border-neutral-800 flex items-center gap-6 shrink-0 w-full md:w-auto justify-between shadow-md">
            <div>
              <div className="text-[11px] text-neutral-400 font-medium">Current Sponsored Campaign</div>
              <div className="text-xl font-black text-amber-400 flex items-center gap-1.5">
                {activeCampaign ? (
                  <span>🥇 #{activeCampaign.currentRank} Ranked</span>
                ) : (
                  <span className="text-neutral-400 text-sm font-semibold">No Active Campaign</span>
                )}
              </div>
              <div className="text-xs text-neutral-300 font-mono mt-0.5">
                {activeCampaign ? (
                  <>
                    Current: <strong>{formatINR(activeCampaign.effectiveBidPaise)}/mo</strong> · Max: {formatINR(activeCampaign.maxBidPaise)}/mo
                  </>
                ) : (
                  'Start campaign to get #1 position'
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/publisher/campaigns"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-xs"
              >
                Manage Campaign
              </Link>
              <Link
                href="/publisher/bids"
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-xl text-xs font-bold text-center border border-neutral-700 transition-colors"
              >
                Increase Maximum Bid
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Profile Views */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-medium text-neutral-500 block">
            Profile Views
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              {stats.totalViews.toLocaleString('en-IN')}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              ↑ 18%
            </span>
          </div>
        </div>

        {/* Card 2: Calls */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-medium text-neutral-500 block">
            Calls
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              {stats.totalCalls.toLocaleString('en-IN')}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              ↑ 12%
            </span>
          </div>
        </div>

        {/* Card 3: WhatsApp Clicks */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-medium text-neutral-500 block">
            WhatsApp Clicks
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              {stats.totalWhatsapp.toLocaleString('en-IN')}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              ↑ 22%
            </span>
          </div>
        </div>

        {/* Card 4: Direction Requests */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-medium text-neutral-500 block">
            Direction Requests
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              {stats.totalDirections.toLocaleString('en-IN')}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              ↑ 16%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profile Views Timeline Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900">
            Profile Views
          </h2>

          <div className="relative h-60 w-full pt-2">
            <svg className="w-full h-44 overflow-visible" viewBox="0 0 520 160" fill="none">
              <text x="35" y="14" textAnchor="end" className="text-[10px] fill-neutral-400 font-medium">2,000</text>
              <text x="35" y="46" textAnchor="end" className="text-[10px] fill-neutral-400 font-medium">1,500</text>
              <text x="35" y="79" textAnchor="end" className="text-[10px] fill-neutral-400 font-medium">1,000</text>
              <text x="35" y="111" textAnchor="end" className="text-[10px] fill-neutral-400 font-medium">500</text>
              <text x="35" y="144" textAnchor="end" className="text-[10px] fill-neutral-400 font-medium">0</text>

              <line x1="45" y1="10" x2="510" y2="10" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="45" y1="42.5" x2="510" y2="42.5" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="45" y1="75" x2="510" y2="75" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="45" y1="107.5" x2="510" y2="107.5" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="45" y1="140" x2="510" y2="140" stroke="#E2E8F0" strokeWidth="1" />

              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 50 120 C 100 115, 120 70, 160 85 C 200 100, 230 40, 270 55 C 310 70, 350 30, 390 45 C 430 60, 460 20, 500 25 L 500 140 L 50 140 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M 50 120 C 100 115, 120 70, 160 85 C 200 100, 230 40, 270 55 C 310 70, 350 30, 390 45 C 430 60, 460 20, 500 25"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {[
                { x: 50, y: 120 },
                { x: 160, y: 85 },
                { x: 270, y: 55 },
                { x: 390, y: 45 },
                { x: 500, y: 25 },
              ].map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                />
              ))}
            </svg>

            <div className="flex justify-between pl-11 pr-2 pt-2 text-[11px] font-medium text-neutral-400 border-t border-neutral-100">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Right: Traffic Sources Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-neutral-900">
            Traffic Sources
          </h2>

          <div className="flex items-center justify-around gap-4 py-2">
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="18" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="18"
                  strokeDasharray="107.4 238.7"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="18"
                  strokeDasharray="59.7 238.7"
                  strokeDashoffset="-107.4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#FB923C"
                  strokeWidth="18"
                  strokeDasharray="47.7 238.7"
                  strokeDashoffset="-167.1"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="18"
                  strokeDasharray="23.9 238.7"
                  strokeDashoffset="-214.8"
                />
              </svg>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB] shrink-0" />
                <span className="text-neutral-600">Search</span>
                <span className="font-bold text-neutral-900 ml-auto">45%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#38BDF8] shrink-0" />
                <span className="text-neutral-600">Categories</span>
                <span className="font-bold text-neutral-900 ml-auto">25%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#FB923C] shrink-0" />
                <span className="text-neutral-600">Sponsored</span>
                <span className="font-bold text-neutral-900 ml-auto">20%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#94A3B8] shrink-0" />
                <span className="text-neutral-600">Others</span>
                <span className="font-bold text-neutral-900 ml-auto">10%</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 text-center pt-2 border-t border-neutral-100">
            Real-time direct customer acquisition
          </div>
        </div>
      </div>

      {/* Section: Active Campaigns Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900">
            Active Campaigns
          </h2>

          <Link
            href="/publisher/campaigns/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Create Campaign</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          {campaigns.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">No active campaigns yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Promote your business on top of search and category results to gain maximum calls and leads.
              </p>
              <Link
                href="/publisher/campaigns/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <span>Launch First Campaign</span>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/70 text-neutral-400 border-b border-neutral-100 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-6">Business</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6">Max Bid</th>
                  <th className="py-3 px-6">Rank</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Spend</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-neutral-900">
                      {camp.businessName}
                    </td>
                    <td className="py-3.5 px-6 text-neutral-600">
                      {camp.categoryName}
                    </td>
                    <td className="py-3.5 px-6 text-neutral-600">
                      {camp.locationName}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-neutral-900 font-mono">
                      {formatINR(camp.maxBidPaise)}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-amber-600">
                      #{camp.currentRank}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          camp.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-neutral-700">
                      {formatINR(camp.spentPaise)}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => {
                          setSelectedCampaignForBid(camp);
                          setIsBidModalOpen(true);
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-900 rounded-md transition-colors cursor-pointer"
                        title="Campaign Options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bidding Modal */}
      <QuickBidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        campaign={selectedCampaignForBid}
        currentHighestBidPaise={selectedCampaignForBid?.currentHighestBidPaise || 1000}
        minNextBidPaise={selectedCampaignForBid?.minNextBidPaise || 1100}
        onBidSuccess={fetchDashboardData}
        onOpenWallet={() => {
          setIsBidModalOpen(false);
          setIsWalletModalOpen(true);
        }}
      />

      {/* Wallet Top-Up Modal */}
      <WalletTopupModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
