'use client';

import React, { useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { DataManagementCard } from '@/components/admin/DataManagementCard';

export default function AdminSettingsPage() {
  const [commission, setCommission] = useState(15);
  const [gst, setGst] = useState(18);
  const [defaultMinBid, setDefaultMinBid] = useState(100);
  const [defaultIncrement, setDefaultIncrement] = useState(10);
  const [outbidAlerts, setOutbidAlerts] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setCommission(data.settings.platformCommissionPercent);
            setGst(data.settings.gstPercent);
            setDefaultMinBid(data.settings.defaultMinBidPaise / 100);
            setDefaultIncrement(data.settings.defaultIncrementPaise / 100);
            setOutbidAlerts(data.settings.instantOutbidAlerts);
            setMaintenance(data.settings.maintenanceMode);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformCommissionPercent: commission,
          gstPercent: gst,
          defaultMinBidPaise: defaultMinBid * 100,
          defaultIncrementPaise: defaultIncrement * 100,
          instantOutbidAlerts: outbidAlerts,
          maintenanceMode: maintenance,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
          Platform Parameters
        </span>
        <h1 className="text-2xl font-bold text-neutral-900">
          Global Admin & Auction Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Commission rules, tax rates, and bidding engine parameters.
        </p>
      </div>

      <DataManagementCard />

      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm max-w-2xl">
        {saved && (
          <div className="p-3 mb-6 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Platform settings updated successfully across live auction clusters.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-commission" className="block font-semibold text-neutral-700 mb-1">
                Platform Commission Fee (%)
              </label>
              <input
                id="settings-commission"
                type="number"
                min="0"
                max="50"
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Default platform cut on winning second-price spend
              </span>
            </div>

            <div>
              <label htmlFor="settings-gst" className="block font-semibold text-neutral-700 mb-1">
                Indian GST on Platform Fee (%)
              </label>
              <input
                id="settings-gst"
                type="number"
                min="0"
                max="28"
                value={gst}
                onChange={(e) => setGst(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Standard Goods and Services Tax (18%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            <div>
              <label htmlFor="settings-default-min-bid" className="block font-semibold text-neutral-700 mb-1">
                Default Minimum Starting Bid (₹)
              </label>
              <input
                id="settings-default-min-bid"
                type="number"
                min="1"
                value={defaultMinBid}
                onChange={(e) => setDefaultMinBid(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="settings-default-increment" className="block font-semibold text-neutral-700 mb-1">
                Default Bid Increment (₹)
              </label>
              <input
                id="settings-default-increment"
                type="number"
                min="1"
                value={defaultIncrement}
                onChange={(e) => setDefaultIncrement(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={outbidAlerts}
                onChange={(e) => setOutbidAlerts(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-neutral-900"
              />
              <span className="font-semibold text-neutral-800">
                Dispatch instant real-time outbid notifications to publishers
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-neutral-900"
              />
              <span className="font-semibold text-neutral-800">
                Maintenance mode (freeze all incoming new bids)
              </span>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
