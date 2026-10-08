'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { BusinessCard } from '@/components/business/BusinessCard';
import { BusinessListSkeleton } from '@/components/business/BusinessCardSkeleton';
import { Business, Category, LocationHierarchy } from '@/types';
import { useUserLocation, calculateDistanceKm } from '@/lib/location/context';
import {
  Search,
  MapPin,
  Star,
  Heart,
  SlidersHorizontal,
  Map as MapIcon,
  ChevronDown,
  Check,
  CheckCircle2,
  Phone,
  MessageCircle,
  Navigation,
  Navigation2,
  Loader2,
} from 'lucide-react';

import {
  getCachedBusinesses,
  setCachedBusinesses,
  getCachedCategories,
  setCachedCategories,
} from '@/lib/cache/dataCache';

function SearchResultsContent() {
  const { city: userCity, area: userArea, coords: userCoords, isLoading: isLocLoading, source: locSource, requestCurrentLocation } = useUserLocation();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCity = searchParams.get('city') || userCity.toLowerCase().replace(/\s+/g, '-');

  const [query, setQuery] = useState(initialQ);
  const [city, setCity] = useState(initialCity);
  
  // Instant synchronous initialization from memory/localStorage cache (0ms first paint!)
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    return getCachedBusinesses() || [];
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    return getCachedCategories()?.categories || [];
  });
  const [locations, setLocations] = useState<LocationHierarchy[]>(() => {
    return getCachedCategories()?.locations || [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    return (getCachedBusinesses() || []).length === 0;
  });
  const [isMapView, setIsMapView] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [sortBy, setSortBy] = useState('relevance');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showAllLocalities, setShowAllLocalities] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, cRes] = await Promise.all([
          fetch('/api/businesses'),
          fetch('/api/categories'),
        ]);
        if (bRes.ok && cRes.ok) {
          const b = await bRes.json();
          const c = await cRes.json();
          const bizs = b.businesses || [];
          const cats = c.categories || [];
          const locs = c.locations || [];
          setBusinesses(bizs);
          setCategories(cats);
          setLocations(locs);
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

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLocalityToggle = (locName: string) => {
    setSelectedLocalities((prev) =>
      prev.includes(locName) ? prev.filter((l) => l !== locName) : [...prev, locName]
    );
  };

  const filtered = businesses.filter((b) => {
    const q = query.toLowerCase().trim();
    const matchesQ =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      (b.services && b.services.some((s) => s.toLowerCase().includes(q))) ||
      (b.locality && b.locality.toLowerCase().includes(q)) ||
      b.city.toLowerCase().includes(q);

    const normCity = city.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bCity = b.city.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchesCity =
      !city ||
      bCity === normCity ||
      bCity.includes(normCity) ||
      normCity.includes(bCity) ||
      b.locationId.toLowerCase().includes(normCity);

    const matchesRating = selectedRating === null || (b.rating || 0) >= selectedRating;

    const matchesLocality =
      selectedLocalities.length === 0 ||
      (b.locality && selectedLocalities.includes(b.locality));

    const matchesCat =
      !selectedCategory || b.categoryId === selectedCategory;

    return matchesQ && matchesCity && matchesRating && matchesLocality && matchesCat;
  }).sort((a, b) => {
    if (sortBy === 'distance' && userCoords) {
      const distA = a.latitude && a.longitude ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude) : 9999;
      const distB = b.latitude && b.longitude ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude) : 9999;
      return distA - distB;
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'reviews') {
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    }
    return 0; // relevance preserves original order
  });

  const localitiesList = [
    { name: 'Vijay Nagar', count: 50 },
    { name: 'Geeta Bhawan', count: 42 },
    { name: 'Rajwada', count: 38 },
    { name: 'Palasia', count: 28 },
    { name: 'AB Road', count: 21 },
    { name: 'Sapna Sangeeta', count: 19 },
  ];

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    query ? `${query} in ${city || 'Indore'}` : `Businesses in ${city || 'Indore'}`
  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6">
      {/* Search Header Bar matching Mockup */}
      <div className="bg-white border-b border-neutral-200 -mx-4 sm:-mx-6 lg:-mx-8 -mt-10 px-4 sm:px-6 lg:px-8 py-3 sticky top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2.5 max-w-2xl">
            {/* City Selector with GPS Trigger */}
            <div className="relative shrink-0 flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-1">
              <button
                type="button"
                onClick={async () => {
                  await requestCurrentLocation();
                  setCity(userCity.toLowerCase().replace(/\s+/g, '-'));
                }}
                disabled={isLocLoading}
                title="Detect exact GPS location"
                className="p-1.5 hover:bg-neutral-200 rounded-lg text-blue-600 transition-colors cursor-pointer shrink-0"
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-2 py-2 bg-transparent text-xs font-semibold text-neutral-800 focus:outline-none cursor-pointer"
              >
                <option value="indore">📍 Indore</option>
                <option value="bhopal">📍 Bhopal</option>
                <option value="mumbai">📍 Mumbai</option>
                <option value="bengaluru">📍 Bengaluru</option>
                <option value="delhi">📍 New Delhi</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for hotels, restaurants, hospitals..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <button
              onClick={() => setIsMapView(!isMapView)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isMapView
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{isMapView ? 'Hide Map' : 'Map View'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <span>{query ? `Results for "${query}"` : 'Discover Businesses in City'}</span>
            {locSource === 'browser_gps' && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Navigation2 className="w-3 h-3 fill-emerald-600" /> Near {userArea}
              </span>
            )}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {filtered.length} verified results found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-800 focus:outline-none cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="distance">Distance (Nearest First)</option>
            <option value="rating">Highest Rating</option>
            <option value="reviews">Most Reviews</option>
          </select>
        </div>
      </div>

      {/* Split Layout: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Filters */}
        <aside
          className={`lg:col-span-3 space-y-6 ${
            showMobileFilters ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Category Filter */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Category
            </h3>
            <div className="space-y-2 text-xs text-neutral-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategory === ''}
                  onChange={() => setSelectedCategory('')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-neutral-900">All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat.id}
                    onChange={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Price Range
              </h3>
              <span className="text-xs font-bold text-neutral-900 font-mono">
                ₹0 — ₹{priceMax.toLocaleString()}+
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Ratings Filter */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Ratings
            </h3>
            <div className="space-y-2 text-xs">
              {[4.5, 4.0, 3.5, 3.0].map((starVal) => (
                <button
                  key={starVal}
                  onClick={() => setSelectedRating(selectedRating === starVal ? null : starVal)}
                  className={`w-full flex items-center justify-between py-1 px-2 rounded-lg transition-colors cursor-pointer text-left ${
                    selectedRating === starVal
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-500">
                      {'★'.repeat(Math.floor(starVal))}
                      {starVal % 1 !== 0 && '½'}
                    </div>
                    <span>{starVal} & above</span>
                  </div>
                  {selectedRating === starVal && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Location / Localities Filter */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Location
            </h3>
            <div className="space-y-2 text-xs text-neutral-700">
              {(showAllLocalities ? localitiesList : localitiesList.slice(0, 5)).map((loc) => (
                <label key={loc.name} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedLocalities.includes(loc.name)}
                      onChange={() => handleLocalityToggle(loc.name)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{loc.name}</span>
                  </div>
                  <span className="text-neutral-400 text-[11px]">({loc.count})</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAllLocalities(!showAllLocalities)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline pt-1 block cursor-pointer"
            >
              {showAllLocalities ? 'Show Less' : 'Show More'}
            </button>
          </div>
        </aside>

        {/* Right Main Area: Results Cards + Optional Map */}
        <div className="lg:col-span-9 space-y-4">
          {/* Embedded Google Map if Map View is toggled */}
          {isMapView && (
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm relative animate-in fade-in">
              <iframe
                title="Search Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={mapEmbedUrl}
                className="w-full h-full"
              />
            </div>
          )}

          {isLoading ? (
            <BusinessListSkeleton count={4} variant="list" />
          ) : filtered.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 space-y-3">
              <p className="text-neutral-500 text-sm">
                No matching local businesses found for &ldquo;{query}&rdquo;.
              </p>
              <Link
                href="/indore/hotels"
                className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Browse Hotels in Indore
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Sponsored Results Section (Top 10 Slots Supported) */}
              {filtered.slice(0, Math.min(filtered.length, 10)).length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5">
                        <span>🟠 Top Sponsored Businesses</span>
                      </span>
                      <span className="text-[11px] text-neutral-400">Positioned by monthly maximum bid</span>
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-500">
                      Showing up to 10 verified sponsored spots
                    </span>
                  </div>

                  <div className="space-y-4">
                    {filtered.slice(0, Math.min(filtered.length, 10)).map((biz, idx) => {
                      const isFav = !!favorites[biz.id];
                      const rankNum = idx + 1;
                      const dist = userCoords && biz.latitude && biz.longitude
                        ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, biz.latitude, biz.longitude)
                        : null;

                      return (
                        <BusinessCard
                          key={biz.id}
                          business={biz}
                          isSponsored={true}
                          sponsoredRank={rankNum}
                          distanceKm={dist}
                          isFavorite={isFav}
                          onToggleFavorite={(id, e) => toggleFavorite(e, id)}
                          variant="list"
                          isPriority={idx < 2}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top Rated Results Section */}
              <div className="space-y-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Top Rated Businesses</span>
                  </span>
                  <span className="text-[11px] text-neutral-400">Ranked by authentic reviews & quality</span>
                </div>

                <div className="space-y-4">
                  {(filtered.length > 2 ? filtered.slice(2) : filtered).map((biz, idx) => {
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
                        variant="list"
                        isPriority={idx < 2}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <head>
        <title>Search Local Businesses & Services | RankCity</title>
        <meta name="robots" content="noindex, follow" />
      </head>
      <RoleSwitcherBar />
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<div className="text-center py-20 text-xs text-neutral-500">Loading RankCity search engine...</div>}>
          <SearchResultsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
