import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageCircle,
  Navigation,
  Eye,
  TrendingUp,
  Search,
  Sparkles,
  Building2,
  Users,
} from 'lucide-react';
import { generateBreadcrumbSchema, generateFAQSchema, APP_BASE_URL } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'How It Works - Local Discovery & Sponsored Ranking | RankCity',
  description:
    'Learn how RankCity connects customers with verified local businesses, and how business owners can list free or compete for #1 sponsored visibility with monthly maximum bids.',
  alternates: {
    canonical: 'https://rankcity.in/how-it-works',
  },
  openGraph: {
    title: 'How RankCity Works - Local Business Discovery & Monthly Auctions',
    description:
      'Clear, transparent local business discovery for customers and maximum-bid sponsored visibility for business owners.',
    url: 'https://rankcity.in/how-it-works',
  },
};

export default function HowItWorksPage() {
  const faqList = [
    {
      question: 'How does sponsored ranking work on RankCity?',
      answer:
        'Business owners specify their maximum monthly bid for a city and category placement. RankCity automatically determines the minimum required price based on competition. The advertiser only pays what is needed to hold their rank, not their full maximum bid.',
    },
    {
      question: 'Is sponsored #1 the same as the top-rated business?',
      answer:
        'No. Sponsored positions are explicitly labeled commercial advertising placements (🥇 Sponsored #1, 🥈 Sponsored #2). Organic top-rated badges are earned strictly through authentic customer reviews and star ratings.',
    },
    {
      question: 'Is creating a business listing free?',
      answer:
        'Yes! Listing your business on RankCity is 100% free forever. Bidding for sponsored placement is completely optional.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: 'Home', url: 'https://rankcity.in' },
              { name: 'How It Works', url: 'https://rankcity.in/how-it-works' },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateFAQSchema(
              faqList.map((f) => ({
                question: f.question,
                answer: f.answer,
              }))
            )
          ),
        }}
      />

      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
            Transparent Platform Model
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950">
            How RankCity Works
          </h1>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
            A trusted two-sided local marketplace connecting consumers with verified businesses while offering transparent sponsored visibility.
          </p>
        </div>

        {/* Two Sides: For Customers vs For Businesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Customers */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
              <Users className="w-4 h-4" /> For Customers
            </div>
            <h2 className="text-2xl font-black text-neutral-900">
              Discover → Compare → Contact
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Find the best businesses in your city without spam, middleman fees, or opaque algorithms.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Discover Local Places</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Search by category, city, or locality (e.g. Hotels in Vijay Nagar, Indore).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Compare Authentically</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    View verified badges, customer reviews, photo galleries, amenities, and price ranges.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Contact Directly</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Call, message on WhatsApp, or get GPS directions with zero commission markups.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 pt-3"
            >
              Start Exploring Businesses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* For Businesses */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <Building2 className="w-4 h-4" /> For Businesses
            </div>
            <h2 className="text-2xl font-black text-neutral-900">
              List → Promote → Get Leads
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Own your business profile for free and purchase top sponsored visibility with complete price transparency.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">List Your Business Free</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Create your profile with photos, contact details, opening hours, and location pin.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Promote With Maximum Bid</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Set a monthly maximum bid ceiling. Pay only the minimum required price to hold your rank.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Receive Direct Leads</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Get tracked phone calls, WhatsApp messages, map visits, and campaign analytics.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/add-business"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 pt-3"
            >
              Add Your Business Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Business Lifecycle Flow Diagram */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Step-by-Step Lifecycle
            </span>
            <h2 className="text-2xl font-black text-neutral-900">
              The RankCity Commercial Engine
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              From free onboarding to high-intent customer leads in 7 clear steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-center text-xs">
            {[
              { title: 'LIST YOUR BUSINESS', desc: 'Free profile creation', step: '1' },
              { title: 'CHOOSE PLACEMENT', desc: 'City + Category + Locality', step: '2' },
              { title: 'SET MAXIMUM BID', desc: 'Your spending ceiling', step: '3' },
              { title: 'SPONSORED POSITION', desc: 'Automatic min price', step: '4' },
              { title: 'GET DISCOVERED', desc: 'Top placement in city', step: '5' },
              { title: 'RECEIVE LEADS', desc: 'Calls / WhatsApp / Map', step: '6' },
              { title: 'MEASURE RESULTS', desc: 'Real-time analytics ROI', step: '7' },
            ].map((st, i) => (
              <div
                key={i}
                className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 flex flex-col items-center justify-between space-y-2 relative"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center">
                  {st.step}
                </div>
                <div>
                  <h4 className="font-extrabold text-neutral-900 text-[11px] leading-tight">
                    {st.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-neutral-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqList.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2"
              >
                <h3 className="text-sm font-bold text-neutral-900">{f.question}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA — Using Exact Custom Banner Graphic with Interactive Overlays */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-blue-200/40 w-full group">
          {/* Base Graphic: Chef + City Skyline + 3D Mobile Showcase */}
          <img
            src="/cta-connect-banner.png"
            alt="Ready to Connect with Local Customers?"
            className="w-full h-auto block select-none pointer-events-none"
          />

          {/* Interactive Button Click Areas exactly positioned over the buttons in the image across ALL screens */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full relative">
              {/* Button 1: "Add Your Business Free ->" */}
              <Link
                href="/add-business"
                title="Add Your Business Free"
                className="absolute left-[30.5%] top-[61.5%] w-[18.5%] h-[17%] rounded-lg sm:rounded-xl transition-all active:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer"
                aria-label="Add Your Business Free"
              >
                <span className="sr-only">Add Your Business Free</span>
              </Link>

              {/* Button 2: "View Pricing & Estimator ->" */}
              <Link
                href="/pricing"
                title="View Pricing & Estimator"
                className="absolute left-[49.8%] top-[61.5%] w-[19%] h-[17%] rounded-lg sm:rounded-xl transition-all active:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer"
                aria-label="View Pricing & Estimator"
              >
                <span className="sr-only">View Pricing & Estimator</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
