'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Show, SignInButton } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Category, LocationHierarchy, Business } from '@/types';
import { BusinessCard } from '@/components/business/BusinessCard';
import { BusinessListSkeleton } from '@/components/business/BusinessCardSkeleton';
import { generateFAQSchema } from '@/lib/seo/schema';
import { useUserLocation, calculateDistanceKm } from '@/lib/location/context';
import {
  Search,
  MapPin,
  Star,
  Heart,
  Phone,
  MessageCircle,
  Navigation,
  ArrowRight,
  Bed,
  Utensils,
  PlusCircle,
  ShoppingBag,
  Pill,
  Scissors,
  Dumbbell,
  Car,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Navigation2,
  Loader2,
} from 'lucide-react';

import {
  getCachedBusinesses,
  setCachedBusinesses,
  getCachedCategories,
  setCachedCategories,
} from '@/lib/cache/dataCache';

export default function HomePage() {
  const router = useRouter();
  const { city: userCity, area: userArea, coords: userCoords, isLoading: isLocLoading, source: locSource, requestCurrentLocation } = useUserLocation();
  
  // Instant synchronous initialization from memory/localStorage cache (0ms first paint!)
  const [categories, setCategories] = useState<Category[]>(() => {
    return getCachedCategories()?.categories || [];
  });
  const [locations, setLocations] = useState<LocationHierarchy[]>(() => {
    return getCachedCategories()?.locations || [];
  });
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    return getCachedBusinesses() || [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    return (getCachedBusinesses() || []).length === 0;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(userCity.toLowerCase());
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSelectedCity(userCity.toLowerCase().replace(/\s+/g, '-'));
  }, [userCity]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, bRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/businesses'),
        ]);
        if (cRes.ok && bRes.ok) {
          const cData = await cRes.json();
          const bData = await bRes.json();
          const cats = cData.categories || [];
          const locs = cData.locations || [];
          const bizs = bData.businesses || [];
          setCategories(cats);
          setLocations(locs);
          setBusinesses(bizs);
          setCachedBusinesses(bizs);
          setCachedCategories(cats, locs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push(`/${selectedCity}/hotels`);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(selectedCity)}`);
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Pure live sponsored businesses from Supabase
  const sponsoredItems = businesses.slice(0, 4).map((b, idx) => {
    const rankColors = [
      'bg-amber-500 text-white',
      'bg-slate-400 text-white',
      'bg-amber-700 text-white',
      'bg-slate-600 text-white',
    ];
    return {
      rank: idx + 1,
      rankBadgeColor: rankColors[idx] || 'bg-blue-600 text-white',
      biz: b,
    };
  });

  // Curate Top Rated (Organic & Non-Paid)
  const topRatedBusinesses = businesses
    .filter((b) => b.rating >= 4.5)
    .slice(0, 4);

  // Popular Categories matching Customer UI/UX architecture:
  // 🏨 Hotels, 🍽 Restaurants, 🏥 Hospitals, 💊 Pharmacies, 💇 Salons, 🏋 Gyms, 🛍 Shops, 🚗 Automotive
  const popularCategories = [
    { label: 'Hotels', href: '/indore/hotels', icon: Bed, bg: 'bg-blue-50 text-blue-600' },
    { label: 'Restaurants', href: '/indore/restaurants', icon: Utensils, bg: 'bg-orange-50 text-orange-600' },
    { label: 'Hospitals', href: '/indore/healthcare', icon: PlusCircle, bg: 'bg-cyan-50 text-cyan-600' },
    { label: 'Pharmacies', href: '/indore/healthcare', icon: Pill, bg: 'bg-emerald-50 text-emerald-600' },
    { label: 'Salons', href: '/indore/services', icon: Scissors, bg: 'bg-rose-50 text-rose-600' },
    { label: 'Gyms', href: '/indore/services', icon: Dumbbell, bg: 'bg-purple-50 text-purple-600' },
    { label: 'Shops', href: '/indore/shopping', icon: ShoppingBag, bg: 'bg-pink-50 text-pink-600' },
    { label: 'Automotive', href: '/indore/services', icon: Car, bg: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 pb-16 lg:pb-0">
      <Navbar />

      {/* Hero Search Section */}
      <section className="relative overflow-hidden min-h-[480px] sm:min-h-[520px] flex items-center justify-center">
        {/* Panoramic City Landmark Sunset Background with Contrast Gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url('/hero-cityscape.png')`,
          }}
        >
          {/* Subtle gradient overlay to enhance text readability while showcasing the stunning lake, sunset, and architecture */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/60 to-neutral-900/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
            What's around you?
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl drop-shadow-sm">
            Discover the Best Businesses in Your City
          </h1>
          <p className="mt-3.5 text-sm sm:text-base text-neutral-200 max-w-2xl font-normal leading-relaxed drop-shadow-sm">
            Top-rated, trusted and verified local businesses — all in one place.
          </p>

          {/* Unified Search Engine Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 w-full max-w-3xl bg-white p-2 sm:p-2.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-neutral-100"
          >
            <div className="flex items-center gap-2.5 px-3.5 flex-1 w-full">
              <Search className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hotels, restaurants, hospitals..."
                className="w-full text-sm text-neutral-800 placeholder:text-neutral-400 bg-transparent border-0 focus:outline-none py-2.5"
              />
            </div>

            <div className="hidden sm:block h-7 w-px bg-neutral-200 shrink-0" />

            {/* City Selector with GPS Trigger */}
            <div className="flex items-center gap-1.5 px-3 border-t sm:border-t-0 border-neutral-200 w-full sm:w-auto">
              <button
                type="button"
                onClick={requestCurrentLocation}
                disabled={isLocLoading}
                title="Detect exact GPS location"
                className="p-1.5 hover:bg-neutral-100 rounded-lg text-blue-600 transition-colors cursor-pointer shrink-0"
              >
                {isLocLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : locSource === 'browser_gps' ? (
                  <Navigation2 className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                ) : (
                  <Navigation2 className="w-4 h-4 text-blue-600" />
                )}
              </button>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs font-semibold bg-transparent border-0 focus:outline-none text-neutral-800 py-2.5 cursor-pointer capitalize"
              >
                <option value="indore">Indore</option>
                <option value="bhopal">Bhopal</option>
                <option value="mumbai">Mumbai</option>
                <option value="bengaluru">Bengaluru</option>
                <option value="delhi">New Delhi</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Live Location Pill Notification */}
          {locSource === 'browser_gps' && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs backdrop-blur-xs">
              <Navigation2 className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>Using your live GPS location: <strong>{userArea}</strong> in {userCity}</span>
            </div>
          )}
        </div>
      </section>

      {/* Floating Popular Categories Row */}
      <section className="relative z-20 max-w-5xl mx-auto px-4 -mt-7 sm:-mt-8 w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-3 sm:p-4 grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          {popularCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={cat.href}
                className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-neutral-50 transition-all group text-center"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${cat.bg} flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-neutral-700 group-hover:text-blue-600 transition-colors truncate max-w-full">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Section 1: Sponsored Near You 🔥 (Visually Labeled as Sponsored) */}
      <section className="pt-14 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Sponsored Near You
              </h2>
              <span className="text-xs uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-black border border-rose-100">
                Sponsored
              </span>
            </div>
            <Link
              href="/indore/hotels"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>View All</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          {isLoading ? (
            <BusinessListSkeleton count={3} variant="grid" />
          ) : sponsoredItems.length === 0 ? (
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-8 text-center space-y-3">
              <span className="text-2xl">🚀</span>
              <h3 className="text-base font-bold text-neutral-900">Be the First Business in Your City!</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                No sponsored businesses are listed in this area yet. List your business now to secure the #1 sponsored rank.
              </p>
              <div className="pt-2">
                <Link
                  href="/add-business"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <span>Add Your Business (Free)</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsoredItems.map((item, idx) => {
              const { rank, biz } = item;
              const isFav = !!favorites[biz.id];
              const dist = userCoords && biz.latitude && biz.longitude
                ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, biz.latitude, biz.longitude)
                : null;

              return (
                <BusinessCard
                  key={biz.id}
                  business={biz}
                  isSponsored={true}
                  sponsoredRank={rank}
                  distanceKm={dist}
                  isFavorite={isFav}
                  onToggleFavorite={(id, e) => toggleFavorite(e, id)}
                  variant="grid"
                  isPriority={idx < 2}
                />
              );
            })}
        </div>
      )}
        </div>
      </section>

      {/* Section 2: Top Rated Businesses ⭐ (Organic Quality — Non-Paid) */}
      <section className="py-12 bg-neutral-50/70 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-7">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  Top Rated Near You
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Organic Quality
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Highest rated local businesses based on verified reviews — no paid sponsored ranking.
              </p>
            </div>
            <Link
              href="/indore/hotels"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>Explore All</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          {isLoading ? (
            <BusinessListSkeleton count={3} variant="grid" />
          ) : topRatedBusinesses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center space-y-2">
              <span className="text-xl">📍</span>
              <h3 className="text-sm font-bold text-neutral-800">No Rated Listings Yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Verified customer ratings will appear here as soon as local businesses are added and reviewed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRatedBusinesses.map((biz, idx) => {
              const isFav = !!favorites[biz.id];
              const dist = userCoords && biz.latitude && biz.longitude
                ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, biz.latitude, biz.longitude)
                : null;

              return (
                <BusinessCard
                  key={biz.id}
                  business={biz}
                  isSponsored={false}
                  distanceKm={dist}
                  isFavorite={isFav}
                  onToggleFavorite={(id, e) => toggleFavorite(e, id)}
                  variant="grid"
                  isPriority={idx < 2}
                />
              );
            })}
          </div>
        )}
        </div>
      </section>

      {/* Section 3: Grow Your Business with RankCity Banner */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-pink-50/30 border border-blue-100 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="max-w-xl space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
                Grow Your Business with RankCity
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                Get more visibility, more customers and rank higher in your city.
              </p>
              <div className="pt-2">
                <Show when="signed-in">
                  <Link
                    href="/publisher/websites"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>List Your Business</span>
                  </Link>
                </Show>
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <span>List Your Business</span>
                    </button>
                  </SignInButton>
                </Show>
              </div>
            </div>

            {/* Growth Graphic */}
            <div className="relative w-full max-w-xs sm:max-w-sm h-48 bg-white/90 backdrop-blur-xs rounded-2xl border border-blue-100 shadow-lg p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                  More Visibility
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                  More Customers
                </span>
              </div>

              <div className="relative h-24 flex items-end">
                <svg className="w-full h-full" viewBox="0 0 300 100" fill="none">
                  <path
                    d="M 10 90 Q 70 80, 130 55 T 270 15"
                    stroke="#2563EB"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 10 90 Q 70 80, 130 55 T 270 15 L 270 100 L 10 100 Z"
                    fill="url(#gradient-chart)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="gradient-chart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points="265,5 285,15 270,28" fill="#2563EB" />
                </svg>
              </div>

              <div className="text-[11px] text-neutral-400 font-medium text-center">
                Transparent monthly maximum-bid sponsored auctions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Answer Engine Optimization (AEO) FAQ Section */}
      <section className="py-14 bg-neutral-50/70 border-t border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-3">
              Everything You Need to Know About RankCity
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2">
              Learn how our local business discovery engine, ratings, and transparent sponsored rankings work.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is RankCity and how does it help me discover local businesses?',
                a: 'RankCity is India’s dedicated local discovery search engine and business marketplace. It helps consumers quickly find top-rated hotels, authentic restaurants, verified hospitals, salons, and automotive repair shops across Indore, Bhopal, Mumbai, and other cities with direct phone, WhatsApp, and navigation directions.',
              },
              {
                q: 'How does RankCity ensure business rankings and ratings are fair?',
                a: 'RankCity strictly separates organic quality rankings from paid placements. Organic rankings are purely merit-based, driven by authentic customer reviews, star ratings, and location proximity. Sponsored positions are clearly marked with a yellow badge and acquired through a server-authoritative monthly auction.',
              },
              {
                q: 'Is contacting businesses on RankCity completely free for users?',
                a: 'Yes, 100% free! Customers can search, compare, call, WhatsApp, and get Google Maps navigation directions without paying any booking fees or convenience charges.',
              },
              {
                q: 'How can business owners get listed and claim a verified badge?',
                a: 'Owners can click "Add Your Business" in the navigation bar to create or claim an existing listing. Uploading basic business proofs (such as GSTIN or Gumasta) grants a verified trust badge, which boosts consumer confidence and search visibility.',
              },
              {
                q: 'Which cities are currently covered on RankCity?',
                a: 'RankCity currently supports top commercial and tourist destinations including Indore (Vijay Nagar, Palasia, Rajwada), Bhopal, Mumbai, Bengaluru, and New Delhi, with ongoing expansion across India.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-2xs hover:border-blue-200 transition-colors"
              >
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 flex items-start gap-2.5">
                  <span className="text-blue-600 font-extrabold">Q.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQPage JSON-LD Script for AEO & Google AI Overviews */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateFAQSchema([
                {
                  question: 'What is RankCity and how does it help me discover local businesses?',
                  answer:
                    'RankCity is India’s dedicated local discovery search engine and business marketplace. It helps consumers quickly find top-rated hotels, authentic restaurants, verified hospitals, salons, and automotive repair shops across Indore, Bhopal, Mumbai, and other cities with direct phone, WhatsApp, and navigation directions.',
                },
                {
                  question: 'How does RankCity ensure business rankings and ratings are fair?',
                  answer:
                    'RankCity strictly separates organic quality rankings from paid placements. Organic rankings are purely merit-based, driven by authentic customer reviews, star ratings, and location proximity. Sponsored positions are clearly marked with a yellow badge and acquired through a server-authoritative monthly auction.',
                },
                {
                  question: 'Is contacting businesses on RankCity completely free for users?',
                  answer:
                    'Yes, 100% free! Customers can search, compare, call, WhatsApp, and get Google Maps navigation directions without paying any booking fees or convenience charges.',
                },
                {
                  question: 'How can business owners get listed and claim a verified badge?',
                  answer:
                    'Owners can click "Add Your Business" in the navigation bar to create or claim an existing listing. Uploading basic business proofs (such as GSTIN or Gumasta) grants a verified trust badge, which boosts consumer confidence and search visibility.',
                },
                {
                  question: 'Which cities are currently covered on RankCity?',
                  answer:
                    'RankCity currently supports top commercial and tourist destinations including Indore (Vijay Nagar, Palasia, Rajwada), Bhopal, Mumbai, Bengaluru, and New Delhi, with ongoing expansion across India.',
                },
              ])
            ),
          }}
        />
      </section>

      <Footer />
    </div>
  );
}
