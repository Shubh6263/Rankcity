'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { formatINR } from '@/lib/currency';
import { Category, LocationHierarchy } from '@/types';
import {
  Stethoscope,
  Cpu,
  GraduationCap,
  Briefcase,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Tag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationHierarchy[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setLocations(data.locations || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5 text-emerald-600" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-5 h-5 text-rose-600" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-purple-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-sky-600" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-amber-600" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      default:
        return <Tag className="w-5 h-5 text-neutral-600" />;
    }
  };

  const defaultLocSlug = locations[0]?.slug || 'indore';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Schema.org Breadcrumbs & Category Hub AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Categories Directory', url: '/categories' },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateFAQSchema([
              {
                question: 'What business categories are available on RankCity?',
                answer:
                  'RankCity organizes local businesses into verified hierarchies including Hotels & Stays, Food & Dining, Healthcare & Clinics, Salons & Wellness, Shopping & Retail, and Automotive Services.',
              },
              {
                question: 'How do minimum bids work across categories?',
                answer:
                  'Each business category has a calibrated minimum monthly bid reserve based on local search volume and advertiser demand.',
              },
            ])
          ),
        }}
      />

      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
            Marketplace Directory
          </span>
          <h1 className="text-3xl font-extrabold text-neutral-950">
            Hierarchical Categories & Subcategories
          </h1>
          <p className="text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
            Every category has strict minimum bids, configured increment rates, and platform commission. Select any niche below to participate in live ranking auctions.
          </p>
        </div>

        <div className="space-y-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                    {getIcon(cat.iconName)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">{cat.name}</h2>
                    <p className="text-xs text-neutral-500">{cat.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-neutral-500">
                    Min Starting Bid:{' '}
                    <strong className="text-neutral-900">{formatINR(cat.minBidPaise)}</strong>
                  </span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-neutral-500">
                    Increment:{' '}
                    <strong className="text-neutral-900">{formatINR(cat.bidIncrementPaise)}</strong>
                  </span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-neutral-500">
                    Commission: <strong className="text-neutral-900">{cat.commissionPercent}%</strong>
                  </span>
                </div>
              </div>

              {/* Subcategories grid */}
              <div className="pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                  Available Subcategories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/rankings/${cat.slug}/${defaultLocSlug}`}
                      className="p-3.5 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors">
                          {sub.name}
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          Min Bid: {formatINR(sub.minBidPaise || cat.minBidPaise)}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
