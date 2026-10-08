'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { formatINR, rupeesToPaise, paiseToRupees, calculateCommissionBreakdown } from '@/lib/currency';
import { Business, Category, LocationHierarchy, PaymentRequest } from '@/types';
import {
  Zap,
  Shield,
  ArrowRight,
  AlertCircle,
  Info,
  Calculator,
  Building2,
  QrCode,
  Copy,
  CheckCircle2,
  ExternalLink,
  Clock,
  X,
} from 'lucide-react';
import Link from 'next/link';

function CreateCampaignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBusinessId = searchParams.get('businessId') || searchParams.get('websiteId') || '';

  const { currentUser, wallet, refreshUserData } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationHierarchy[]>([]);

  // Form states
  const [businessId, setBusinessId] = useState(preselectedBusinessId);
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [maxBidRupees, setMaxBidRupees] = useState(10); // Base initial campaign amount: ₹10
  const [autoBid, setAutoBid] = useState(true);
  const [maxBudgetRupees, setMaxBudgetRupees] = useState(50);

  const [currentHighestBidPaise, setCurrentHighestBidPaise] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual UPI Payment Modal State
  const [createdPayment, setCreatedPayment] = useState<PaymentRequest | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [screenshotInput, setScreenshotInput] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, cRes] = await Promise.all([
          fetch(`/api/businesses?ownerId=${currentUser.id}`),
          fetch('/api/categories'),
        ]);
        if (bRes.ok && cRes.ok) {
          const bJson = await bRes.json();
          const cJson = await cRes.json();
          setBusinesses(bJson.businesses || []);
          setCategories(cJson.categories || []);
          setLocations(cJson.locations || []);

          if (!businessId && bJson.businesses?.[0]) {
            setBusinessId(bJson.businesses[0].id);
          }
          if (cJson.categories?.[0]) {
            setCategoryId(cJson.categories[0].id);
            if (cJson.categories[0].subcategories?.[0]) {
              setSubcategoryId(cJson.categories[0].subcategories[0].id);
            }
          }
          if (cJson.locations?.[0]) {
            setLocationId(cJson.locations[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [currentUser.id, businessId]);

  useEffect(() => {
    async function checkHighestBid() {
      const cat = categories.find((c) => c.id === categoryId);
      const loc = locations.find((l) => l.id === locationId);
      if (!cat || !loc) return;

      try {
        const res = await fetch(`/api/rankings?category=${cat.slug}&location=${loc.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.highestBidPaise && data.highestBidPaise > 0) {
            setCurrentHighestBidPaise(data.highestBidPaise);
            const minRequired = paiseToRupees(data.minNextBidPaise || data.highestBidPaise + 100);
            setMaxBidRupees(Math.max(10, minRequired));
            setMaxBudgetRupees(Math.max(20, minRequired * 2));
          } else {
            setCurrentHighestBidPaise(0);
            setMaxBidRupees(10);
            setMaxBudgetRupees(50);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    checkHighestBid();
  }, [categoryId, locationId, categories, locations]);

  const targetPaise = rupeesToPaise(maxBidRupees);
  const selectedCat = categories.find((c) => c.id === categoryId);
  const minRequiredBidPaise = selectedCat?.minBidPaise || 1000; // ₹10 base minimum

  const willBeRank1 = currentHighestBidPaise === 0 || targetPaise > currentHighestBidPaise;
  const expectedPosition = willBeRank1 ? 1 : 2;
  const estimatedEffectivePricePaise = willBeRank1
    ? (currentHighestBidPaise > 0 ? Math.min(targetPaise, currentHighestBidPaise + (selectedCat?.bidIncrementPaise || 100)) : minRequiredBidPaise)
    : minRequiredBidPaise;

  const breakdown = calculateCommissionBreakdown(
    estimatedEffectivePricePaise,
    selectedCat?.commissionPercent || 15,
    18
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessId) {
      setError('Please select or register a business listing first.');
      return;
    }

    if (targetPaise < minRequiredBidPaise) {
      setError(`Minimum bid must be at least ${formatINR(minRequiredBidPaise)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          publisherId: currentUser.id,
          categoryId,
          subcategoryId: subcategoryId || undefined,
          locationId,
          maxBidPaise: targetPaise,
          durationDays,
          autoBidEnabled: autoBid,
          maxBudgetPaise: rupeesToPaise(maxBudgetRupees),
          paymentMethod: 'UPI',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create promotion campaign');
      }

      await refreshUserData();

      if (data.payment) {
        setCreatedPayment(data.payment);
      } else {
        router.push('/publisher/campaigns');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdPayment) return;
    setUtrError(null);

    if (!utrInput.trim() || utrInput.trim().length < 6) {
      setUtrError('Please enter a valid UPI UTR / Transaction Reference number (minimum 6 digits).');
      return;
    }

    setIsSubmittingUtr(true);
    try {
      const res = await fetch(`/api/payments/${createdPayment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: utrInput.trim(),
          screenshotUrl: screenshotInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment UTR');
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        router.push('/publisher/campaigns');
      }, 2000);
    } catch (err) {
      setUtrError((err as Error).message);
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  const copyUpiId = () => {
    const upiId = createdPayment?.upiId || process.env.NEXT_PUBLIC_UPI_ID || 'patreshubham141@okhdfcbank';
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
          Sponsored Positioning
        </span>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
          Start Sponsored Campaign
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Choose your city, category, and target position with a monthly maximum bid. Initial campaigns start at just ₹10.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 7 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Business Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="biz-select" className="text-xs font-bold text-neutral-800">
                1. Select Business Listing *
              </label>
              <Link href="/add-business" className="text-xs text-blue-600 font-bold hover:underline">
                + Add Business
              </Link>
            </div>
            {businesses.length === 0 ? (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-500">
                No business registered yet.{' '}
                <Link href="/add-business" className="text-neutral-900 font-bold underline">
                  Add your first business free
                </Link>
              </div>
            ) : (
              <select
                id="biz-select"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none text-neutral-900 font-semibold"
                required
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.address} ({b.city})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="promo-cat" className="block text-xs font-bold text-neutral-800 mb-1.5">
                2. Target Category *
              </label>
              <select
                id="promo-cat"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  const c = categories.find((cat) => cat.id === e.target.value);
                  if (c?.subcategories?.[0]) setSubcategoryId(c.subcategories[0].id);
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none text-neutral-800 font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="promo-subcat" className="block text-xs font-bold text-neutral-800 mb-1.5">
                Subcategory
              </label>
              <select
                id="promo-subcat"
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none text-neutral-800 font-medium"
              >
                <option value="">All Subcategories</option>
                {selectedCat?.subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="promo-loc" className="block text-xs font-bold text-neutral-800 mb-1.5">
              3. Target Location Scope *
            </label>
            <select
              id="promo-loc"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none text-neutral-800 font-semibold"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.city}, {loc.state} ({loc.locality || 'All Localities'})
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Duration */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              4. Campaign Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 7, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationDays(d)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    durationDays === d
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {d} {d === 1 ? 'Day' : 'Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Maximum Bid Input (starts at ₹10) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="promo-max-bid" className="text-xs font-bold text-neutral-800">
                5. Maximum Bid Ceiling (₹) *
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">
                {currentHighestBidPaise > 0
                  ? `Current #1: ${formatINR(currentHighestBidPaise)}`
                  : 'Initial Uncontested Floor: ₹10'}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
                ₹
              </span>
              <input
                id="promo-max-bid"
                type="number"
                min="10"
                step="1"
                value={maxBidRupees}
                onChange={(e) => setMaxBidRupees(Math.max(10, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-base font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none text-neutral-900"
                required
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Maximum bid is your spending ceiling. You only pay the amount required by market competition (starting at ₹10).
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-[11px] text-neutral-400 font-semibold">Quick select:</span>
            {[10, 50, 100, 250, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setMaxBidRupees(amt)}
                className={`px-3 py-1 text-xs rounded-lg font-mono font-bold transition-colors cursor-pointer ${
                  maxBidRupees === amt
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          {/* Auto-bidding Configuration */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoBid}
                onChange={(e) => setAutoBid(e.target.checked)}
                className="mt-0.5 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  Enable Outbid Auto-Defense
                </span>
                <span className="text-[11px] text-neutral-500">
                  Automatically outbids competitors by minimum increment to preserve your rank, up to your budget ceiling.
                </span>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || businesses.length === 0}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{isSubmitting ? 'Generating Payment Request...' : 'Proceed to UPI Payment Request'}</span>
          </button>
        </form>

        {/* Right 5 cols: Live Preview & Accounting Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900 text-white rounded-3xl p-6 border border-neutral-800 shadow-xl space-y-5">
            <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Live Pricing Breakdown
              </span>
              <span className="text-[10px] text-neutral-400">Monthly Ceiling</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Current Market Price:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {currentHighestBidPaise > 0 ? formatINR(currentHighestBidPaise) : '₹10 (Initial Open Floor)'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Your Maximum Bid:</span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">
                  ₹{maxBidRupees.toLocaleString()}
                </span>
              </div>

              <div className="h-px bg-neutral-800" />

              <div className="flex justify-between items-center">
                <span className="text-neutral-300 font-semibold">Expected Position:</span>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  {expectedPosition === 1 ? '🥇 Sponsored #1' : '🥈 Sponsored #2'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Required Campaign Amount:</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {formatINR(breakdown.baseBidPaise)}
                </span>
              </div>
            </div>

            {/* Campaign Cost Breakdown Box */}
            <div className="p-4 bg-neutral-800/80 rounded-2xl border border-neutral-700/80 space-y-2 text-[11px]">
              <div className="font-semibold text-neutral-300 flex items-center gap-1.5 mb-1">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>Accounting & Tax Breakdown</span>
              </div>
              <div className="flex justify-between text-neutral-400 font-mono">
                <span>Campaign Amount:</span>
                <span>{formatINR(breakdown.baseBidPaise)}</span>
              </div>
              <div className="flex justify-between text-neutral-400 font-mono">
                <span>Platform Fee (15%):</span>
                <span>{formatINR(breakdown.platformFeePaise)}</span>
              </div>
              <div className="flex justify-between text-neutral-400 font-mono">
                <span>GST (18% on Fee):</span>
                <span>{formatINR(breakdown.gstPaise)}</span>
              </div>
              <div className="h-px bg-neutral-700 my-1" />
              <div className="flex justify-between text-white font-bold font-mono text-xs">
                <span>Total Payable:</span>
                <span className="text-amber-400 text-sm">{formatINR(breakdown.totalChargePaise)}</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              <strong>Fair Attention Model:</strong> Information is free, attention is paid. You never pay more than your spending ceiling.
            </p>
          </div>
        </div>
      </div>

      {/* Manual UPI Payment Modal */}
      {createdPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Manual UPI Payment Verification
                </span>
                <h3 className="text-base font-bold">
                  Payment Request: {createdPayment.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreatedPayment(null)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {paymentSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-neutral-900">
                    Payment Submitted Successfully!
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Your UTR has been recorded under status <strong>PAYMENT_SUBMITTED</strong>. Our administration team will verify the transaction and activate your sponsored ranking shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitUtr} className="space-y-4">
                  {utrError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{utrError}</span>
                    </div>
                  )}

                  {/* Summary Card */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Campaign Amount:</span>
                      <span className="font-mono font-semibold text-neutral-900">{formatINR(createdPayment.amountPaise)}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Platform Fee (15%):</span>
                      <span className="font-mono font-semibold text-neutral-900">{formatINR(createdPayment.platformFeePaise)}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-600">
                      <span>GST (18%):</span>
                      <span className="font-mono font-semibold text-neutral-900">{formatINR(createdPayment.gstPaise)}</span>
                    </div>
                    <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-sm font-bold text-neutral-950">
                      <span>Total Payable:</span>
                      <span className="font-mono text-emerald-700 text-base">{formatINR(createdPayment.totalAmountPaise)}</span>
                    </div>
                  </div>

                  {/* UPI Details Box */}
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                        Pay via UPI
                      </span>
                      <span className="text-[10px] text-blue-700 font-semibold">Zero Gateway Markups</span>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-200">
                      <span className="font-mono font-bold text-blue-950 text-sm">
                        {createdPayment.upiId || 'rankcity@upi'}
                      </span>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <a
                      href={`upi://pay?pa=${encodeURIComponent(createdPayment.upiId || process.env.NEXT_PUBLIC_UPI_ID || 'patreshubham141@okhdfcbank')}&pn=${encodeURIComponent(process.env.NEXT_PUBLIC_PAYEE_NAME || 'Shubham Patre')}&am=${(createdPayment.totalAmountPaise / 100).toFixed(2)}&cu=INR&mode=02&purpose=00`}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center font-bold block transition-colors"
                    >
                      Pay Directly via UPI App
                    </a>
                  </div>

                  {/* UTR Input (Mandatory) */}
                  <div className="space-y-1">
                    <label htmlFor="utr-input" className="block font-bold text-neutral-800">
                      Transaction Reference / UTR Number *
                    </label>
                    <input
                      id="utr-input"
                      type="text"
                      placeholder="e.g. 429381029381"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                    <span className="text-[10px] text-neutral-500 block">
                      Found in your Google Pay, PhonePe, or Paytm receipt.
                    </span>
                  </div>

                  {/* Screenshot Link (Optional supporting evidence) */}
                  <div className="space-y-1">
                    <label htmlFor="screenshot-input" className="block font-bold text-neutral-800">
                      Payment Screenshot URL (Optional Evidence)
                    </label>
                    <input
                      id="screenshot-input"
                      type="url"
                      placeholder="https://..."
                      value={screenshotInput}
                      onChange={(e) => setScreenshotInput(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingUtr || !utrInput.trim()}
                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-xl font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isSubmittingUtr ? 'Submitting...' : 'Submit Payment for Admin Verification'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Loading campaign creator...</div>}>
      <CreateCampaignForm />
    </Suspense>
  );
}
