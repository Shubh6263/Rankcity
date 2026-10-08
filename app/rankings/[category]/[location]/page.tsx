'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { AuctionHeroCard } from '@/components/rankings/AuctionHeroCard';
import { RankingList } from '@/components/rankings/RankingList';
import { QuickBidModal } from '@/components/publisher/QuickBidModal';
import { WalletTopupModal } from '@/components/publisher/WalletTopupModal';
import { useAuth } from '@/lib/auth/context';
import { Category, Subcategory, LocationHierarchy, Campaign, Website } from '@/types';
import {
  generateBreadcrumbSchema,
  generateCategoryItemListSchema,
  generateFAQSchema,
} from '@/lib/seo/schema';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Map as MapIcon,
  ChevronDown,
  Star,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface RankingPageProps {
  params: Promise<{
    category: string;
    location: string;
  }>;
}

export default function RankingBoardPage({ params }: RankingPageProps) {
  const resolvedParams = use(params);
  const { category: categorySlug, location: locationSlug } = resolvedParams;
  const router = useRouter();
  const { currentUser } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [location, setLocation] = useState<LocationHierarchy | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapView, setIsMapView] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [sortBy, setSortBy] = useState('relevance');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [showAllLocalities, setShowAllLocalities] = useState(false);

  const [items, setItems] = useState<Array<{
    campaign: Campaign;
    website: Website;
    publisher: { id: string; name: string; companyName?: string };
  }>>([]);
  const [highestBidPaise, setHighestBidPaise] = useState(1000);
  const [minNextBidPaise, setMinNextBidPaise] = useState(1100);
  const [totalCompetitors, setTotalCompetitors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedCampaignForBid, setSelectedCampaignForBid] = useState<Campaign | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const fetchRankings = useCallback(async () => {
    try {
      let url = `/api/rankings?category=${categorySlug}&location=${locationSlug}`;
      if (selectedSubcategory) {
        url += `&subcategory=${selectedSubcategory}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCategory(data.category);
        setLocation(data.location);
        setItems(data.items || []);
        setHighestBidPaise(data.highestBidPaise || 1000);
        setMinNextBidPaise(data.minNextBidPaise || 1100);
        setTotalCompetitors(data.totalCompetitors || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, locationSlug, selectedSubcategory]);

  useEffect(() => {
    fetchRankings();
    const interval = setInterval(fetchRankings, 8000);
    return () => clearInterval(interval);
  }, [fetchRankings]);

  // Identify user's campaign on this board if any
  const userCampaign = items.find((i) => i.campaign.publisherId === currentUser.id)?.campaign;

  const handleQuickBid = (targetPaise: number) => {
    if (userCampaign) {
      setSelectedCampaignForBid(userCampaign);
    } else if (items.length > 0) {
      setSelectedCampaignForBid(items[0].campaign);
    }
    setIsBidModalOpen(true);
  };

  const handleBidClickOnItem = (campaign: Campaign) => {
    setSelectedCampaignForBid(campaign);
    setIsBidModalOpen(true);
  };

  const handleRecordClick = async (websiteId: string, targetUrl: string) => {
    try {
      await fetch(`/api/websites/${websiteId}/click`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLocalityToggle = (locName: string) => {
    setSelectedLocalities((prev) =>
      prev.includes(locName) ? prev.filter((l) => l !== locName) : [...prev, locName]
    );
  };

  // Filter items by search query, rating, and locality
  const filteredItems = items.filter((item) => {
    const biz = item.website;
    const matchesSearch =
      !searchQuery.trim() ||
      biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (biz.services && biz.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (biz.locality && biz.locality.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRating = selectedRating === null || (biz.rating || 0) >= selectedRating;

    const matchesLocality =
      selectedLocalities.length === 0 ||
      (biz.locality && selectedLocalities.includes(biz.locality));

    return matchesSearch && matchesRating && matchesLocality;
  });

  const localitiesList = [
    { name: 'Vijay Nagar', count: 50 },
    { name: 'Geeta Bhawan', count: 42 },
    { name: 'Rajwada', count: 38 },
    { name: 'Palasia', count: 28 },
    { name: 'AB Road', count: 21 },
    { name: 'Sapna Sangeeta', count: 19 },
  ];

  const mapEmbedUrl = `https://maps.google.com/maps?q=Hotels%20in%20Indore%20Madhya%20Pradesh&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Schema.org Breadcrumbs & AEO FAQ for Local Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: location?.city || locationSlug, url: `/${locationSlug}/hotels` },
              { name: category?.name || categorySlug, url: `/${locationSlug}/${categorySlug}` },
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
                question: `What are the best ${category?.name || 'hotels'} in ${location?.city || locationSlug}?`,
                answer: `Top rated and verified ${category?.name || 'hotels'} in ${location?.city || locationSlug} include verified listings like Hotel The Grand Imperial, Grand Palace, and Royal Residency with verified user reviews, ratings, and instant contact details on RankCity.`,
              },
              {
                question: `How can I contact ${category?.name || 'businesses'} in ${location?.city || locationSlug}?`,
                answer: `You can directly tap Call, WhatsApp, or Google Maps Directions buttons on any listing on RankCity with zero intermediary charges.`,
              },
            ])
          ),
        }}
      />

      <RoleSwitcherBar />
      <Navbar />

      {/* Top Search & Filter Bar matching Mockup */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2.5 max-w-2xl">
            {/* Interactive City Selector */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="capitalize">{location?.city || locationSlug}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                    Select City
                  </div>
                  {[
                    { name: 'Indore', slug: 'indore' },
                    { name: 'Bhopal', slug: 'bhopal' },
                    { name: 'Mumbai', slug: 'mumbai' },
                    { name: 'Bengaluru', slug: 'bengaluru' },
                    { name: 'New Delhi', slug: 'delhi' },
                  ].map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => {
                        setIsCityDropdownOpen(false);
                        router.push(`/${c.slug}/${categorySlug}`);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                        (locationSlug === c.slug || location?.city?.toLowerCase() === c.name.toLowerCase())
                          ? 'text-blue-600 font-bold bg-blue-50/50'
                          : 'text-neutral-700'
                      }`}
                    >
                      <span>{c.name}</span>
                      {(locationSlug === c.slug || location?.city?.toLowerCase() === c.name.toLowerCase()) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Keyword Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${category?.name || 'hotels'}...`}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filters Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Map View Toggle Button */}
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Results Header matching Mockup Screen 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight capitalize">
              {category?.name || 'Hotels'} in {location?.city || locationSlug}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              320+ results
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
              <option value="rating">Highest Rating</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
        </div>

        {/* Split Layout: Filters Sidebar (Left) + Search Results (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Filters */}
          <aside
            className={`lg:col-span-3 space-y-6 ${
              showMobileFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Category / Sub-type Filter */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Category
              </h3>
              <div className="space-y-2 text-xs text-neutral-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubcategory === ''}
                    onChange={() => setSelectedSubcategory('')}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-neutral-900">All {category?.name || 'Hotels'}</span>
                </label>
                {(category?.subcategories || [
                  { id: '1', name: 'Luxury Hotels', slug: 'luxury' },
                  { id: '2', name: 'Budget Hotels', slug: 'budget' },
                  { id: '3', name: 'Business Hotels', slug: 'business' },
                  { id: '4', name: 'Resorts', slug: 'resorts' },
                  { id: '5', name: 'Homestays', slug: 'homestays' },
                  { id: '6', name: 'Guest Houses', slug: 'guest-houses' },
                ]).map((sub) => (
                  <label key={sub.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSubcategory === sub.slug}
                      onChange={() => setSelectedSubcategory(selectedSubcategory === sub.slug ? '' : sub.slug)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{sub.name}</span>
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

            {/* Location / Localities Filter matching Mockup Screen 2 */}
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

            {/* Subtle Compact Live Auction Card for Merchants */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-100 p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                  <span>⚡ Sponsored Rank #1</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                  LIVE
                </span>
              </div>
              <div className="text-[11px] text-neutral-600">
                Current bid: <strong>₹{highestBidPaise / 100}</strong> &bull; Next:{' '}
                <strong className="text-blue-600">₹{minNextBidPaise / 100}</strong>
              </div>
              <button
                onClick={() => handleQuickBid(minNextBidPaise)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
              >
                Bid for Rank #1
              </button>
            </div>
          </aside>

          {/* Right Main Area: Search Result Cards + Optional Map */}
          <div className="lg:col-span-9 space-y-4">
            {/* Embedded Google Map if Map View is toggled */}
            {isMapView && (
              <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm relative animate-in fade-in">
                <iframe
                  title="Indore Hotels Map"
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

            {/* Results List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-36 bg-white border border-neutral-200 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <RankingList
                items={filteredItems}
                onBidClick={handleBidClickOnItem}
                onRecordClick={handleRecordClick}
              />
            )}
          </div>
        </div>
      </main>

      {/* Bidding Modal */}
      <QuickBidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        campaign={selectedCampaignForBid}
        categoryName={category?.name}
        locationName={location?.city}
        currentHighestBidPaise={highestBidPaise}
        minNextBidPaise={minNextBidPaise}
        onBidSuccess={fetchRankings}
        onOpenWallet={() => {
          setIsBidModalOpen(false);
          setIsWalletModalOpen(true);
        }}
      />

      {/* Wallet Top-Up Modal */}
      <WalletTopupModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSuccess={() => {
          fetchRankings();
          setIsBidModalOpen(true);
        }}
      />

      <Footer />
    </div>
  );
}
