'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/currency';
import { AdminPlatformStats, Business, FraudAlert, BidRecord } from '@/types';
import { DataManagementCard } from '@/components/admin/DataManagementCard';
import {
  TrendingUp,
  CreditCard,
  Building2,
  Users,
  ShieldAlert,
  Phone,
  MessageCircle,
  Navigation,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [recentBids, setRecentBids] = useState<BidRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPendingBusinesses(data.pendingBusinesses || data.pendingWebsites || []);
        setFraudAlerts(data.fraudAlerts || []);
        setRecentBids(data.recentBids || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleBusinessStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await fetch(`/api/businesses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !stats) {
    return <div className="p-8 text-center text-xs text-neutral-500">Loading local marketplace control panel...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            System Operations
          </span>
          <h1 className="text-2xl font-bold text-neutral-900">
            Marketplace Control Console
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Local business directory approvals, live Vickrey auction health, and lead analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/categories"
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors"
          >
            Categories & Bids
          </Link>
          <Link
            href="/admin/fraud"
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Anti-Fraud Alerts ({stats.fraudAlertsCount})
          </Link>
        </div>
      </div>

      {/* Data & Environment Management */}
      <DataManagementCard onDataChanged={fetchAdminData} />

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Auction GMV
          </span>
          <div className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums">
            {formatINR(stats.gmvPaise)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Active monthly sponsor contracts
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Platform Revenue (15%)
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
            {formatINR(stats.commissionRevenuePaise)}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block font-mono">
            {formatINR(stats.todayRevenuePaise)} today
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Active Auctions
          </span>
          <div className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums">
            {stats.activeCampaigns}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block font-mono">
            {stats.totalBidsCount} total competitive bids
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Registered Businesses
          </span>
          <div className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums">
            {stats.totalBusinesses}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {stats.totalPublishers} business owner accounts
          </span>
        </div>
      </div>

      {/* Customer Leads Metrics (Requirement #17) */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-neutral-900">
          Local Leads Delivered Across India
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
                {stats.totalCalls.toLocaleString()}
              </div>
              <span className="text-xs text-neutral-500">Direct Phone Connections</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
                {stats.totalWhatsapp.toLocaleString()}
              </div>
              <span className="text-xs text-neutral-500">WhatsApp Inquiries</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
                {stats.totalDirections.toLocaleString()}
              </div>
              <span className="text-xs text-neutral-500">Maps Direction Navigations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Business Approvals */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Pending Business Listings</h2>
            <p className="text-xs text-neutral-500">Verify physical address, business credentials, and phone numbers</p>
          </div>
          <Link href="/admin/websites" className="text-xs font-semibold text-neutral-900 hover:text-amber-600">
            View All Businesses →
          </Link>
        </div>

        {pendingBusinesses.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-500">
            ✓ All local business listings reviewed. No submissions pending verification.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 text-xs">
            {pendingBusinesses.map((biz) => (
              <div key={biz.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-neutral-900">{biz.name}</h3>
                  <p className="text-neutral-500 text-[11px]">{biz.address}, {biz.city} · Phone: {biz.phone}</p>
                  <p className="text-neutral-600 text-xs mt-1">{biz.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleBusinessStatus(biz.id, 'rejected')}
                    className="px-3 py-1.5 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg font-bold hover:bg-rose-100 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleBusinessStatus(biz.id, 'approved')}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Approve & Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bids Feed */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900">Live Auction Bid Streams</h2>
          <span className="text-[11px] text-neutral-500">Real-time Vickrey adjustments</span>
        </div>

        {recentBids.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No live bids recorded yet. Bids placed by business owners will appear here in real time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Business</th>
                  <th className="py-3 px-6">Owner</th>
                  <th className="py-3 px-6 text-right">Max Bid</th>
                  <th className="py-3 px-6 text-right">Awarded Rank</th>
                  <th className="py-3 px-6 text-center">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {recentBids.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50">
                    <td className="py-3.5 px-6 font-mono text-neutral-500 text-[11px]">
                      {new Date(b.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-neutral-900">
                      {b.businessName || b.websiteTitle}
                    </td>
                    <td className="py-3.5 px-6 text-neutral-600">
                      {b.publisherName}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      {formatINR(b.maxBidPaise)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold">
                      #{b.rankAwarded}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${b.isAutoBid ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'}`}>
                        {b.isAutoBid ? 'Auto-Bid' : 'Manual'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
