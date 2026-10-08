'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Campaign } from '@/types';
import { formatINR } from '@/lib/currency';
import {
  Pause,
  Play,
  Clock,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Ban,
  RotateCcw,
  X,
  Search,
} from 'lucide-react';

export default function AdminAuctionsPage() {
  const { currentUser } = useAuth();
  const [campaigns, setCampaigns] = useState<
    Array<
      Campaign & {
        websiteTitle: string;
        categoryName: string;
        locationName: string;
      }
    >
  >([]);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Suspension modal
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('Terms of Service / Ad policy review');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAuctions = async () => {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${suspendingId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suspend',
          reason: suspendReason,
          adminId: currentUser.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCampaigns((prev) =>
          prev.map((c) => (c.id === suspendingId ? { ...c, status: 'suspended' } : c))
        );
        const log = `Admin SUSPENDED campaign ${suspendingId} (Reason: ${suspendReason}) at ${new Date().toLocaleTimeString()}`;
        setActionLog((l) => [log, ...l]);
        setSuspendingId(null);
        fetchAuctions(); // Reload rankings
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResume = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resume',
          adminId: currentUser.id,
        }),
      });

      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? { ...c, status: 'active' } : c))
        );
        const log = `Admin RESUMED campaign ${campaignId} at ${new Date().toLocaleTimeString()}`;
        setActionLog((l) => [log, ...l]);
        fetchAuctions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const extendAuction = async (campaignId: string) => {
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendDays: 7 }),
      });
      fetchAuctions();
      const log = `Admin EXTENDED duration by +7 days for campaign ${campaignId}`;
      setActionLog((l) => [log, ...l]);
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = campaigns.filter((c) => {
    if (!searchQuery) return true;
    return (
      c.websiteTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Marketplace Operations
          </span>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Live Auction Engine & Campaign Controls
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Server-authoritative Vickrey second-price auction monitoring, campaign suspensions, and duration extensions.
          </p>
        </div>

        <div className="text-xs text-neutral-600 bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200">
          Active Campaigns: <strong className="text-neutral-900">{campaigns.filter((c) => c.status === 'active').length}</strong>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search campaign or business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-neutral-900"
            />
          </div>
          <span className="text-xs text-neutral-400 font-medium">Rankings auto-recalculated atomically</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-6">Rank & ID</th>
                <th className="py-3 px-6">Business</th>
                <th className="py-3 px-6">Category & City</th>
                <th className="py-3 px-6 text-right">Max Bid</th>
                <th className="py-3 px-6 text-right">Effective 2nd-Price</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right">Admin Interventions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-500">
                    No campaigns found.
                  </td>
                </tr>
              ) : (
                filtered.map((camp) => (
                  <tr key={camp.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-900 text-xs">
                        #{camp.currentRank}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-neutral-900">
                      {camp.websiteTitle}
                    </td>
                    <td className="py-3.5 px-6 text-neutral-500">
                      <div className="font-medium text-neutral-800">{camp.categoryName}</div>
                      <div className="text-[11px] text-neutral-400">{camp.locationName}</div>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      {formatINR(camp.maxBidPaise)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-700 tabular-nums">
                      {formatINR(camp.effectiveBidPaise)}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                          camp.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : camp.status === 'suspended'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {camp.status === 'suspended' ? (
                          <button
                            onClick={() => handleResume(camp.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Resume</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSuspendingId(camp.id);
                              setSuspendReason('Terms of Service / Ad policy compliance');
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs cursor-pointer flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Suspend</span>
                          </button>
                        )}

                        <button
                          onClick={() => extendAuction(camp.id)}
                          className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold text-xs cursor-pointer"
                        >
                          +7 Days
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Audit Trail */}
      {actionLog.length > 0 && (
        <div className="bg-neutral-900 text-white rounded-3xl p-5 border border-neutral-800 text-xs font-mono space-y-2">
          <div className="text-amber-400 font-bold uppercase text-[10px] tracking-wider mb-1">
            Realtime Operational Events
          </div>
          {actionLog.map((log, idx) => (
            <div key={idx} className="text-neutral-300">
              › {log}
            </div>
          ))}
        </div>
      )}

      {/* Suspension Modal */}
      {suspendingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setSuspendingId(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-neutral-900">Suspend Sponsored Campaign</h3>
            <p className="text-xs text-neutral-500">
              Suspending this campaign immediately removes it from sponsored ranking placement and recalculates Vickrey auction prices atomically.
            </p>

            <form onSubmit={handleSuspend} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Official Suspension Reason</label>
                <textarea
                  required
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-rose-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendingId(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Suspending...' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
