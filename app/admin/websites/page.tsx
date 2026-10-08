'use client';

import React, { useState, useEffect } from 'react';
import { Website } from '@/types';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ExternalLink, Star } from 'lucide-react';

export default function AdminWebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);

  const fetchWebsites = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setWebsites(data.allWebsites || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const updateStatus = async (id: string, status: Website['status']) => {
    try {
      await fetch(`/api/admin/websites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchWebsites();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await fetch(`/api/admin/websites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });
      fetchWebsites();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
          Directory Governance
        </span>
        <h1 className="text-2xl font-bold text-neutral-900">
          Website Management & Moderation
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Review HTTPS compliance, verify legitimate businesses, and suspend fraudulent domains.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-6">Website / URL</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Verified</th>
                <th className="py-3 px-6">Featured</th>
                <th className="py-3 px-6 text-right">Views / Clicks</th>
                <th className="py-3 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {websites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-neutral-500">
                    No businesses or websites currently registered. The directory is clean.
                  </td>
                </tr>
              ) : (
                websites.map((web) => (
                  <tr key={web.id} className="hover:bg-neutral-50">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-neutral-900">{web.title || web.name}</div>
                      <a
                        href={web.url || web.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 font-mono text-[11px] hover:underline flex items-center gap-1"
                      >
                        <span>{web.url || web.website || 'No URL'}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </a>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          web.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : web.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {web.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      {web.isVerified ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="text-neutral-400">No</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() => toggleFeatured(web.id, web.isFeatured)}
                        className={`p-1 rounded cursor-pointer ${web.isFeatured ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-500'}`}
                        title="Toggle Featured"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-neutral-600 tabular-nums">
                      {web.totalViews} / {web.totalWebsiteClicks ?? web.totalClicks ?? 0}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {web.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus(web.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                          >
                            Approve
                          </button>
                        )}
                        {web.status !== 'suspended' && (
                          <button
                            onClick={() => updateStatus(web.id, 'suspended')}
                            className="px-2.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded text-[11px] font-semibold"
                          >
                            Suspend
                          </button>
                        )}
                        {web.status !== 'rejected' && (
                          <button
                            onClick={() => updateStatus(web.id, 'rejected')}
                            className="px-2.5 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-semibold"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
