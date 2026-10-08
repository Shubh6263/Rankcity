'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Review, Business } from '@/types';
import {
  Star,
  MessageSquare,
  CornerDownRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  X,
} from 'lucide-react';

export default function BusinessReviewsManagementPage() {
  const { currentUser } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reply modal state
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setLeadFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [bizRes, revRes] = await Promise.all([
        fetch(`/api/businesses?ownerId=${currentUser.id}`),
        fetch('/api/reviews'),
      ]);

      if (bizRes.ok && revRes.ok) {
        const bData = await bizRes.json();
        const rData = await revRes.json();
        const bizList = bData.businesses || [];
        setBusinesses(bizList);

        const myBizIds = new Set(bizList.map((b: any) => b.id));
        const myReviews = (rData.reviews || []).filter((r: Review) =>
          myBizIds.has(r.businessId)
        );
        setReviews(myReviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewId || !replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${activeReviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyText: replyText.trim(),
          authorName: currentUser.name || 'Business Management',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews((prev) =>
          prev.map((r) => (r.id === activeReviewId ? { ...r, reply: data.review.reply } : r))
        );
        setActiveReviewId(null);
        setReplyText('');
        setLeadFeedback('Owner response posted successfully!');
        setTimeout(() => setLeadFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Customer Reviews & Reputation
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Monitor consumer sentiment, read verified guest reviews, and publicly respond as the business owner.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Average Score
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-neutral-900">{avgRating}</span>
            <div className="flex text-amber-500 text-sm">★★★★★</div>
          </div>
          <span className="text-[10px] text-neutral-500 block">Out of 5 Stars</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Total Reviews
          </span>
          <span className="text-2xl font-black text-neutral-900">{reviews.length}</span>
          <span className="text-[10px] text-blue-600 block font-semibold">Published customer experiences</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Response Rate
          </span>
          <span className="text-2xl font-black text-emerald-600">
            {reviews.length > 0
              ? `${Math.round((reviews.filter((r) => Boolean(r.reply)).length / reviews.length) * 100)}%`
              : '100%'}
          </span>
          <span className="text-[10px] text-neutral-500 block">Owner engagement rate</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-neutral-200 p-8 space-y-2">
            <Star className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="font-bold text-neutral-800 text-sm">No reviews submitted yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Reviews will appear here as customers rate your business on their profiles.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">{rev.userName}</span>
                    <span className="text-xs text-neutral-400">for {rev.businessName}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex text-amber-500 text-sm">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed bg-neutral-50/70 p-3 rounded-xl border border-neutral-100">
                "{rev.comment}"
              </p>

              {/* Owner Reply if present */}
              {rev.reply ? (
                <div className="p-3.5 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Your Response ({rev.reply.authorName})</span>
                  </div>
                  <p className="text-xs text-blue-950/80">{rev.reply.text}</p>
                </div>
              ) : (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setActiveReviewId(rev.id);
                      setReplyText('');
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Post Owner Response</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {activeReviewId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setActiveReviewId(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-neutral-900">Respond to Customer Review</h3>
            <p className="text-xs text-neutral-500">
              Your response will be permanently visible under the customer's review on your public profile.
            </p>

            <form onSubmit={handleReplySubmit} className="space-y-4 pt-1">
              <textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank the customer or address their experience constructively..."
                className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewId(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Publish Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
