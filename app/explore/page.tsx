'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { useAuth } from '@/lib/auth/context';
import { Business, Category } from '@/types';
import {
  Search,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Tag,
  SlidersHorizontal,
  Bookmark,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';

export default function ExplorePage() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('Indore');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [savedBizIds, setSavedBizIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const cities = ['Indore', 'Bhopal', 'Mumbai', 'Bengaluru', 'New Delhi'];

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, bizRes, favRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/businesses'),
          fetch(`/api/favorites?userId=${currentUser.id}`),
        ]);

        if (catRes.ok) {
          const cData = await catRes.json();
          setCategories(cData.categories || []);
        }

        if (bizRes.ok) {
          const bData = await bizRes.json();
          setBusinesses(bData.businesses || []);
        }

        if (favRes.ok) {
          const fData = await favRes.json();
          const ids = new Set<string>((fData.favorites || []).map((f: any) => f.businessId));
          setSavedBizIds(ids);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentUser.id]);

  const toggleFavorite = async (bizId: string) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, businessId: bizId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedBizIds((prev) => {
          const next = new Set(prev);
          if (data.isFavorite) next.add(bizId);
          else next.delete(bizId);
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeadAction = async (businessId: string, type: 'call' | 'whatsapp' | 'directions') => {
    try {
      await fetch(`/api/businesses/${businessId}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Filter businesses
  const filtered = businesses.filter((b) => {
    const matchesCity = !selectedCity || b.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesCat =
      selectedCategory === 'all' ||
      b.categoryId === selectedCategory ||
      categories.find((c) => c.slug === selectedCategory)?.id === b.categoryId;
    const matchesQuery =
      !searchQuery ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.locality && b.locality.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRating = filterRating === 0 || b.rating >= filterRating;
    const matchesVerified = !onlyVerified || b.isVerified;
    return matchesCity && matchesCat && matchesQuery && matchesRating && matchesVerified;
  });

  // Separate Sponsored (isFeatured or active campaign) vs Organic
  const sponsoredList = filtered.filter((b) => b.isFeatured || b.status === 'approved').slice(0, 3);
  const organicList = filtered.filter((b) => !sponsoredList.some((s) => s.id === b.id));

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Schema.org Breadcrumbs & AEO FAQ for Explore Directory */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: `Explore ${selectedCity} Businesses`, url: '/explore' },
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
                question: `How can I find top verified businesses in ${selectedCity}?`,
                answer: `Use RankCity's interactive category filters, star rating sorting, and verified badges to compare and contact trusted local businesses in ${selectedCity}.`,
              },
              {
                question: 'Are reviews on RankCity verified?',
                answer:
                  'Yes, RankCity monitors and moderates customer reviews to prevent spam and ensure genuine consumer feedback.',
              },
            ])
          ),
        }}
      />

      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-100 text-xs font-semibold backdrop-blur-xs border border-blue-400/20">
              <MapPin className="w-3.5 h-3.5 text-blue-300" />
              <span>Local Business Directory · {selectedCity}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Explore Top Verified Businesses in {selectedCity}
            </h1>
            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
              Find trusted local services, compare verified profiles, call directly, or initiate WhatsApp inquiries with zero middlemen.
            </p>
          </div>

          {/* Search bar inside hero */}
          <div className="mt-8 relative z-10">
            <div className="bg-white rounded-2xl p-2 shadow-xl flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search className="w-5 h-5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search hotels, clinics, cafes, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-neutral-900 text-sm focus:outline-hidden py-2"
                />
              </div>

              <div className="flex items-center gap-2 sm:border-l sm:border-neutral-200 sm:pl-3">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <select
                  aria-label="City"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="text-neutral-800 text-xs sm:text-sm font-semibold bg-transparent focus:outline-hidden py-2 cursor-pointer"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Filter Row */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-neutral-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter By:
            </span>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Only</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">Rating:</span>
              {[0, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRating(r)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                    filterRating === r
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {r === 0 ? 'Any' : `${r}+ ★`}
                </button>
              ))}
            </div>
          </div>

          <div className="text-neutral-500 font-semibold">
            Showing <strong className="text-neutral-900">{filtered.length}</strong> businesses
          </div>
        </div>

        {/* SPONSORED PLACEMENT SECTION (Explicitly Labeled) */}
        {sponsoredList.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-amber-300 tracking-wider">
                  Sponsored Placement
                </span>
                <span className="text-xs text-neutral-500">
                  Paid advertising placements determined by server-authoritative monthly auctions
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sponsoredList.map((biz, idx) => (
                <div
                  key={biz.id}
                  className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative"
                >
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Sponsored #{idx + 1}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFavorite(biz.id)}
                    aria-label="Save business"
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-600 hover:text-rose-600 shadow-xs cursor-pointer"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${savedBizIds.has(biz.id) ? 'fill-rose-600 text-rose-600' : ''}`}
                    />
                  </button>

                  <div className="h-40 bg-neutral-100 overflow-hidden relative">
                    <img
                      src={biz.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                      alt={biz.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/business/${biz.slug}`}
                          className="font-bold text-base text-neutral-900 hover:text-blue-600 line-clamp-1"
                        >
                          {biz.name}
                        </Link>
                        {biz.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {biz.rating}
                        </span>
                        <span>({biz.reviewCount} reviews)</span>
                        <span>·</span>
                        <span>{biz.locality || biz.city}</span>
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-2">{biz.description}</p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                      <a
                        href={`tel:${biz.phone}`}
                        onClick={() => handleLeadAction(biz.id, 'call')}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${(biz.whatsapp || biz.phone).replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLeadAction(biz.id, 'whatsapp')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <Link
                        href={`/business/${biz.slug}`}
                        className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-neutral-600"
                        title="View Full Profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORGANIC DISCOVERY SECTION */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Organic & Community Discovery</h2>
              <p className="text-xs text-neutral-500">
                Ranked by customer reviews, proximity, and verified credentials — strictly independent of advertising spend
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {organicList.map((biz) => (
              <div
                key={biz.id}
                className="bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-neutral-100 overflow-hidden relative">
                    <img
                      src={biz.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
                      alt={biz.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => toggleFavorite(biz.id)}
                      aria-label="Save business"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-600 hover:text-rose-600 shadow-xs cursor-pointer"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${savedBizIds.has(biz.id) ? 'fill-rose-600 text-rose-600' : ''}`}
                      />
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/business/${biz.slug}`}
                        className="font-bold text-base text-neutral-900 hover:text-blue-600 line-clamp-1"
                      >
                        {biz.name}
                      </Link>
                      {biz.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {biz.rating}
                      </span>
                      <span>({biz.reviewCount} reviews)</span>
                      <span>·</span>
                      <span>{biz.locality || biz.city}</span>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{biz.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                    <a
                      href={`tel:${biz.phone}`}
                      onClick={() => handleLeadAction(biz.id, 'call')}
                      className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://wa.me/${(biz.whatsapp || biz.phone).replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLeadAction(biz.id, 'whatsapp')}
                      className="flex-1 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <Link
                      href={`/business/${biz.slug}`}
                      className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-neutral-600"
                      title="View Profile"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {organicList.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8">
              <Search className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-800">No businesses match your active filter criteria</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Try resetting your rating filters or choosing a different category to view more verified local listings.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setFilterRating(0);
                  setOnlyVerified(false);
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
