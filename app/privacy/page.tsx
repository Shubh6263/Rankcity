import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Privacy Policy | RankCity India Data Protection & DPDP Compliance',
  description:
    'Learn how RankCity protects user data, business contact information, and payment transactions in strict compliance with the Digital Personal Data Protection Act (DPDP) 2023.',
  alternates: {
    canonical: 'https://rankcity.in/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | RankCity',
    description:
      'RankCity privacy policies, data collection standards, and publisher confidentiality guarantees.',
    url: 'https://rankcity.in/privacy',
  },
};

export default function PrivacyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://rankcity.in' },
    { name: 'Privacy Policy', url: 'https://rankcity.in/privacy' },
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
        <h1 className="text-3xl font-extrabold text-neutral-950">Privacy Policy</h1>
        <p className="text-xs text-neutral-500">Effective Date: October 2026</p>

        <section className="space-y-4 text-sm text-neutral-700 leading-relaxed">
          <p>
            RankCity prioritizes the privacy and security of our visitors, business publishers, and advertisers in strict compliance with the Digital Personal Data Protection Act (DPDP), 2023.
          </p>
          <h2 className="text-base font-bold text-neutral-900">Data We Collect</h2>
          <p>
            We collect account details (name, email address, business phone, business address, and transaction identifiers).
            We do not store sensitive payment card information or bank passwords. All payments and wallet top-ups are processed through tokenized, RBI-authorized Indian payment gateways.
          </p>
          <h2 className="text-base font-bold text-neutral-900">Public vs Confidential Information</h2>
          <p>
            Public directory details such as business name, operating hours, photos, reviews, verified address, and contact numbers are visible to customers for lead generation.
            Confidential advertiser data—including internal wallet balances, private maximum bid limits, and analytical conversions—is protected and never shared with competing businesses.
          </p>
          <h2 className="text-base font-bold text-neutral-900">Your Data Rights</h2>
          <p>
            Business owners may update, rectify, or request deletion of their business listing and associated documents at any time by contacting support@rankcity.in.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
