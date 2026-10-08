import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Refund & Wallet Policy | RankCity India Commercial Guidelines',
  description:
    'Understand RankCity refund policies, unutilized wallet balance withdrawals, and transparent auction dispute resolutions for business owners.',
  alternates: {
    canonical: 'https://rankcity.in/refund-policy',
  },
  openGraph: {
    title: 'Refund & Wallet Policy | RankCity',
    description:
      'RankCity refund and wallet terms: 100% refund of unutilized advertiser balances, instant outbid credits, and secure processing.',
    url: 'https://rankcity.in/refund-policy',
  },
};

export default function RefundPolicyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://rankcity.in' },
    { name: 'Refund & Wallet Policy', url: 'https://rankcity.in/refund-policy' },
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
        <h1 className="text-3xl font-extrabold text-neutral-950">Refund & Wallet Policy</h1>
        <p className="text-xs text-neutral-500">Effective Date: October 2026</p>

        <section className="space-y-4 text-sm text-neutral-700 leading-relaxed">
          <h2 className="text-base font-bold text-neutral-900">1. Unutilized Wallet Balances</h2>
          <p>
            Advertisers and publishers may withdraw 100% of unutilized, non-reserved wallet balances at any time.
            Withdrawals are credited back to the original source UPI ID or verified Indian bank account within 3 to 5 business days.
          </p>

          <h2 className="text-base font-bold text-neutral-900">2. Active Campaign Spend</h2>
          <p>
            Budget spent during active advertising campaigns where sponsored placement impressions, calls, or leads have already been delivered
            is non-refundable, except in verified cases of continuous technical downtime or fraudulent platform errors confirmed by our administrative team.
          </p>

          <h2 className="text-base font-bold text-neutral-900">3. Outbid Credits & Immediate Balance Release</h2>
          <p>
            If another business places a higher qualifying bid and outbids your position, the reserved funds for that auction are instantly released back to your available balance without fees or penalties.
          </p>

          <h2 className="text-base font-bold text-neutral-900">4. Dispute Settlement</h2>
          <p>
            To initiate a billing inquiry or refund request, please email billing@rankcity.in with your registered business ID and UPI transaction reference.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
