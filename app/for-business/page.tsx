import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import {
  CheckCircle2,
  TrendingUp,
  Phone,
  MessageCircle,
  Navigation,
  ShieldCheck,
  BarChart3,
  Star,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'For Business | Grow With RankCity Sponsored Rankings & Free Listings',
  description:
    'List your business for free on RankCity or compete for #1 sponsored visibility in your city and category with transparent maximum-bid monthly auctions.',
  alternates: {
    canonical: 'https://rankcity.in/for-business',
  },
};

export default function ForBusinessPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://rankcity.in' },
    { name: 'For Business', url: 'https://rankcity.in/for-business' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative bg-gradient-to-b from-neutral-50 via-white to-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-100">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wide">
              RankCity Business Partner Network
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
              Get Your Business in Front of Local Customers
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Create your free business profile and compete for sponsored visibility when customers are searching for businesses like yours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/add-business"
                className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                Add Your Business
              </Link>
              <Link
                href="/pricing#how-it-works"
                className="w-full sm:w-auto px-7 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-sm font-bold transition-all text-center"
              >
                See How Bidding Works
              </Link>
            </div>

            <p className="text-xs text-neutral-400 font-medium">
              Free listing forever • Instant direct calls & WhatsApp leads
            </p>
          </div>
        </section>

        {/* 8 CORE SECTIONS GRID */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
              Everything Your Local Business Needs to Grow
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Designed specifically for local hotels, dining places, clinics, salons, and retail establishments across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Free Listing */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-3 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900">1. Free Business Listing</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                List your business at ₹0 forever with your phone, WhatsApp, location map, photos, and operating hours.
              </p>
            </div>

            {/* 2. Sponsored Ranking */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-3 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900">2. Sponsored Ranking</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Win top sponsored spots (#1, #2, #3) in your target category and city to drive immediate discovery.
              </p>
            </div>

            {/* 3. Maximum Bid */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-3 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900">3. Maximum Bid Ceiling</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Set a monthly spending ceiling. You only pay the minimum required price, never above your max bid.
              </p>
            </div>

            {/* 4. Outbid Protection */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-3 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900">4. Outbid Protection</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Receive instant notifications when competition raises a bid, allowing you to react with a single tap.
              </p>
            </div>

            {/* 5. Lead Tracking */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-3 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900">5. Lead & Action Tracking</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Track phone calls, WhatsApp inquiries, website visits, and Google Map directions clicked by customers.
              </p>
            </div>

            {/* 6. Analytics */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-3 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900">6. Real-time Analytics</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Access your Business Dashboard to monitor profile impressions, click funnels, and ROI over time.
              </p>
            </div>

            {/* 7. Reviews */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-3 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900">7. Customer Reviews</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Collect authentic customer reviews, star ratings, and reply directly as a verified business owner.
              </p>
            </div>

            {/* 8. Business Verification */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-3 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900">8. Business Verification</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Submit GSTIN or trade licenses to earn the official green verified badge and unlock maximum buyer trust.
              </p>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-2xl font-black">
                Start Growing With RankCity
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300">
                Register your business in under 3 minutes and connect with local consumers searching in your city right now.
              </p>
            </div>
            <Link
              href="/add-business"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all shadow-md"
            >
              Add Your Business Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
