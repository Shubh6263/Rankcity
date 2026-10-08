'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { BusinessVerification } from '@/types';
import {
  FileCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AdminVerificationQueuePage() {
  const { currentUser } = useAuth();
  const [verifications, setVerifications] = useState<BusinessVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Review modal state
  const [reviewingItem, setReviewingItem] = useState<BusinessVerification | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadVerifications = async () => {
    try {
      const res = await fetch('/api/verification');
      if (res.ok) {
        const data = await res.json();
        setVerifications(data.verifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/verification/${reviewingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewDecision,
          notes: reviewNotes.trim() || undefined,
          reviewerId: currentUser.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVerifications((prev) =>
          prev.map((v) => (v.id === reviewingItem.id ? data.verification : v))
        );
        setFeedback(
          reviewDecision === 'approved'
            ? `Verified ${reviewingItem.businessName}! Verified trust badge activated.`
            : `Rejected verification for ${reviewingItem.businessName}. Reason logged.`
        );
        setReviewingItem(null);
        setReviewNotes('');
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = verifications.filter((v) => {
    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    const matchesQuery =
      !searchQuery ||
      v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.submitterName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const pendingCount = verifications.filter((v) => v.status === 'pending').length;
  const approvedCount = verifications.filter((v) => v.status === 'approved').length;
  const rejectedCount = verifications.filter((v) => v.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Business Verification Queue
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Review legal enterprise credentials (GSTIN, Municipal Trade License, Entity PAN) to approve verified trust badges and unlock sponsored auctions.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Pending Queue
          </span>
          <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
          <span className="text-[10px] text-neutral-500 block">Awaiting official review</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Approved Partners
          </span>
          <span className="text-2xl font-black text-emerald-600">{approvedCount}</span>
          <span className="text-[10px] text-neutral-500 block">Trust badge active</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Declined Applications
          </span>
          <span className="text-2xl font-black text-rose-600">{rejectedCount}</span>
          <span className="text-[10px] text-neutral-500 block">Failed documentation check</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search business or document number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500 font-semibold">Filter:</span>
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-all cursor-pointer ${
                selectedStatus === st
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-600" />
            <span>Verification Applications</span>
          </h3>
          <span className="text-xs text-neutral-400 font-medium">{filtered.length} submissions</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Loading queue...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400">
            No verification requests found in this status view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Registration / ID</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">{v.businessName}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-800 uppercase text-[11px] bg-neutral-100 px-2 py-0.5 rounded-md">
                        {v.documentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-700">{v.documentNumber}</td>
                    <td className="py-3.5 px-4 text-neutral-600">{v.submitterName}</td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {new Date(v.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setReviewingItem(v);
                          setReviewDecision('approved');
                          setReviewNotes('');
                        }}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Inspect & Decide
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setReviewingItem(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-neutral-900">
              Audit Verification: {reviewingItem.businessName}
            </h3>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Document Type:</span>
                <span className="font-bold text-neutral-800 uppercase">{reviewingItem.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Document Number:</span>
                <span className="font-mono font-bold text-neutral-900">{reviewingItem.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Submitted By:</span>
                <span className="font-medium text-neutral-800">{reviewingItem.submitterName}</span>
              </div>
              {reviewingItem.notes && (
                <div className="pt-1 border-t border-neutral-200">
                  <span className="text-neutral-500 block">Applicant Notes:</span>
                  <span className="italic text-neutral-700">"{reviewingItem.notes}"</span>
                </div>
              )}
              {reviewingItem.documentUrl && (
                <div className="pt-1">
                  <a
                    href={reviewingItem.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    <span>View Submitted Document / PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Moderation Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('approved')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      reviewDecision === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Grant Badge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('rejected')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      reviewDecision === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Application</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Reviewer Notes / Rejection Reason
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewDecision === 'approved'
                      ? 'e.g. GST certificate matched with MCA registry database.'
                      : 'e.g. Document number mismatch with applicant trade name.'
                  }
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Recording Decision...' : 'Save Decision & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
