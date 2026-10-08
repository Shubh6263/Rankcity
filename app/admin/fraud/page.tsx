'use client';

import React, { useState, useEffect } from 'react';
import { FraudAlert } from '@/types';
import { ShieldAlert, CheckCircle2, Ban, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';

export default function AdminFraudPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);

  const fetchFraudAlerts = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.fraudAlerts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFraudAlerts();
  }, []);

  const handleAction = async (id: string, action: 'resolved' | 'banned') => {
    try {
      await fetch(`/api/admin/fraud/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: action } : a))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
          Market Integrity
        </span>
        <h1 className="text-2xl font-bold text-neutral-900">
          Anti-Fraud & Bid Velocity Detection
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Heuristic risk-scoring for automated bid manipulation, click botting, and duplicate entities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Active Risk Flags
          </span>
          <div className="text-2xl font-bold text-rose-600 font-mono">
            {alerts.filter((a) => a.status === 'flagged').length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Awaiting administrative review
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Velocity Safeguard
          </span>
          <div className="text-2xl font-bold text-neutral-900 font-mono">
            8 bids/min
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Automatic IP throttling threshold
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 block mb-1">
            Click Integrity Engine
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            99.8%
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Verified human referral score
          </span>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900">Detected Signals Queue</h2>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            ✓ No suspicious bidding patterns detected. Marketplace operates normally.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 text-xs">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">
                      Publisher: {alert.publisherId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        alert.riskScore > 50
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      Risk Score: {alert.riskScore}/100
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      IP: {alert.ipAddress}
                    </span>
                  </div>
                  <p className="text-neutral-600 text-xs leading-relaxed">
                    {alert.reason}
                  </p>
                  <span className="text-[11px] text-neutral-400 block">
                    Detected: {new Date(alert.detectedAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'flagged' ? (
                    <>
                      <button
                        onClick={() => handleAction(alert.id, 'resolved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors"
                      >
                        Verify Human
                      </button>
                      <button
                        onClick={() => handleAction(alert.id, 'banned')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-colors"
                      >
                        Freeze Account
                      </button>
                    </>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-neutral-100 text-neutral-600 font-semibold uppercase text-[10px]">
                      {alert.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
