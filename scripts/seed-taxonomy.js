const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nthxlkclfnfnzblpinge.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50aHhsa2NsZm5mbnpibHBpbmdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTM4MDgxOCwiZXhwIjoyMTA2OTU2ODE4fQ.2NedOAOJKQtnY56kGgJIsxG9wG-mzPnjH6BLMVbxf68';

const supabase = createClient(supabaseUrl, serviceKey);

const categories = [
  {
    id: 'cat_hospitality',
    name: 'Hotels & Hospitality',
    slug: 'hotels',
    description: 'Premier boutique hotels, business accommodations, luxury resorts, and guest houses.',
    icon_name: 'Building2',
    min_bid_paise: 10000,
    bid_increment_paise: 1000,
    commission_percent: 15,
    is_active: true,
  },
  {
    id: 'cat_dining',
    name: 'Food & Dining',
    slug: 'restaurants',
    description: 'Award-winning fine dining, rooftop cafes, traditional bakeries, and cloud kitchens.',
    icon_name: 'UtensilsCrossed',
    min_bid_paise: 2500,
    bid_increment_paise: 500,
    commission_percent: 15,
    is_active: true,
  },
  {
    id: 'cat_healthcare',
    name: 'Healthcare & Medical',
    slug: 'healthcare',
    description: 'Top multi-specialty hospitals, doctors, clinics, physiotherapy, and diagnostics.',
    icon_name: 'Stethoscope',
    min_bid_paise: 50000,
    bid_increment_paise: 5000,
    commission_percent: 15,
    is_active: true,
  },
  {
    id: 'cat_services',
    name: 'Services & Fitness',
    slug: 'services',
    description: 'Salons, luxury gyms, auto mechanics, legal advocates, and event planners.',
    icon_name: 'Briefcase',
    min_bid_paise: 2000,
    bid_increment_paise: 200,
    commission_percent: 15,
    is_active: true,
  },
  {
    id: 'cat_shopping',
    name: 'Shopping & Retail',
    slug: 'shopping',
    description: 'Boutiques, designer clothing, electronics supermarkets, and luxury jewellery.',
    icon_name: 'ShoppingBag',
    min_bid_paise: 3000,
    bid_increment_paise: 300,
    commission_percent: 15,
    is_active: true,
  },
  {
    id: 'cat_education',
    name: 'Education & Coaching',
    slug: 'education',
    description: 'Schools, engineering colleges, IIT/NEET coaching, and career institutes.',
    icon_name: 'GraduationCap',
    min_bid_paise: 4000,
    bid_increment_paise: 400,
    commission_percent: 15,
    is_active: true,
  },
];

const locations = [
  {
    id: 'loc_in_mp_indore',
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Indore',
    locality: 'All Localities',
    slug: 'indore',
    latitude: 22.7196,
    longitude: 75.8577,
  },
  {
    id: 'loc_in_mp_indore_vijay_nagar',
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Indore',
    locality: 'Vijay Nagar',
    slug: 'vijay-nagar-indore',
    latitude: 22.7533,
    longitude: 75.8937,
  },
  {
    id: 'loc_in_mp_indore_palasia',
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Indore',
    locality: 'Palasia',
    slug: 'palasia-indore',
    latitude: 22.7244,
    longitude: 75.8839,
  },
  {
    id: 'loc_in_mp_indore_geeta_bhawan',
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Indore',
    locality: 'Geeta Bhawan',
    slug: 'geeta-bhawan-indore',
    latitude: 22.722,
    longitude: 75.881,
  },
  {
    id: 'loc_in_mp_indore_rajwada',
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Indore',
    locality: 'Rajwada',
    slug: 'rajwada-indore',
    latitude: 22.718,
    longitude: 75.856,
  },
  {
    id: 'loc_in_mp_indore_sapna_sangeeta',
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Indore',
    locality: 'Sapna Sangeeta',
    slug: 'sapna-sangeeta-indore',
    latitude: 22.705,
    longitude: 75.867,
  },
  {
    id: 'loc_in_mp_indore_ab_road',
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Indore',
    locality: 'AB Road',
    slug: 'ab-road-indore',
    latitude: 22.74,
    longitude: 75.89,
  },
  {
    id: 'loc_in_mp_bhopal',
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Bhopal',
    locality: 'All Localities',
    slug: 'bhopal',
    latitude: 23.2599,
    longitude: 77.4126,
  },
  {
    id: 'loc_in_mh_mumbai',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    locality: 'All Localities',
    slug: 'mumbai',
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    id: 'loc_in_ka_bengaluru',
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    locality: 'All Localities',
    slug: 'bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: 'loc_in_dl_delhi',
    country: 'India',
    state: 'Delhi NCR',
    city: 'New Delhi',
    locality: 'All Localities',
    slug: 'new-delhi',
    latitude: 28.6139,
    longitude: 77.209,
  },
];

async function seed() {
  console.log('Seeding categories into Supabase...');
  const { error: catErr } = await supabase.from('categories').upsert(categories);
  if (catErr) console.error('Error inserting categories:', catErr);
  else console.log('Successfully inserted categories!');

  console.log('Seeding locations into Supabase...');
  const { error: locErr } = await supabase.from('locations').upsert(locations);
  if (locErr) console.error('Error inserting locations:', locErr);
  else console.log('Successfully inserted locations!');
}

seed();
