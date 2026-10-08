'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from '@clerk/nextjs';
import {
  MapPin,
  ChevronDown,
  Menu,
  X,
  User,
  Heart,
  Compass,
  Clock,
  Home as HomeIcon,
  Search,
  Building2,
  Bed,
  Utensils,
  PlusCircle,
  Pill,
  Scissors,
  Dumbbell,
  ShoppingBag,
  Car,
  TrendingUp,
  ShieldCheck,
  Wallet,
  Receipt,
  Star,
  Sparkles,
  Users,
  LayoutDashboard,
  LogOut,
  HelpCircle,
  Layers,
  ArrowRight,
  CheckCircle2,
  Phone,
  BarChart3,
  Briefcase,
  Store,
} from 'lucide-react';

interface MegaItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

import { useUserLocation } from '@/lib/location/context';
import {
  Navigation2,
  Loader2,
} from 'lucide-react';

export function Navbar() {
  const { currentUser } = useAuth();
  const { city: userCity, area: userArea, isLoading: isLocLoading, source: locSource, requestCurrentLocation, setManualCity } = useUserLocation();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'categories' | 'cities' | 'business' | 'citySelect' | 'account' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Scroll detection matching reference UI
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close open menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const cities = [
    { name: 'Indore', slug: 'indore', badge: 'Active Hub' },
    { name: 'Bhopal', slug: 'bhopal', badge: 'Capital' },
    { name: 'Mumbai', slug: 'mumbai', badge: 'Metro' },
    { name: 'Bengaluru', slug: 'bengaluru', badge: 'Tech' },
    { name: 'New Delhi', slug: 'delhi', badge: 'NCR' },
  ];

  const handleCitySelect = (cityName: string, slug: string) => {
    setManualCity(cityName);
    setActiveMenu(null);
    router.push(`/${slug}/hotels`);
  };

  // Mega-menu datasets matching RankCity local business discovery
  const popularCategories: MegaItem[] = [
    {
      title: 'Hotels & Resorts',
      href: '/indore/hotels',
      icon: <Bed className="w-4 h-4" />,
      description: 'Luxury suites, boutique stays & verified hotels',
    },
    {
      title: 'Restaurants & Cafes',
      href: '/indore/restaurants',
      icon: <Utensils className="w-4 h-4" />,
      description: 'Fine dine, street food & family eateries',
    },
    {
      title: 'Hospitals & Medical',
      href: '/indore/healthcare',
      icon: <PlusCircle className="w-4 h-4" />,
      description: 'Multi-speciality hospitals, clinics & diagnostics',
    },
  ];

  const lifestyleCategories: MegaItem[] = [
    {
      title: 'Pharmacies 24/7',
      href: '/indore/healthcare',
      icon: <Pill className="w-4 h-4" />,
      description: 'Emergency chemists, medical supplies & stores',
    },
    {
      title: 'Salons & Spas',
      href: '/indore/services',
      icon: <Scissors className="w-4 h-4" />,
      description: 'Unisex hair styling, skin care & wellness spas',
    },
    {
      title: 'Gyms & Fitness',
      href: '/indore/services',
      icon: <Dumbbell className="w-4 h-4" />,
      description: 'Fitness centers, trainers, crossfit & yoga',
    },
  ];

  const commerceCategories: MegaItem[] = [
    {
      title: 'Shopping & Retail',
      href: '/indore/shopping',
      icon: <ShoppingBag className="w-4 h-4" />,
      description: 'Malls, fashion boutiques & electronics stores',
    },
    {
      title: 'Automotive & Repairs',
      href: '/indore/services',
      icon: <Car className="w-4 h-4" />,
      description: 'Car workshops, authorized service & detailing',
    },
    {
      title: 'All Categories',
      href: '/categories',
      icon: <Layers className="w-4 h-4" />,
      description: 'Explore full catalog across 50+ local sectors',
    },
  ];

  const businessSolutions: MegaItem[] = [
    {
      title: 'Pricing & Plans',
      href: '/pricing',
      icon: <Receipt className="w-4 h-4" />,
      description: 'Free business listing vs monthly sponsored bid estimator',
    },
    {
      title: 'How Rankings Work',
      href: '/how-it-works',
      icon: <HelpCircle className="w-4 h-4" />,
      description: 'Transparent monthly maximum bids & minimum-required prices',
    },
    {
      title: 'Sponsored Ranking',
      href: '/publisher/campaigns/new',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Compete for #1 city ranking via transparent monthly bids',
    },
    {
      title: 'Lead Generation Engine',
      href: '/publisher/leads',
      icon: <Phone className="w-4 h-4" />,
      description: 'Receive verified call, WhatsApp & direction leads',
    },
    {
      title: 'Business Verification',
      href: '/publisher/verification',
      icon: <ShieldCheck className="w-4 h-4" />,
      description: 'Earn the trust badge and verified business status',
    },
  ];

  const businessTools: MegaItem[] = [
    {
      title: 'Merchant Wallet',
      href: '/publisher/wallet',
      icon: <Wallet className="w-4 h-4" />,
      description: 'Instant UPI/Card recharge for uninterrupted ranking',
    },
    {
      title: 'Live Auction Center',
      href: '/publisher/bids',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Real-time outbid notifications & second-price auctions',
    },
    {
      title: 'Performance Analytics',
      href: '/publisher/analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Track impressions, profile views, and lead conversions',
    },
  ];

  const cityShowcase: MegaItem[] = [
    {
      title: 'Indore, MP',
      href: '/indore/hotels',
      icon: <MapPin className="w-4 h-4" />,
      description: 'Vijay Nagar, Palasia, Rajwada, Geeta Bhawan',
    },
    {
      title: 'Bhopal, MP',
      href: '/bhopal/hotels',
      icon: <MapPin className="w-4 h-4" />,
      description: 'MP Nagar, Arera Colony, New Market',
    },
    {
      title: 'Mumbai, MH',
      href: '/mumbai/hotels',
      icon: <MapPin className="w-4 h-4" />,
      description: 'Bandra, Andheri, BKC, South Mumbai',
    },
    {
      title: 'Bengaluru, KA',
      href: '/bengaluru/hotels',
      icon: <MapPin className="w-4 h-4" />,
      description: 'Indiranagar, Koramangala, Whitefield',
    },
    {
      title: 'New Delhi, NCR',
      href: '/delhi/hotels',
      icon: <MapPin className="w-4 h-4" />,
      description: 'Connaught Place, South Ex, Aerocity',
    },
  ];

  // Mobile bottom bar items matching Customer UI/UX architecture:
  const mobileBottomNav = [
    { label: 'Home', href: '/', icon: HomeIcon, isActive: pathname === '/' },
    { label: 'Explore', href: '/explore', icon: Compass, isActive: pathname.startsWith('/explore') || pathname.includes('/hotels') },
    { label: 'Saved', href: '/saved', icon: Heart, isActive: pathname === '/saved' },
    { label: 'Account', href: '/account', icon: User, isActive: pathname === '/account' },
  ];

  const toggleMenu = (menu: 'categories' | 'cities' | 'business' | 'citySelect' | 'account') => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <>
      <header
        ref={navRef}
        className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md transition-all duration-300 ${
          scrolled
            ? 'border-b border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
            : 'border-b border-neutral-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Wordmark + Navigation Menus */}
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-2 group shrink-0 py-1">
              <img
                src="/rankcity-logo.png"
                alt="RankCity - Discover Local Businesses"
                className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-102"
              />
            </Link>

            {/* Desktop Navigation Menus matching Reference UI */}
            <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              {/* 1. Home Direct Link */}
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  pathname === '/'
                    ? 'text-neutral-900 font-bold bg-neutral-100'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                Home
              </Link>

              {/* 2. Explore Direct Link */}
              <Link
                href="/explore"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  pathname.startsWith('/explore')
                    ? 'text-neutral-900 font-bold bg-neutral-100'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                Explore
              </Link>

              {/* 3. Categories Mega-menu Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleMenu('categories')}
                  onMouseEnter={() => setActiveMenu('categories')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeMenu === 'categories'
                      ? 'text-neutral-950 font-bold bg-neutral-100'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                      activeMenu === 'categories' ? 'rotate-180 text-neutral-900' : ''
                    }`}
                  />
                </button>

                {/* Categories Mega Dropdown */}
                {activeMenu === 'categories' && (
                  <div
                    onMouseLeave={() => setActiveMenu(null)}
                    className="absolute left-0 mt-2 w-[760px] bg-white border border-neutral-200/90 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="grid grid-cols-3 gap-5">
                      {/* Column 1: Popular */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-2">
                          Popular
                        </div>
                        <ul className="space-y-1">
                          {popularCategories.map((item) => (
                            <ListItem key={item.title} item={item} />
                          ))}
                        </ul>
                      </div>

                      {/* Column 2: Lifestyle & Care */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-2">
                          Care & Lifestyle
                        </div>
                        <ul className="space-y-1">
                          {lifestyleCategories.map((item) => (
                            <ListItem key={item.title} item={item} />
                          ))}
                        </ul>
                      </div>

                      {/* Column 3: Commerce & Auto */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-2">
                          Commerce & Auto
                        </div>
                        <ul className="space-y-1">
                          {commerceCategories.map((item) => (
                            <ListItem key={item.title} item={item} />
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Footer bar */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between px-2 text-xs text-neutral-500">
                      <span>Looking for a specific business or service?</span>
                      <Link
                        href="/categories"
                        className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <span>Browse 50+ Categories</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Cities Mega-menu Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleMenu('cities')}
                  onMouseEnter={() => setActiveMenu('cities')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeMenu === 'cities'
                      ? 'text-neutral-950 font-bold bg-neutral-100'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                  }`}
                >
                  <span>Cities</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                      activeMenu === 'cities' ? 'rotate-180 text-neutral-900' : ''
                    }`}
                  />
                </button>

                {/* Cities Dropdown */}
                {activeMenu === 'cities' && (
                  <div
                    onMouseLeave={() => setActiveMenu(null)}
                    className="absolute left-0 mt-2 w-[480px] bg-white border border-neutral-200/90 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-2">
                      Top Discovery Cities
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {cityShowcase.map((item) => (
                        <ListItem key={item.title} item={item} />
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-100 px-2 flex items-center justify-between text-xs text-neutral-500">
                      <span>Currently active in 5 commercial hubs</span>
                      <Link href="/explore" className="font-semibold text-blue-600 hover:text-blue-700">
                        View City Directory
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. For Business Mega-menu Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleMenu('business')}
                  onMouseEnter={() => setActiveMenu('business')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeMenu === 'business'
                      ? 'text-neutral-950 font-bold bg-neutral-100'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                  }`}
                >
                  <span>For Business</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                      activeMenu === 'business' ? 'rotate-180 text-neutral-900' : ''
                    }`}
                  />
                </button>

                {/* For Business Dropdown */}
                {activeMenu === 'business' && (
                  <div
                    onMouseLeave={() => setActiveMenu(null)}
                    className="absolute left-0 mt-2 w-[580px] bg-white border border-neutral-200/90 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-2">
                          Growth Solutions
                        </div>
                        <ul className="space-y-1">
                          {businessSolutions.map((item) => (
                            <ListItem key={item.title} item={item} />
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-2">
                          Merchant Tools
                        </div>
                        <ul className="space-y-1">
                          {businessTools.map((item) => (
                            <ListItem key={item.title} item={item} />
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between px-2 text-xs">
                      <span className="text-neutral-500">Already a registered partner?</span>
                      <Show when="signed-in">
                        <Link
                          href="/publisher"
                          className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <span>Open Business Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Show>
                      <Show when="signed-out">
                        <SignInButton mode="modal">
                          <button
                            type="button"
                            className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Sign in to Dashboard</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </SignInButton>
                      </Show>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Action Center: City Selector + Dashboard + Add Business CTA + Clerk Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. Interactive City & Live Location Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('citySelect')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full transition-all cursor-pointer shadow-2xs"
              >
                {locSource === 'browser_gps' ? (
                  <Navigation2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0 animate-pulse" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                )}
                <span className="max-w-[110px] truncate">{userCity}</span>
                <ChevronDown
                  className={`w-3 h-3 text-neutral-400 transition-transform ${
                    activeMenu === 'citySelect' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeMenu === 'citySelect' && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl py-2.5 z-50 animate-in fade-in zoom-in-95">
                  {/* GPS Auto-detect Button */}
                  <div className="px-2.5 pb-2 border-b border-neutral-100">
                    <button
                      type="button"
                      disabled={isLocLoading}
                      onClick={async () => {
                        await requestCurrentLocation();
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      {isLocLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Navigation2 className="w-4 h-4 text-blue-600 fill-blue-600" />
                      )}
                      <div className="text-left flex-1 min-w-0">
                        <div className="leading-tight">
                          {isLocLoading ? 'Detecting GPS...' : 'Use Current Location'}
                        </div>
                        <div className="text-[10px] text-blue-600/80 font-normal truncate">
                          {userArea ? `${userArea} (${userCity})` : 'Exact GPS nearby discovery'}
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                    Select City Manually
                  </div>
                  {cities.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => handleCitySelect(c.name, c.slug)}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                        userCity === c.name ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-500 font-normal">
                          {c.badge}
                        </span>
                      </div>
                      {userCity === c.name && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. For Business / Dashboard Quick Outline Button (Only when signed-in) */}
            <Show when="signed-in">
              <Link
                href="/publisher"
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-colors"
              >
                <span>Dashboard</span>
              </Link>
            </Show>

            {/* 3. Primary "Add Your Business" CTA (Hidden on small mobile to prevent header overflow) */}
            <Link
              href="/add-business"
              className="hidden sm:inline-flex px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer items-center gap-1.5"
            >
              <span>Add Your Business</span>
            </Link>

            {/* 4. Clerk Auth Controls: Sign In Button or User Avatar Button */}
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-neutral-800 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/80 rounded-full transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-2 pl-0.5">
                <Link
                  href="/profile"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-blue-600 bg-neutral-100 hover:bg-neutral-200/80 rounded-full transition-colors cursor-pointer"
                  title="Edit Profile"
                >
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Profile</span>
                </Link>
                <UserButton />
              </div>
            </Show>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Top Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-100 bg-white px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-neutral-700">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-neutral-50 hover:text-blue-600"
              >
                Home
              </Link>
              <Link
                href="/explore"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-neutral-50 hover:text-blue-600"
              >
                Explore Businesses
              </Link>
              <Link
                href="/categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-neutral-50 hover:text-blue-600"
              >
                All Categories
              </Link>
              <Link
                href="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-neutral-50 hover:text-blue-600"
              >
                Pricing & Plans
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-neutral-50 hover:text-blue-600"
              >
                How Rankings Work
              </Link>
              <Link
                href="/saved"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-neutral-50 hover:text-blue-600"
              >
                Saved Businesses
              </Link>
              <Show when="signed-in">
                <Link
                  href="/publisher"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-neutral-50 hover:text-blue-600 font-semibold text-blue-600"
                >
                  For Business / Owner Portal
                </Link>
              </Show>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-neutral-50 hover:text-blue-600"
              >
                Help & Support
              </Link>

              {/* Mobile Add Business CTA */}
              <div className="pt-2">
                <Link
                  href="/add-business"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Your Business (Free)</span>
                </Link>
              </div>

              {/* Mobile Auth Status */}
              <Show when="signed-in">
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between px-3">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs text-blue-600 font-bold hover:underline"
                  >
                    <User className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>
                  <UserButton />
                </div>
              </Show>
              <Show when="signed-out">
                <div className="pt-2 border-t border-neutral-100">
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="w-full text-center px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Sign In / Register
                    </button>
                  </SignInButton>
                </div>
              </Show>
            </nav>
          </div>
        )}
      </header>

      {/* Customer Mobile Bottom Navigation Bar: Home | Explore | Saved | Account */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-1.5 px-2 flex items-center justify-around shadow-lg"
      >
        {mobileBottomNav.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-center transition-colors ${
                item.isActive ? 'text-blue-600 font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

// Reusable ListItem matching the reference UI hover behavior and styling
function ListItem({ item }: { item: MegaItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className="group flex gap-2.5 items-start rounded-xl p-2 hover:bg-neutral-50 transition-colors"
      >
        <div className="border border-neutral-200 rounded-lg p-2 text-neutral-600 bg-neutral-50/50 group-hover:bg-neutral-950 group-hover:text-white group-hover:scale-105 transition-all duration-200 shrink-0">
          {item.icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-neutral-900 group-hover:text-neutral-950 leading-tight">
            {item.title}
          </div>
          <p className="text-[11px] text-neutral-500 line-clamp-1 pt-0.5 leading-snug">
            {item.description}
          </p>
        </div>
      </Link>
    </li>
  );
}
