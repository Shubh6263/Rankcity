ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS card_photos JSONB,
  ADD COLUMN IF NOT EXISTS profile_photos JSONB;
