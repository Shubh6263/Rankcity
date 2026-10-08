const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nthxlkclfnfnzblpinge.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50aHhsa2NsZm5mbnpibHBpbmdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTM4MDgxOCwiZXhwIjoyMTA2OTU2ODE4fQ.2NedOAOJKQtnY56kGgJIsxG9wG-mzPnjH6BLMVbxf68';

const supabase = createClient(supabaseUrl, serviceKey);

const expandedCategories = [
  // 1. Hospitality
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
  // 2. Food & Dining
  {
    id: 'cat_dining',
    name: 'Food & Dining (Restaurants, Cafes)',
    slug: 'restaurants',
    description: 'Fine dining, multi-cuisine restaurants, rooftop cafes, street food, bakeries, cloud kitchens.',
    icon_name: 'UtensilsCrossed',
    min_bid_paise: 2500,
    bid_increment_paise: 500,
    commission_percent: 15,
    is_active: true,
  },
  // 3. Healthcare & Medical
  {
    id: 'cat_healthcare',
    name: 'Healthcare & Medical',
    slug: 'healthcare',
    description: 'Multi-specialty hospitals, doctors, dental clinics, physiotherapy, pathology labs, 24x7 pharmacies.',
    icon_name: 'Stethoscope',
    min_bid_paise: 50000,
    bid_increment_paise: 5000,
    commission_percent: 15,
    is_active: true,
  },
  // 4. Salons, Beauty & Spa
  {
    id: 'cat_beauty_wellness',
    name: 'Beauty, Salons & Spa',
    slug: 'beauty-salons-spa',
    description: 'Unisex hair salons, luxury spas, nail art, bridal makeup artists, skin & laser dermatology.',
    icon_name: 'Scissors',
    min_bid_paise: 2500,
    bid_increment_paise: 250,
    commission_percent: 15,
    is_active: true,
  },
  // 5. Gyms & Fitness
  {
    id: 'cat_gyms_fitness',
    name: 'Gyms & Fitness Centers',
    slug: 'gyms-fitness',
    description: 'Crossfit boxes, bodybuilding gyms, yoga studios, personal training, martial arts & swimming pools.',
    icon_name: 'Dumbbell',
    min_bid_paise: 2500,
    bid_increment_paise: 250,
    commission_percent: 15,
    is_active: true,
  },
  // 6. Shopping & Retail
  {
    id: 'cat_shopping',
    name: 'Shopping & Retail',
    slug: 'shopping',
    description: 'Designer clothing boutiques, footwear, jewelry showrooms, supermarkets & organic stores.',
    icon_name: 'ShoppingBag',
    min_bid_paise: 3000,
    bid_increment_paise: 300,
    commission_percent: 15,
    is_active: true,
  },
  // 7. Electronics & Mobile
  {
    id: 'cat_electronics',
    name: 'Electronics & Mobile Stores',
    slug: 'electronics',
    description: 'Smartphones, laptops, home appliances, CCTV systems, authorized service & repairs.',
    icon_name: 'Tv',
    min_bid_paise: 3500,
    bid_increment_paise: 350,
    commission_percent: 15,
    is_active: true,
  },
  // 8. Automobile & Car Services
  {
    id: 'cat_automobile',
    name: 'Automotive, Repairs & Dealerships',
    slug: 'automotive-repairs',
    description: 'Authorized car service centers, multi-brand garages, detailing studios, car wash, bike repair.',
    icon_name: 'Car',
    min_bid_paise: 2500,
    bid_increment_paise: 250,
    commission_percent: 15,
    is_active: true,
  },
  // 9. Real Estate & Property
  {
    id: 'cat_realestate',
    name: 'Real Estate & Builders',
    slug: 'real-estate',
    description: 'Property consultants, top builders, apartment rental agents, commercial leasing, interior architects.',
    icon_name: 'Home',
    min_bid_paise: 10000,
    bid_increment_paise: 1000,
    commission_percent: 15,
    is_active: true,
  },
  // 10. Education, Schools & Coaching
  {
    id: 'cat_education',
    name: 'Education, Schools & Coaching',
    slug: 'education',
    description: 'IIT/NEET coaching, competitive exam centers, international schools, colleges, dance & music classes.',
    icon_name: 'GraduationCap',
    min_bid_paise: 4000,
    bid_increment_paise: 400,
    commission_percent: 15,
    is_active: true,
  },
  // 11. Home Services & Contractors
  {
    id: 'cat_home_services',
    name: 'Home Services, Plumbers & Electricians',
    slug: 'home-services',
    description: 'Electricians, plumbers, carpenters, deep cleaning, pest control, AC service & repair, painters.',
    icon_name: 'Wrench',
    min_bid_paise: 1500,
    bid_increment_paise: 150,
    commission_percent: 15,
    is_active: true,
  },
  // 12. Events, Weddings & Banquets
  {
    id: 'cat_events_weddings',
    name: 'Events, Weddings & Banquets',
    slug: 'events-weddings-banquets',
    description: 'Marriage gardens, banquet halls, wedding photographers, event planners, caterers, DJ & sound.',
    icon_name: 'Sparkles',
    min_bid_paise: 5000,
    bid_increment_paise: 500,
    commission_percent: 15,
    is_active: true,
  },
  // 13. Legal, CA & Financial Services
  {
    id: 'cat_financial_legal',
    name: 'Legal, CA, Taxes & Finance',
    slug: 'legal-finance-ca',
    description: 'Chartered Accountants (CA), GST consultants, legal advocates, property lawyers, business loans.',
    icon_name: 'Scale',
    min_bid_paise: 4000,
    bid_increment_paise: 400,
    commission_percent: 15,
    is_active: true,
  },
  // 14. Travel, Tours & Rentals
  {
    id: 'cat_tours_travel',
    name: 'Tours, Travel & Taxi Hire',
    slug: 'travel-taxi-tours',
    description: 'Outstation cab services, travel agencies, holiday packages, self-drive car rentals, bus bookings.',
    icon_name: 'Plane',
    min_bid_paise: 3000,
    bid_increment_paise: 300,
    commission_percent: 15,
    is_active: true,
  },
  // 15. IT, Software & Digital Marketing
  {
    id: 'cat_digital_it',
    name: 'IT, Software & Digital Marketing',
    slug: 'it-software-marketing',
    description: 'Web development, mobile app development, SEO agencies, social media marketing, graphic design.',
    icon_name: 'Laptop',
    min_bid_paise: 4000,
    bid_increment_paise: 400,
    commission_percent: 15,
    is_active: true,
  },
  // 16. Pet Care & Veterinary
  {
    id: 'cat_pet_care',
    name: 'Pet Care & Veterinary Clinics',
    slug: 'pet-care-veterinary',
    description: 'Pet clinics, veterinary doctors, dog grooming spas, pet food stores, pet boarding & day care.',
    icon_name: 'Heart',
    min_bid_paise: 2000,
    bid_increment_paise: 200,
    commission_percent: 15,
    is_active: true,
  },
  // 17. Printing & Signage
  {
    id: 'cat_printing_advertising',
    name: 'Printing, Packaging & Signage',
    slug: 'printing-signage',
    description: 'Flex banner printing, digital printers, wedding card design, corporate gifting, LED sign boards.',
    icon_name: 'Printer',
    min_bid_paise: 2000,
    bid_increment_paise: 200,
    commission_percent: 15,
    is_active: true,
  },
  // 18. Logistics, Packers & Movers
  {
    id: 'cat_packers_movers',
    name: 'Packers & Movers, Logistics',
    slug: 'packers-movers-logistics',
    description: 'Household shifting, office relocation, domestic courier services, warehousing & cargo transport.',
    icon_name: 'Truck',
    min_bid_paise: 3500,
    bid_increment_paise: 350,
    commission_percent: 15,
    is_active: true,
  },
  // 19. Jewellery & Gemstones
  {
    id: 'cat_jewellery',
    name: 'Jewellery & Gold Showrooms',
    slug: 'jewellery-showrooms',
    description: 'Hallmarked gold jewelry, diamond ornaments, silver utensils, certified gemstones, astrology stones.',
    icon_name: 'Gem',
    min_bid_paise: 5000,
    bid_increment_paise: 500,
    commission_percent: 15,
    is_active: true,
  },
  // 20. General / Other Local Services
  {
    id: 'cat_services',
    name: 'Other Local Services & Freelancers',
    slug: 'services',
    description: 'General contractors, repairmen, utility services, and specialized professional local vendors.',
    icon_name: 'Briefcase',
    min_bid_paise: 2000,
    bid_increment_paise: 200,
    commission_percent: 15,
    is_active: true,
  },
];

async function updateCategories() {
  console.log(`Inserting ${expandedCategories.length} comprehensive categories into Supabase...`);
  const { error } = await supabase.from('categories').upsert(expandedCategories);
  if (error) {
    console.error('Category upsert error:', error);
  } else {
    console.log(`Successfully updated ${expandedCategories.length} categories on Supabase!`);
  }
}

updateCategories();
