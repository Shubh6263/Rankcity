'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Review } from '@/types';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminReviewModerationPage() {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerate = async (reviewId: string, newStatus: 'approved' | 'flagged' | 'rejected') => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          moderatorId: currentUser.id,
        }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
        setFeedback(`Review marked as ${newStatus.toUpperCase()}`);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchesQuery =
      !searchQuery ||
      r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Review & Content Moderation
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Maintain review integrity under PRD Section 7 & 21. Detect coordinated spam, enforce authentic local consumer guidelines, and audit reputation scores.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reviews by author or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500 font-semibold">Status:</span>
          {['all', 'approved', 'flagged', 'rejected'].map((st) => (
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

      {/* Reviews Moderation Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Customer Reviews Moderation Queue</span>
          </h3>
          <span className="text-xs text-neutral-400 font-medium">{filtered.length} entries</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400">No reviews found matching filter.</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((rev) => (
              <div key={rev.id} className="p-5 space-y-3 hover:bg-neutral-50/50 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">{rev.userName}</span>
                    <span className="text-xs text-neutral-400">→</span>
                    <span className="font-semibold text-xs text-blue-600">{rev.businessName}</span>
                    <span className="text-[11px] text-neutral-400">
                      ({new Date(rev.createdAt).toLocaleDateString('en-IN')})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        rev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rev.status === 'flagged'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100 leading-relaxed">
                  "{rev.comment}"
                </p>

                {rev.reply && (
                  <div className="text-[11px] text-blue-900 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                    <strong>Owner Reply:</strong> {rev.reply.text}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <span className="text-xs text-neutral-400 mr-1">Moderator Actions:</span>
                  <button
                    onClick={() => handleModerate(rev.id, 'approved')}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleModerate(rev.id, 'flagged')}
                    className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Flag For Audit
                  </button>
                  <button
                    onClick={() => handleModerate(rev.id, 'rejected')}
                    className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    De-list / Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
