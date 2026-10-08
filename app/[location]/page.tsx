import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { db } from '@/lib/db';
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateGenericItemListSchema,
} from '@/lib/seo/schema';
import {
  MapPin,
  Star,
  CheckCircle2,
  Phone,
  MessageCircle,
  Navigation,
  ArrowRight,
  TrendingUp,
  Search,
  Building2,
  Bed,
  Utensils,
  Stethoscope,
  Briefcase,
  ShoppingBag,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface LocationPageProps {
  params: Promise<{
    location: string;
  }>;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  hospitality: <Bed className="w-5 h-5 text-blue-600" />,
  dining: <Utensils className="w-5 h-5 text-amber-600" />,
  healthcare: <Stethoscope className="w-5 h-5 text-emerald-600" />,
  services: <Briefcase className="w-5 h-5 text-purple-600" />,
  shopping: <ShoppingBag className="w-5 h-5 text-pink-600" />,
  education: <GraduationCap className="w-5 h-5 text-indigo-600" />,
};

function formatCityName(slug: string): string {
  if (slug === 'new-delhi' || slug === 'delhi') return 'New Delhi';
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { location: locationSlug } = await params;
  const cityName = formatCityName(locationSlug);
  const loc = db.locations.find(
    (l) => l.slug.toLowerCase() === locationSlug.toLowerCase() || l.city.toLowerCase() === cityName.toLowerCase()
  );
  const stateName = loc?.state || 'India';

  return {
    title: `Best Businesses, Services & Local Rankings in ${cityName} | RankCity`,
    description: `Discover top-rated, verified businesses in ${cityName}, ${stateName}. Compare hotels, restaurants, hospitals, doctors, and professional services with authentic reviews and direct contact on RankCity.`,
    keywords: [
      `${cityName} businesses`,
      `best services in ${cityName}`,
      `top rated places in ${cityName}`,
      `hotels in ${cityName}`,
      `restaurants in ${cityName}`,
      `hospitals in ${cityName}`,
      `local business directory ${cityName}`,
    ],
    alternates: {
      canonical: `https://rankcity.in/${locationSlug}`,
    },
    openGraph: {
      title: `Best Businesses & Services in ${cityName} | RankCity`,
      description: `Explore top-ranked verified businesses in ${cityName}, ${stateName}. Find contact info, ratings, and directions.`,
      url: `https://rankcity.in/${locationSlug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Top Businesses in ${cityName} | RankCity`,
      description: `Discover top-rated local services and verified listings in ${cityName}.`,
    },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { location: locationSlug } = await params;
  const cityName = formatCityName(locationSlug);

  // Match location
  const loc = db.locations.find(
    (l) =>
      l.slug.toLowerCase() === locationSlug.toLowerCase() ||
      l.city.toLowerCase() === cityName.toLowerCase() ||
      (locationSlug === 'delhi' && l.city.toLowerCase() === 'new delhi')
  );

  const stateName = loc?.state || 'India';

  // Get businesses in this city
  const allBusinesses = db.businesses;
  const cityBusinesses = allBusinesses.filter(
    (b) =>
      b.city.toLowerCase() === cityName.toLowerCase() ||
      (locationSlug === 'delhi' && b.city.toLowerCase() === 'new delhi') ||
      b.locationId === loc?.id
  );

  const categories = db.categories.filter((c) => c.isActive);

  // Structured Data Schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://rankcity.in' },
    { name: cityName, url: `https://rankcity.in/${locationSlug}` },
  ]);

  const categoryItemListSchema = generateGenericItemListSchema(
    `Popular Categories in ${cityName}`,
    `Browse trusted and verified businesses across industries in ${cityName}, ${stateName}.`,
    categories.map((c) => ({
      name: `${c.name} in ${cityName}`,
      url: `https://rankcity.in/${locationSlug}/${c.slug}`,
      description: `Top verified ${c.name.toLowerCase()} in ${cityName}, ${stateName}.`,
    }))
  );

  const cityFAQs = [
    {
      question: `What are the top-rated local services in ${cityName}?`,
      answer: `RankCity features verified ratings and transparent rankings for hotels, restaurants, healthcare centers, salons, and retail shops across ${cityName}. Every profile is verified with authentic reviews and direct contact options.`,
    },
    {
      question: `How are businesses ranked in ${cityName} on RankCity?`,
      answer: `Rankings on RankCity are split clearly between organic consumer quality ratings and verified commercial sponsored placements determined through transparent monthly second-price auctions.`,
    },
    {
      question: `How can I contact a business in ${cityName} directly?`,
      answer: `Each business profile on RankCity provides direct one-tap calling, verified WhatsApp messaging, website links, and Google Maps directions with zero hidden mediation charges.`,
    },
    {
      question: `How can local businesses in ${cityName} list their services?`,
      answer: `Business owners in ${cityName} can register via the "Add Your Business" portal, complete document verification, and start bidding for prime category visibility in their locality.`,
    },
  ];

  const faqSchema = generateFAQSchema(cityFAQs);

  // Localities for this city
  const localities = db.locations.filter(
    (l) => l.city.toLowerCase() === cityName.toLowerCase() && l.locality !== 'All Localities'
  );

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryItemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1">
        {/* City Hero */}
        <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-blue-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800">
          <div className="max-w-6xl mx-auto space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{cityName}, {stateName} Local Directory</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Discover Top-Ranked Businesses in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                {cityName}
              </span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-neutral-300 leading-relaxed">
              Explore verified hotels, restaurants, healthcare centers, and local services in {cityName}.
              Real customer reviews, direct WhatsApp / phone contact, and transparent rank auctions.
            </p>

            {/* Quick Search Action */}
            <div className="pt-2 max-w-xl">
              <Link
                href={`/search?city=${locationSlug}`}
                className="flex items-center justify-between w-full p-2.5 sm:p-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl backdrop-blur-md text-sm text-neutral-200 transition-all shadow-lg"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-blue-400" />
                  <span>Search places, services or brands in {cityName}...</span>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs">
                  Explore
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Categories Grid in City */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                Browse Categories in {cityName}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Find top-rated businesses by industry in {cityName}
              </p>
            </div>
            <Link
              href="/categories"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All Categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locationSlug}/${cat.slug}`}
                className="group p-4 bg-white border border-neutral-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2.5"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                  {CATEGORY_ICONS[cat.slug] || <Building2 className="w-5 h-5 text-neutral-700" />}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    in {cityName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured / Top Rated Businesses in City */}
        <section className="bg-neutral-100/60 border-y border-neutral-200/80 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold mb-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Top Rated Listings
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                  Featured Businesses in {cityName}
                </h2>
              </div>
              <Link
                href={`/search?city=${locationSlug}`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all ({cityBusinesses.length || allBusinesses.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(cityBusinesses.length > 0 ? cityBusinesses : allBusinesses.slice(0, 6)).map((biz, idx) => (
                <div
                  key={biz.id}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Rank Badge */}
                    <div className="relative h-44 w-full bg-neutral-200 overflow-hidden">
                      {biz.coverImage ? (
                        <img
                          src={biz.coverImage}
                          alt={`${biz.name} in ${cityName}`}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
                          <Building2 className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-lg">
                        #{idx + 1} Ranked
                      </div>
                      {biz.isVerified && (
                        <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {biz.locality || cityName}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-neutral-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{biz.rating}</span>
                          <span className="text-neutral-400 font-normal">({biz.reviewCount})</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-neutral-900 text-base leading-snug line-clamp-1">
                        <Link href={`/business/${biz.slug}`} className="hover:text-blue-600">
                          {biz.name}
                        </Link>
                      </h3>

                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {biz.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 border-t border-neutral-100 mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {biz.phone && (
                        <a
                          href={`tel:${biz.phone}`}
                          className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-neutral-200 transition-colors"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {biz.whatsapp && (
                        <a
                          href={`https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-neutral-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-neutral-200 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <Link
                      href={`/business/${biz.slug}`}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Localities in City */}
        {localities.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
              Popular Localities in {cityName}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {localities.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/search?city=${locationSlug}&locality=${encodeURIComponent(loc.locality || '')}`}
                  className="px-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-2xs"
                >
                  📍 {loc.locality}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* City AEO FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-neutral-900">
              Frequently Asked Questions About {cityName} Directory
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Instant answers for consumers and business owners in {cityName}
            </p>
          </div>

          <div className="space-y-3">
            {cityFAQs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white border border-neutral-200 rounded-xl p-4 transition-colors open:border-blue-300"
              >
                <summary className="font-bold text-sm text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Business Owner Promotion Banner */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Own a Business in {cityName}?
              </h2>
              <p className="text-sm text-blue-100 max-w-xl">
                Claim your profile, verify your listing, and compete for #1 sponsored placement in {cityName}.
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-6 py-3 bg-white text-blue-700 font-extrabold text-sm rounded-xl hover:bg-neutral-100 transition-colors shadow-md shrink-0"
            >
              List Your Business Today
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
