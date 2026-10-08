import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Terms of Service | RankCity Marketplace & Directory Rules',
  description:
    'Review the official terms of service, commercial guidelines, and auction policies governing the RankCity local business discovery and advertising platform.',
  alternates: {
    canonical: 'https://rankcity.in/terms',
  },
  openGraph: {
    title: 'Terms of Service | RankCity',
    description:
      'Official terms of service, publisher obligations, and transparent auction guidelines for RankCity.',
    url: 'https://rankcity.in/terms',
  },
};

export default function TermsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://rankcity.in' },
    { name: 'Terms of Service', url: 'https://rankcity.in/terms' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <RoleSwitcherBar />
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 space-y-8 bg-white my-8 rounded-2xl border border-neutral-200 p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-neutral-950">Terms of Service</h1>
        <p className="text-xs text-neutral-500">Effective Date: October 2026</p>

        <section className="space-y-4 text-sm text-neutral-700 leading-relaxed">
          <h2 className="text-base font-bold text-neutral-900">1. Nature of the Platform</h2>
          <p>
            RankCity operates as an online business discovery marketplace and commercial advertising directory.
            Rankings and positions displayed in designated sponsored sections are <strong>sponsored, commercial advertising positions</strong> determined
            by competitive second-price sponsored auctions. They do not simulate or influence organic external search engine algorithms (such as Google or Bing).
          </p>

          <h2 className="text-base font-bold text-neutral-900">2. Business Submission & Verification</h2>
          <p>
            All submitted local business listings must represent real, verifiable commercial entities or authorized professionals operating in India.
            Listings must adhere to Indian regulations, the Information Technology Act (2000), and Consumer Protection guidelines.
            Deceptive, impersonating, or fraudulent profiles will be immediately suspended and reported to authorities.
          </p>

          <h2 className="text-base font-bold text-neutral-900">3. Auction & Maximum-Bid Rules</h2>
          <p>
            Business owners set their maximum willingness-to-pay bid. Our automated, server-authoritative bidding engine
            determines the active minimum clearing price using second-price minimum-required pricing mechanics. All placed bids are binding
            commercial obligations deducted from the business owner’s verified wallet balance upon active placement.
          </p>

          <h2 className="text-base font-bold text-neutral-900">4. Lead Tracking & Analytics</h2>
          <p>
            RankCity provides verified analytics tracking for customer interactions, including phone calls, WhatsApp inquiries,
            and map navigation requests. Publishers may not employ automated bots, click farms, or artificial engagement tactics.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
