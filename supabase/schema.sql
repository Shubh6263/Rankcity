-- =========================================================================
-- RANKCITY SUPABASE POSTGRES SCHEMA MIGRATION
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =========================================================================

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- Clerk User ID (e.g. user_2...)
  name TEXT NOT NULL DEFAULT 'User',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  phone TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'Building2',
  min_bid_paise BIGINT NOT NULL DEFAULT 10000,
  bid_increment_paise BIGINT NOT NULL DEFAULT 1000,
  commission_percent INTEGER NOT NULL DEFAULT 15,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL DEFAULT 'India',
  state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
  city TEXT NOT NULL,
  locality TEXT,
  slug TEXT UNIQUE NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS public.businesses (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES public.categories(id),
  subcategoryId TEXT,
  location_id TEXT REFERENCES public.locations(id),
  address TEXT NOT NULL,
  locality TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
  country TEXT NOT NULL DEFAULT 'India',
  pincode TEXT NOT NULL DEFAULT '452010',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  website TEXT,
  opening_hours TEXT DEFAULT 'Mon - Sun: 9:00 AM - 10:00 PM',
  price_range TEXT DEFAULT '₹₹',
  services JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  cover_image TEXT,
  logo TEXT,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'approved',
  total_views INTEGER NOT NULL DEFAULT 0,
  total_calls INTEGER NOT NULL DEFAULT 0,
  total_whatsapp INTEGER NOT NULL DEFAULT 0,
  total_directions INTEGER NOT NULL DEFAULT 0,
  total_website_clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CAMPAIGNS TABLE (Monthly Sponsored Positions)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  publisher_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  location_id TEXT NOT NULL REFERENCES public.locations(id),
  subcategoryId TEXT,
  target_rank INTEGER NOT NULL DEFAULT 1,
  current_rank INTEGER NOT NULL DEFAULT 1,
  max_bid_paise BIGINT NOT NULL DEFAULT 10000,
  effective_bid_paise BIGINT NOT NULL DEFAULT 10000,
  spent_paise BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  auto_bid_enabled BOOLEAN NOT NULL DEFAULT false,
  max_budget_paise BIGINT NOT NULL DEFAULT 50000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. WALLETS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.wallets (
  user_id TEXT PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance_paise BIGINT NOT NULL DEFAULT 0,
  reserved_paise BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_paise BIGINT NOT NULL,
  type TEXT NOT NULL DEFAULT 'deposit',
  status TEXT NOT NULL DEFAULT 'successful',
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  gateway_ref TEXT,
  upi_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ENQUIRY LEADS
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Public read policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public read access to discovery catalog
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Public Read Businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Public Read Campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (status = 'approved');

-- Allow service role full access
CREATE POLICY "Service Role All Profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Service Role All Categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Service Role All Locations" ON public.locations FOR ALL USING (true);
CREATE POLICY "Service Role All Businesses" ON public.businesses FOR ALL USING (true);
CREATE POLICY "Service Role All Campaigns" ON public.campaigns FOR ALL USING (true);
CREATE POLICY "Service Role All Wallets" ON public.wallets FOR ALL USING (true);
CREATE POLICY "Service Role All Transactions" ON public.wallet_transactions FOR ALL USING (true);
CREATE POLICY "Service Role All Reviews" ON public.reviews FOR ALL USING (true);
CREATE POLICY "Service Role All Enquiries" ON public.enquiries FOR ALL USING (true);
