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

-- =========================================================================
-- 9. COMPLETE INDIA LOCATION HIERARCHY TABLES
-- =========================================================================

-- STATES (All 28 States & 8 Union Territories)
CREATE TABLE IF NOT EXISTS public.states (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_hi TEXT,
  code TEXT NOT NULL UNIQUE,
  lgd_code INTEGER UNIQUE,
  type TEXT NOT NULL DEFAULT 'STATE' CHECK (type IN ('STATE', 'UT')),
  capital TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DISTRICTS (750+ Districts)
CREATE TABLE IF NOT EXISTS public.districts (
  id TEXT PRIMARY KEY,
  state_id TEXT NOT NULL REFERENCES public.states(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  name_hi TEXT,
  lgd_code INTEGER UNIQUE,
  headquarter TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_district_state_name UNIQUE (state_id, name)
);

-- CITIES & URBAN LOCAL BODIES
CREATE TABLE IF NOT EXISTS public.cities (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  name_hi TEXT,
  city_type TEXT NOT NULL DEFAULT 'City',
  lgd_code INTEGER UNIQUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_city_district_name UNIQUE (district_id, name)
);

-- VILLAGES
CREATE TABLE IF NOT EXISTS public.villages (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
  subdistrict_id TEXT,
  name TEXT NOT NULL,
  name_hi TEXT,
  lgd_code INTEGER,
  pincode TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LOCALITIES
CREATE TABLE IF NOT EXISTS public.localities (
  id TEXT PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_locality_city_name UNIQUE (city_id, name)
);

-- PINCODES & POST OFFICES
CREATE TABLE IF NOT EXISTS public.pincodes (
  id TEXT PRIMARY KEY,
  pincode TEXT NOT NULL,
  post_office_name TEXT NOT NULL,
  district_id TEXT REFERENCES public.districts(id) ON DELETE RESTRICT,
  state_id TEXT REFERENCES public.states(id) ON DELETE RESTRICT,
  circle TEXT,
  region TEXT,
  division TEXT,
  office_type TEXT,
  delivery_status TEXT DEFAULT 'Delivery',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LOCATION IMPORT LOGS
CREATE TABLE IF NOT EXISTS public.location_import_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source TEXT NOT NULL,
  file_name TEXT,
  import_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  records_added INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_rejected INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  is_dry_run BOOLEAN NOT NULL DEFAULT false,
  error_details JSONB DEFAULT '[]'::jsonb,
  triggered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USER LOCATION SUGGESTIONS
CREATE TABLE IF NOT EXISTS public.location_suggestions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  location_type TEXT NOT NULL DEFAULT 'city' CHECK (location_type IN ('state', 'district', 'city', 'town', 'village', 'locality', 'pincode')),
  name TEXT NOT NULL,
  state_name TEXT NOT NULL,
  district_name TEXT,
  city_name TEXT,
  pincode TEXT,
  submitted_by_user_id TEXT,
  contact_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_states_code ON public.states(code);
CREATE INDEX IF NOT EXISTS idx_states_lgd ON public.states(lgd_code);
CREATE INDEX IF NOT EXISTS idx_districts_state ON public.districts(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_district ON public.cities(district_id);
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities(name);
CREATE INDEX IF NOT EXISTS idx_localities_city ON public.localities(city_id);
CREATE INDEX IF NOT EXISTS idx_pincodes_pincode ON public.pincodes(pincode);
CREATE INDEX IF NOT EXISTS idx_pincodes_district ON public.pincodes(district_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.location_suggestions(status);

-- Enable RLS & Policies
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Active States" ON public.states FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Districts" ON public.districts FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Cities" ON public.cities FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Villages" ON public.villages FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Localities" ON public.localities FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Pincodes" ON public.pincodes FOR SELECT USING (is_active = true);
CREATE POLICY "Public Submit Location Suggestion" ON public.location_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Own Suggestions" ON public.location_suggestions FOR SELECT USING (true);

CREATE POLICY "Service Role All States" ON public.states FOR ALL USING (true);
CREATE POLICY "Service Role All Districts" ON public.districts FOR ALL USING (true);
CREATE POLICY "Service Role All Cities" ON public.cities FOR ALL USING (true);
CREATE POLICY "Service Role All Villages" ON public.villages FOR ALL USING (true);
CREATE POLICY "Service Role All Localities" ON public.localities FOR ALL USING (true);
CREATE POLICY "Service Role All Pincodes" ON public.pincodes FOR ALL USING (true);
CREATE POLICY "Service Role All Import Logs" ON public.location_import_logs FOR ALL USING (true);
CREATE POLICY "Service Role All Suggestions" ON public.location_suggestions FOR ALL USING (true);

