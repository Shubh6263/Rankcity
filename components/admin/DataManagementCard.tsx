'use client';

import React, { useState, useEffect } from 'react';
import { Database, Trash2, Sparkles, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface DataCounts {
  businesses: number;
  campaigns: number;
  activeCampaigns: number;
  bids: number;
  transactions: number;
  notifications: number;
  fraudAlerts: number;
  isClean: boolean;
}

interface DataManagementCardProps {
  onDataChanged?: () => void;
  className?: string;
}

export function DataManagementCard({ onDataChanged, className = '' }: DataManagementCardProps) {
  const [counts, setCounts] = useState<DataCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const fetchCounts = async () => {
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setCounts(data.counts);
      }
    } catch (e) {
      console.error('Failed to load data counts:', e);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleAction = async (action: 'clear' | 'seed') => {
    setIsLoading(true);
    setStatusMessage(null);
    setShowConfirmClear(false);

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Action failed');
      }

      setCounts(data.counts);
      setStatusMessage({
        type: 'success',
        text: data.message || (action === 'clear' ? 'Dummy data removed.' : 'Sample data seeded.'),
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rankauction:datachanged', { detail: { action, counts: data.counts } }));
      }

      if (onDataChanged) {
        onDataChanged();
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An error occurred while managing sample data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900">
                Sample & Dummy Data Manager
              </h2>
              {counts && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    counts.isClean
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {counts.isClean ? 'Clean Directory (0 Dummy Items)' : 'Sample Data Active'}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              One-click controls to wipe test records for clean production or re-seed realistic local merchants & auctions.
            </p>
          </div>
        </div>

        {/* Live Counts Snapshot */}
        {counts && (
          <div className="flex items-center gap-3 text-xs font-mono bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 shrink-0">
            <div className="text-center">
              <span className="text-[10px] text-neutral-400 block font-sans">Businesses</span>
              <strong className="text-neutral-900">{counts.businesses}</strong>
            </div>
            <span className="text-neutral-300">·</span>
            <div className="text-center">
              <span className="text-[10px] text-neutral-400 block font-sans">Campaigns</span>
              <strong className="text-neutral-900">{counts.campaigns}</strong>
            </div>
            <span className="text-neutral-300">·</span>
            <div className="text-center">
              <span className="text-[10px] text-neutral-400 block font-sans">Bids</span>
              <strong className="text-neutral-900">{counts.bids}</strong>
            </div>
          </div>
        )}
      </div>

      {statusMessage && (
        <div
          className={`p-3 my-4 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Confirmation Dialog for Clearing Data */}
      {showConfirmClear && (
        <div className="p-4 my-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Confirm Removing All Dummy Data?</span>
            </div>
            <p className="text-[11px] text-rose-800">
              This will remove all sample businesses, active campaigns, bid logs, notifications, and reset wallets to ₹0. Core categories, locations, and admin credentials will be preserved.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowConfirmClear(false)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-semibold hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleAction('clear')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Yes, Remove All Dummy Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-neutral-500">
          Switch between fresh blank directory mode and pre-populated test data anytime.
        </p>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!showConfirmClear && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowConfirmClear(true)}
              className="flex-1 sm:flex-none px-4 py-2 border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Remove Dummy Data</span>
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleAction('seed')}
            className="flex-1 sm:flex-none px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Make / Seed Dummy Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
