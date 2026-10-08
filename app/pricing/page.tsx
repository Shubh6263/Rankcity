'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import {
  PLATFORM_FEE_PERCENTAGE,
  GST_RATE,
  formatINR,
  rupeesToPaise,
  paiseToRupees,
} from '@/lib/currency';
import {
  TOP_10_RANK_TIERS,
  getRankTier,
  calculateRequiredPriceForRank,
} from '@/lib/pricing-tiers';
import {
  Check,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building2,
  AlertTriangle,
  Phone,
  MessageCircle,
  Navigation,
  Eye,
  BarChart3,
  HelpCircle,
  Calculator,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';

export default function PricingPage() {
  // Calculator state
  const [selectedCity, setSelectedCity] = useState('Indore');
  const [selectedCategory, setSelectedCategory] = useState('Hotels');
  const [selectedArea, setSelectedArea] = useState('Vijay Nagar');
  const [targetPosition, setTargetPosition] = useState<number>(1);
  const [maximumBid, setMaximumBid] = useState(10);

  // Calculate current required price dynamically using Top 10 floor & auction engine
  const activeTier = getRankTier(targetPosition);
  const requiredPriceRupees = calculateRequiredPriceForRank(targetPosition, maximumBid);

  const platformFeeRupees = Number(((requiredPriceRupees * PLATFORM_FEE_PERCENTAGE) / 100).toFixed(2));
  const gstRupees = Number(((platformFeeRupees * GST_RATE) / 100).toFixed(2));
  const totalPayableRupees = Number((requiredPriceRupees + platformFeeRupees + gstRupees).toFixed(2));

  const faqItems = [
    {
      question: 'How much does it cost to list my business?',
      answer: 'Creating a basic business listing on RankCity is 100% free forever. There are zero upfront fees, zero renewal charges, and no hidden maintenance costs.',
    },
    {
      question: 'Do I have to bid?',
      answer: 'No. Bidding is completely optional. You only bid when you want premium sponsored visibility in your selected city and category placements.',
    },
    {
      question: 'What is a maximum bid?',
      answer: 'It is the maximum spending ceiling you are willing to pay per month for your selected sponsored position. You are protected from ever being charged more than this amount.',
    },
    {
      question: 'Will I always pay my maximum bid?',
      answer: 'No. The applicable campaign price is determined by the active auction and pricing rules, which is often lower than your maximum bid (e.g., runner-up bid + ₹1 increment).',
    },
    {
      question: 'What happens if another business bids higher?',
      answer: 'Your sponsored position may change and you will instantly receive an outbid alert via SMS, email, and dashboard notification with the option to increase your maximum bid.',
    },
    {
      question: 'Can I increase my bid?',
      answer: 'Yes! You can increase or adjust your maximum bid at any time while your campaign is active through the Business Dashboard.',
    },
    {
      question: 'Is sponsored #1 the best-rated business?',
      answer: 'No. Sponsored ranking is paid visibility and is clearly labeled with an orange Sponsored badge. Consumer ratings and reviews are purely organic and calculated separately.',
    },
    {
      question: 'Can customers see that a listing is sponsored?',
      answer: 'Yes. All paid placements carry an explicit, transparent "Sponsored #1", "Sponsored #2", or "Sponsored #3" badge so customers always know it is a sponsored placement.',
    },
    {
      question: 'Can I list my business without advertising?',
      answer: 'Yes. Basic business listings remain active and searchable in your city directory for free forever, without any advertising commitments.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* Schema.org Breadcrumbs & AEO FAQ for Pricing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: 'Home', url: 'https://rankcity.in' },
              { name: 'Pricing & Plans', url: 'https://rankcity.in/pricing' },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateFAQSchema(
              faqItems.map((f) => ({
                question: f.question,
                answer: f.answer,
              }))
            )
          ),
        }}
      />

      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1">
        {/* SECTION 1 — HERO */}
        <section className="relative bg-gradient-to-b from-neutral-50 via-white to-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-100">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wide">
              Transparent Local Business Advertising
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
              Get Your Business Seen by More Local Customers
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              List your business for free. When you want more visibility, compete for sponsored positions in your city and category with a monthly maximum bid.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/add-business"
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                Add Your Business
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-sm font-bold transition-all text-center"
              >
                See How Sponsored Ranking Works
              </a>
            </div>

            <p className="text-xs text-neutral-400 font-medium pt-1">
              ✓ No fee to create your business listing.
            </p>
          </div>
        </section>

        {/* SECTION 2 — TWO CLEAR PRODUCTS */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
              Two Clear Options for Every Business
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Start free today and upgrade to sponsored ranking whenever you need more phone calls, WhatsApp leads, and foot traffic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* PRODUCT 1: Free Business Listing */}
            <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm flex flex-col justify-between hover:border-neutral-300 transition-all">
              <div className="space-y-6">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3">
                    🟢 Free Business Listing
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-neutral-950">₹0</span>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Forever
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">
                    Create your permanent business presence on RankCity with zero cost.
                  </p>
                </div>

                <div className="h-px bg-neutral-100" />

                <ul className="space-y-2.5 text-xs text-neutral-700">
                  {[
                    'Business profile',
                    'Business name & category',
                    'Address & map',
                    'Phone contact',
                    'WhatsApp contact',
                    'Directions navigation',
                    'Opening hours',
                    'Photos gallery',
                    'Services list',
                    'Customer reviews & replies',
                    'Basic profile analytics',
                    'Verified badge after verification',
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/add-business"
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold text-center block transition-all shadow-sm"
                >
                  Add Your Business
                </Link>
              </div>
            </div>

            {/* PRODUCT 2: Sponsored Ranking */}
            <div className="bg-gradient-to-b from-blue-900 via-neutral-900 to-neutral-950 text-white rounded-3xl border border-blue-800 p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
                    🟠 Sponsored Ranking
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white">Bid-Based</span>
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Monthly
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-2">
                    Get higher visibility in selected city/category placements with maximum bid control.
                  </p>
                </div>

                <div className="h-px bg-neutral-800" />

                <ul className="space-y-2.5 text-xs text-neutral-200">
                  {[
                    'Choose city & category targeting',
                    'Select sponsored position (#1, #2, #3)',
                    'Set your maximum bid ceiling',
                    'Automatic minimum-required pricing',
                    'Instant outbid alerts & notifications',
                    'Flexible campaign controls (Pause / Resume)',
                    'Comprehensive lead analytics',
                    'Calls & WhatsApp clicks tracking',
                    'Map directions tracking',
                    'Tracked campaign performance report',
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 relative z-10">
                <Link
                  href="/publisher/campaigns/new"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs sm:text-sm font-bold text-center block transition-all shadow-md"
                >
                  Start Sponsored Campaign
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — EXPLAIN THE AUCTION */}
        <section id="how-it-works" className="bg-neutral-50 py-16 px-4 sm:px-6 lg:px-8 border-y border-neutral-200">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                Simple & Fair Mechanism
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
                How Sponsored Ranking Works
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                Your maximum bid is your budget ceiling. You only pay what is required by active market competition to hold your spot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="font-bold text-sm text-neutral-900">Choose Placement</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Select your exact city, category, and locality target.
                </p>
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-xs space-y-1 font-mono text-neutral-600">
                  <div>City: Indore</div>
                  <div>Category: Hotels</div>
                  <div>Area: Vijay Nagar</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="font-bold text-sm text-neutral-900">Set Maximum Bid</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  This is the maximum amount you're willing to pay for your selected sponsored position.
                </p>
                <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 text-xs space-y-1 text-blue-900 font-medium">
                  <div className="text-[11px] text-blue-600">Maximum Bid</div>
                  <div className="text-base font-bold text-blue-950">₹500 / month</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="font-bold text-sm text-neutral-900">Current Required Price</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Your maximum bid is your ceiling. RankCity determines the minimum required price.
                </p>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-xs space-y-1 text-emerald-950">
                  <div className="text-[10px] text-emerald-700 font-bold">Live Example:</div>
                  <div className="text-[11px]">Hotel A Max: ₹500</div>
                  <div className="text-[11px]">Hotel B Max: ₹350</div>
                  <div className="font-bold text-emerald-800 pt-0.5">Hotel A holds #1 for ₹351/mo*</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-sm">
                  4
                </div>
                <h3 className="font-bold text-sm text-neutral-900">Outbid Notifications</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Get notified immediately if another business places a higher maximum bid.
                </p>
                <div className="bg-rose-50 rounded-xl p-3 border border-rose-100 text-xs space-y-1 text-rose-950">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700">
                    <AlertTriangle className="w-3 h-3" /> Outbid Alert
                  </div>
                  <div className="text-[10px] text-neutral-600">Position: #2</div>
                  <div className="text-[10px] font-semibold text-rose-800">Needed for #1: ₹501/mo</div>
                </div>
              </div>
            </div>

            {/* Confidentiality Callout */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-blue-950">
                    Confidential Maximum Bids
                  </h4>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Competitors never see your maximum bid ceiling. They only see the current price required to compete for the next position.
                  </p>
                </div>
              </div>
              <Link
                href="/add-business"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs"
              >
                List Your Business Free
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 4 & 5 — COST CALCULATOR & PLATFORM FEE */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
              Sponsored Campaign Cost Estimator
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Simulate your maximum bid and see your estimated monthly campaign cost breakdown.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Inputs Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Indore">Indore</option>
                    <option value="Bhopal">Bhopal</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="New Delhi">New Delhi</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hotels">Hotels</option>
                    <option value="Restaurants">Restaurants</option>
                    <option value="Hospitals">Hospitals</option>
                    <option value="Services">Services</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                {/* Area */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Area
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Vijay Nagar">Vijay Nagar</option>
                    <option value="Palasia">Palasia</option>
                    <option value="Rajwada">Rajwada</option>
                    <option value="Geeta Bhawan">Geeta Bhawan</option>
                    <option value="AB Road">AB Road</option>
                  </select>
                </div>
              </div>

              {/* Target Position Selection (Top 10 Ranks) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-800">
                    Target Sponsored Position (Top 10 Slots)
                  </label>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Floor: ₹{activeTier.baseFloorRupees}/mo • {activeTier.sharePercentage} Views
                  </span>
                </div>

                {/* 10 Position Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                  {TOP_10_RANK_TIERS.map((tier) => {
                    const isSelected = targetPosition === tier.position;
                    return (
                      <button
                        key={tier.position}
                        type="button"
                        onClick={() => {
                          setTargetPosition(tier.position);
                          if (maximumBid < tier.baseFloorRupees) {
                            setMaximumBid(tier.baseFloorRupees);
                          }
                        }}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md scale-102'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300'
                        }`}
                      >
                        <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                          #{tier.position}
                        </span>
                        <span className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-blue-100' : 'text-neutral-500'}`}>
                          min ₹{tier.baseFloorRupees}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 px-1">
                  <span>Selected: <strong className="text-neutral-900">{activeTier.badge}</strong> ({activeTier.tierName})</span>
                  <span>{activeTier.description}</span>
                </div>
              </div>

              {/* Maximum Bid Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-700">
                    Maximum Bid (Spending Ceiling)
                  </label>
                  <span className="text-xs font-bold text-blue-600 font-mono">
                    ₹{maximumBid.toLocaleString()} / month
                  </span>
                </div>

                <div className="relative mb-3">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    value={maximumBid}
                    onChange={(e) => setMaximumBid(Math.max(10, Number(e.target.value)))}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-base font-bold font-mono text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {[10, 50, 100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMaximumBid(amt)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-mono font-medium transition-colors cursor-pointer ${
                        maximumBid === amt
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-5 bg-neutral-50 rounded-2xl p-6 border border-neutral-200/90 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Estimated Breakdown
                </span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {selectedCity} • {targetPosition}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Your Maximum Bid (Ceiling):</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    ₹{maximumBid.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-900 font-medium">Current Required Price:</span>
                  <span className="font-mono font-bold text-neutral-950">
                    ₹{requiredPriceRupees.toFixed(2)} / month
                  </span>
                </div>

                <div className="flex justify-between items-center text-neutral-600">
                  <span>Platform Fee ({PLATFORM_FEE_PERCENTAGE}%):</span>
                  <span className="font-mono font-medium text-neutral-800">
                    ₹{platformFeeRupees.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-neutral-600">
                  <span>GST on RankCity Platform Fee ({GST_RATE}%):</span>
                  <span className="font-mono font-medium text-neutral-800">
                    ₹{gstRupees.toFixed(2)}
                  </span>
                </div>

                <div className="h-px bg-neutral-200 my-2" />

                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-sm font-bold text-neutral-950">Estimated Total:</span>
                    <p className="text-[10px] text-neutral-400 font-sans">Monthly payable</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-700 font-mono">
                      ₹{totalPayableRupees.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-sans"> / mo</span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/publisher/campaigns/new"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center block transition-all shadow-xs"
                >
                  Start This Campaign
                </Link>
              </div>

              <p className="text-[10px] text-neutral-500 leading-relaxed border-t border-neutral-200 pt-3 font-sans">
                * Current required price is based on the active auction. Actual campaign cost may change if competition changes. Maximum bid is your spending ceiling. It is not necessarily the amount you will be charged.
              </p>
            </div>
          </div>

          {/* Section 5 — Top 10 Sponsored Positions & Reserve Pricing Breakdown */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  Top 10 Sponsored Positions & Pricing Breakdown
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Each sponsored slot carries a reserve floor price and tailored visibility share in your city category.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="sm:hidden text-[10px] text-neutral-400 font-medium">← Swipe to view all →</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                  100% Transparent Auction
                </span>
              </div>
            </div>

            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Rank Slot</th>
                    <th className="py-2.5 px-3">Tier Category</th>
                    <th className="py-2.5 px-3">Est. Visibility</th>
                    <th className="py-2.5 px-3">Minimum Floor Price</th>
                    <th className="py-2.5 px-3">Platform Fee (15%)</th>
                    <th className="py-2.5 px-3 text-right">Starting Payable / mo</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  {TOP_10_RANK_TIERS.map((tier) => {
                    const floorFee = Number(((tier.baseFloorRupees * PLATFORM_FEE_PERCENTAGE) / 100).toFixed(2));
                    const floorGst = Number(((floorFee * GST_RATE) / 100).toFixed(2));
                    const floorTotal = Number((tier.baseFloorRupees + floorFee + floorGst).toFixed(2));
                    const isSelected = targetPosition === tier.position;

                    return (
                      <tr
                        key={tier.position}
                        className={`hover:bg-blue-50/50 transition-colors ${
                          isSelected ? 'bg-blue-50/80 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black ${
                              tier.position === 1
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : tier.position === 2
                                ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                : tier.position === 3
                                ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                : 'bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            {tier.badge}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-600">
                          {tier.tierName}
                        </td>
                        <td className="py-3 px-3 font-semibold text-neutral-900">
                          {tier.sharePercentage}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-neutral-950">
                          ₹{tier.baseFloorRupees.toLocaleString()}/mo
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-500">
                          ₹{floorFee.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-right text-blue-700">
                          ₹{floorTotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetPosition(tier.position);
                              if (maximumBid < tier.baseFloorRupees) {
                                setMaximumBid(tier.baseFloorRupees + 200);
                              }
                              window.scrollTo({ top: 900, behavior: 'smooth' });
                            }}
                            className={`px-3 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Simulate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5.1 — Clear Platform Fee Explanation */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-neutral-950">
              Clear & Transparent Platform Fee
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              RankCity charges a <strong>15% platform fee</strong> on the applicable sponsored campaign charge to cover infrastructure, fraud prevention, and real-time outbid protection.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <tbody>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2.5 text-neutral-600 font-sans">Sponsored campaign charge ({activeTier.badge})</td>
                    <td className="py-2.5 text-right font-bold text-neutral-900">₹{requiredPriceRupees.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2.5 text-neutral-600 font-sans">RankCity platform fee (15%)</td>
                    <td className="py-2.5 text-right font-bold text-neutral-900">₹{platformFeeRupees.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2.5 text-neutral-600 font-sans">GST on RankCity Platform Fee (18%)</td>
                    <td className="py-2.5 text-right font-bold text-neutral-900">₹{gstRupees.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-neutral-50 font-sans">
                    <td className="py-3 px-2 font-bold text-neutral-950">Estimated amount payable</td>
                    <td className="py-3 px-2 text-right font-black text-blue-700 font-mono text-sm">₹{totalPayableRupees.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 6 — LEAD GENERATION & TRACKING */}
        <section className="bg-neutral-900 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                Action-Driven Value
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Tracked Customer Actions & Real Leads
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Every rupee spent translates into measurable consumer interactions in your city.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-neutral-800/80 rounded-2xl border border-neutral-700 p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-lg font-black text-white">Direct Phone Calls</div>
                <p className="text-[11px] text-neutral-400">One-tap calling from customers</p>
              </div>

              <div className="bg-neutral-800/80 rounded-2xl border border-neutral-700 p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="text-lg font-black text-white">WhatsApp Inquiries</div>
                <p className="text-[11px] text-neutral-400">Direct chats on your phone</p>
              </div>

              <div className="bg-neutral-800/80 rounded-2xl border border-neutral-700 p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="text-lg font-black text-white">Map Directions</div>
                <p className="text-[11px] text-neutral-400">Physical visits to your outlet</p>
              </div>

              <div className="bg-neutral-800/80 rounded-2xl border border-neutral-700 p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="text-lg font-black text-white">Profile Views</div>
                <p className="text-[11px] text-neutral-400">Local consumer intent</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7 — PRICING FAQ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Clear answers about listing fees, maximum bids, and sponsored placements.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group bg-neutral-50 rounded-2xl border border-neutral-200/80 p-5 transition-colors open:bg-white open:border-blue-200"
              >
                <summary className="font-bold text-sm text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span>{item.question}</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* SECTION 8 — BOTTOM CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-black">
              Ready to Grow Your Business in Your City?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
              Join hundreds of verified hotels, restaurants, healthcare centers, and local services on RankCity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/add-business"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-700 rounded-xl font-bold text-sm shadow-md hover:bg-neutral-100 transition-all"
              >
                Add Your Business Free
              </Link>
              <Link
                href="/publisher/campaigns/new"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-400/30 rounded-xl font-bold text-sm transition-all"
              >
                Start Sponsored Campaign
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
