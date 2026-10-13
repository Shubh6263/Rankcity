-- =========================================================================
-- RANKCITY INDIA LOCATION DATABASE HIERARCHY MIGRATION
-- Run this in Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =========================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STATES & UNION TERRITORIES TABLE (All 28 States & 8 UTs)
CREATE TABLE IF NOT EXISTS public.states (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_hi TEXT,
  code TEXT NOT NULL UNIQUE,       -- ISO 3166-2:IN code e.g. MP, MH, KA, DL
  lgd_code INTEGER UNIQUE,         -- Official Local Government Directory code
  type TEXT NOT NULL DEFAULT 'STATE' CHECK (type IN ('STATE', 'UT')),
  capital TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DISTRICTS TABLE (All 750+ Administrative Districts)
CREATE TABLE IF NOT EXISTS public.districts (
  id TEXT PRIMARY KEY,
  state_id TEXT NOT NULL REFERENCES public.states(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  name_hi TEXT,
  lgd_code INTEGER UNIQUE,         -- Official LGD district code
  headquarter TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_district_state_name UNIQUE (state_id, name)
);

-- 3. CITIES & URBAN LOCAL BODIES TABLE
CREATE TABLE IF NOT EXISTS public.cities (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  name_hi TEXT,
  city_type TEXT NOT NULL DEFAULT 'City', -- Municipal Corporation, Municipality, Nagar Parishad, Cantonment Board, Census Town
  lgd_code INTEGER UNIQUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_city_district_name UNIQUE (district_id, name)
);

-- 4. VILLAGES & RURAL REVENUE ENTITIES TABLE
CREATE TABLE IF NOT EXISTS public.villages (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
  subdistrict_id TEXT,             -- Tehsil / Taluk LGD reference
  name TEXT NOT NULL,
  name_hi TEXT,
  lgd_code INTEGER,
  pincode TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. LOCALITIES & NEIGHBORHOODS TABLE
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

-- 6. PINCODES & POST OFFICES TABLE (One PIN can map to multiple Post Offices)
CREATE TABLE IF NOT EXISTS public.pincodes (
  id TEXT PRIMARY KEY,
  pincode TEXT NOT NULL,
  post_office_name TEXT NOT NULL,
  district_id TEXT REFERENCES public.districts(id) ON DELETE RESTRICT,
  state_id TEXT REFERENCES public.states(id) ON DELETE RESTRICT,
  circle TEXT,                     -- Postal Circle e.g. Madhya Pradesh, Maharashtra
  region TEXT,                     -- Postal Region e.g. Indore, Mumbai
  division TEXT,                   -- Postal Division e.g. Indore City
  office_type TEXT,                -- G.P.O., H.O., S.O., B.O.
  delivery_status TEXT DEFAULT 'Delivery',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. LOCATION IMPORT LOGS & AUDIT HISTORY
CREATE TABLE IF NOT EXISTS public.location_import_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source TEXT NOT NULL,            -- 'LGD', 'OGD_INDIA', 'INDIA_POST', 'CUSTOM_CSV', 'CUSTOM_JSON'
  file_name TEXT,
  import_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  records_added INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_rejected INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'failed', 'dry_run'
  is_dry_run BOOLEAN NOT NULL DEFAULT false,
  error_details JSONB DEFAULT '[]'::jsonb,
  triggered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. USER LOCATION SUGGESTIONS (Missing Locations Submitted for Admin Review)
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

-- =========================================================================
-- INDEXES FOR ULTRA-FAST HIERARCHICAL LOOKUP & SEARCH
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_states_code ON public.states(code);
CREATE INDEX IF NOT EXISTS idx_states_lgd ON public.states(lgd_code);
CREATE INDEX IF NOT EXISTS idx_states_active ON public.states(is_active);

CREATE INDEX IF NOT EXISTS idx_districts_state ON public.districts(state_id);
CREATE INDEX IF NOT EXISTS idx_districts_name ON public.districts(name);
CREATE INDEX IF NOT EXISTS idx_districts_lgd ON public.districts(lgd_code);

CREATE INDEX IF NOT EXISTS idx_cities_district ON public.cities(district_id);
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_type ON public.cities(city_type);

CREATE INDEX IF NOT EXISTS idx_villages_district ON public.villages(district_id);
CREATE INDEX IF NOT EXISTS idx_villages_name ON public.villages(name);

CREATE INDEX IF NOT EXISTS idx_localities_city ON public.localities(city_id);
CREATE INDEX IF NOT EXISTS idx_localities_pincode ON public.localities(pincode);

CREATE INDEX IF NOT EXISTS idx_pincodes_pincode ON public.pincodes(pincode);
CREATE INDEX IF NOT EXISTS idx_pincodes_district ON public.pincodes(district_id);
CREATE INDEX IF NOT EXISTS idx_pincodes_state ON public.pincodes(state_id);

CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.location_suggestions(status);

-- =========================================================================
-- BUSINESS TABLE BACKWARD-COMPATIBLE LINKAGE
-- =========================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses') THEN
    ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS state_id TEXT REFERENCES public.states(id);
    ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS district_id TEXT REFERENCES public.districts(id);
    ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS city_id TEXT REFERENCES public.cities(id);
    ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS locality_id TEXT REFERENCES public.localities(id);
  END IF;
END $$;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_suggestions ENABLE ROW LEVEL SECURITY;

-- Public read policies for location hierarchy (idempotent drops)
DROP POLICY IF EXISTS "Public Read Active States" ON public.states;
DROP POLICY IF EXISTS "Public Read Active Districts" ON public.districts;
DROP POLICY IF EXISTS "Public Read Active Cities" ON public.cities;
DROP POLICY IF EXISTS "Public Read Active Villages" ON public.villages;
DROP POLICY IF EXISTS "Public Read Active Localities" ON public.localities;
DROP POLICY IF EXISTS "Public Read Active Pincodes" ON public.pincodes;
DROP POLICY IF EXISTS "Public Submit Location Suggestion" ON public.location_suggestions;
DROP POLICY IF EXISTS "Public Read Own Suggestions" ON public.location_suggestions;
DROP POLICY IF EXISTS "Service Role All States" ON public.states;
DROP POLICY IF EXISTS "Service Role All Districts" ON public.districts;
DROP POLICY IF EXISTS "Service Role All Cities" ON public.cities;
DROP POLICY IF EXISTS "Service Role All Villages" ON public.villages;
DROP POLICY IF EXISTS "Service Role All Localities" ON public.localities;
DROP POLICY IF EXISTS "Service Role All Pincodes" ON public.pincodes;
DROP POLICY IF EXISTS "Service Role All Import Logs" ON public.location_import_logs;
DROP POLICY IF EXISTS "Service Role All Suggestions" ON public.location_suggestions;

CREATE POLICY "Public Read Active States" ON public.states FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Districts" ON public.districts FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Cities" ON public.cities FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Villages" ON public.villages FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Localities" ON public.localities FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Pincodes" ON public.pincodes FOR SELECT USING (is_active = true);

-- Suggestions: Anyone can submit a suggestion; users can only read their own suggestions
CREATE POLICY "Public Submit Location Suggestion" ON public.location_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Own Suggestions" ON public.location_suggestions FOR SELECT USING (auth.uid()::text = submitted_by_user_id);

-- Service Role Full Access
CREATE POLICY "Service Role All States" ON public.states FOR ALL USING (true);
CREATE POLICY "Service Role All Districts" ON public.districts FOR ALL USING (true);
CREATE POLICY "Service Role All Cities" ON public.cities FOR ALL USING (true);
CREATE POLICY "Service Role All Villages" ON public.villages FOR ALL USING (true);
CREATE POLICY "Service Role All Localities" ON public.localities FOR ALL USING (true);
CREATE POLICY "Service Role All Pincodes" ON public.pincodes FOR ALL USING (true);
CREATE POLICY "Service Role All Import Logs" ON public.location_import_logs FOR ALL USING (true);
CREATE POLICY "Service Role All Suggestions" ON public.location_suggestions FOR ALL USING (true);

