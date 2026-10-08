'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { formatINR } from '@/lib/currency';
import { PositionHistoryPoint } from '@/types';
import { BarChart3, TrendingUp, Eye, Phone, MessageCircle, Navigation, Globe } from 'lucide-react';

export default function PublisherAnalyticsPage() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<PositionHistoryPoint[]>([
    { date: 'Oct 1', rank: 4, effectiveBidRupees: 500 },
    { date: 'Oct 2', rank: 3, effectiveBidRupees: 1200 },
    { date: 'Oct 3', rank: 2, effectiveBidRupees: 1800 },
    { date: 'Oct 4', rank: 1, effectiveBidRupees: 2300 },
    { date: 'Oct 5', rank: 1, effectiveBidRupees: 2301 },
  ]);

  const [stats, setStats] = useState({
    views: 8420,
    calls: 624,
    whatsapp: 412,
    directions: 890,
    websiteClicks: 512,
    totalLeads: 2438,
    ctr: '28.9%',
    avgRank: 1.2,
    spend: 142000,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/publisher/dashboard?publisherId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.campaigns?.[0]?.positionHistory?.length > 0) {
            setHistory(data.campaigns[0].positionHistory);
          }
          if (data.stats) {
            setStats({
              views: data.stats.totalViews,
              calls: data.stats.totalCalls,
              whatsapp: data.stats.totalWhatsapp,
              directions: data.stats.totalDirections,
              websiteClicks: data.stats.totalWebsiteClicks,
              totalLeads: data.stats.totalLeads,
              ctr: data.stats.ctr,
              avgRank: data.stats.bestRank || 1,
              spend: data.stats.totalSpendPaise,
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [currentUser.id]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
          Customer Acquisition
        </span>
        <h1 className="text-2xl font-bold text-neutral-900">
          Local Leads & Rank Movement
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Measure calls, WhatsApp inquiries, direction navigations, and position history.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Total Profile Views
          </span>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {stats.views.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            +18% from local search
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Customer Inquiries (Leads)
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {stats.totalLeads.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block font-mono">
            {stats.ctr} conversion rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Sponsored Position
          </span>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
            #{stats.avgRank}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Prime top placement
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Effective Spend
          </span>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {formatINR(stats.spend)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Second-price billed
          </span>
        </div>
      </div>

      {/* Leads Breakdown Cards */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-neutral-900">
          Conversion Channels
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-neutral-900">{stats.calls}</div>
              <span className="text-[11px] text-neutral-500">Phone Calls</span>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-neutral-900">{stats.whatsapp}</div>
              <span className="text-[11px] text-neutral-500">WhatsApp Chats</span>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-neutral-900">{stats.directions}</div>
              <span className="text-[11px] text-neutral-500">Direction Requests</span>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-neutral-900">{stats.websiteClicks}</div>
              <span className="text-[11px] text-neutral-500">Website Visits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Ranking Graph */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Auction Rank History
            </h2>
            <p className="text-xs text-neutral-500">
              Daily sponsored rank trajectory in your primary regional category
            </p>
          </div>
          <span className="text-xs font-semibold text-neutral-500">
            October 1 – October 5, 2026
          </span>
        </div>

        <div className="relative pt-6 pb-2">
          <div className="grid grid-cols-5 gap-3 h-52 items-end pt-4 border-b border-neutral-200">
            {history.map((point, idx) => {
              const heightPercent = ((6 - point.rank) / 5) * 80 + 20;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div className="mb-2 text-xs font-bold font-mono text-neutral-900 group-hover:scale-110 transition-transform">
                    {point.rank === 1 ? '🥇 #1' : `#${point.rank}`}
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[48px] rounded-t-xl transition-all ${
                      point.rank === 1
                        ? 'bg-amber-500 shadow-md ring-2 ring-amber-400/40'
                        : point.rank === 2
                        ? 'bg-slate-400'
                        : 'bg-neutral-300'
                    }`}
                  />

                  <div className="mt-3 text-xs font-medium text-neutral-600 font-mono">
                    {point.date}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    ₹{point.effectiveBidRupees}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
