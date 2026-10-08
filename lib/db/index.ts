import {
  initialUsers,
  initialCategories,
  initialLocations,
  initialBusinesses,
  initialCampaigns,
  initialBids,
  initialWallets,
  initialTransactions,
  initialNotifications,
  initialPositionHistory,
  initialFraudAlerts,
  initialVerifications,
  initialReviews,
  initialEnquiries,
  initialTeamMembers,
  initialInvoices,
  initialAuditLogs,
  initialFavorites,
  initialPayments,
} from './initialData';
import {
  User,
  Category,
  LocationHierarchy,
  Business,
  Campaign,
  BidRecord,
  Wallet,
  WalletTransaction,
  NotificationItem,
  FraudAlert,
  PositionHistoryPoint,
  AdminPlatformStats,
  BusinessVerification,
  Review,
  EnquiryLead,
  BusinessTeamMember,
  Invoice,
  AuditLog,
  Favorite,
  UserRole,
  PaymentRequest,
} from '@/types';
import { supabaseAdmin } from '@/lib/supabase/client';

class DatabaseStore {
  users: User[] = [...initialUsers];
  categories: Category[] = [...initialCategories];
  locations: LocationHierarchy[] = [...initialLocations];
  businesses: Business[] = [...initialBusinesses];
  campaigns: Campaign[] = [...initialCampaigns];

  constructor() {
    this.syncWithSupabase();
  }

  async syncWithSupabase() {
    try {
      // Fetch live businesses, campaigns, categories, and locations concurrently in parallel
      const [bizResult, campResult, catResult, locResult] = await Promise.allSettled([
        supabaseAdmin.from('businesses').select('*'),
        supabaseAdmin.from('campaigns').select('*'),
        supabaseAdmin.from('categories').select('*'),
        supabaseAdmin.from('locations').select('*'),
      ]);

      if (bizResult.status === 'fulfilled' && !bizResult.value.error && bizResult.value.data && bizResult.value.data.length > 0) {
        this.businesses = bizResult.value.data.map((b: any) => ({
          id: b.id,
          ownerId: b.owner_id,
          name: b.name,
          slug: b.slug,
          description: b.description || '',
          categoryId: b.category_id,
          locationId: b.location_id,
          address: b.address,
          locality: b.locality,
          city: b.city,
          state: b.state,
          country: b.country,
          pincode: b.pincode,
          latitude: b.latitude,
          longitude: b.longitude,
          phone: b.phone,
          whatsapp: b.whatsapp,
          email: b.email,
          website: b.website,
          openingHours: b.opening_hours,
          priceRange: b.price_range,
          services: Array.isArray(b.services) ? b.services : [],
          amenities: Array.isArray(b.amenities) ? b.amenities : [],
          coverImage: b.cover_image,
          photos: Array.isArray(b.photos) ? b.photos : [],
          rating: Number(b.rating) || 5.0,
          reviewCount: Number(b.review_count) || 0,
          isVerified: b.is_verified ?? true,
          isFeatured: b.is_featured ?? false,
          status: b.status || 'approved',
          totalViews: b.total_views || 0,
          totalCalls: b.total_calls || 0,
          totalWhatsapp: b.total_whatsapp || 0,
          totalDirections: b.total_directions || 0,
          totalWebsiteClicks: b.total_website_clicks || 0,
          createdAt: b.created_at,
          title: b.name,
          url: b.website || '',
        }));
      }

      if (campResult.status === 'fulfilled' && !campResult.value.error && campResult.value.data && campResult.value.data.length > 0) {
        this.campaigns = campResult.value.data.map((c: any) => ({
          id: c.id,
          businessId: c.business_id,
          websiteId: c.business_id,
          publisherId: c.publisher_id,
          categoryId: c.category_id,
          locationId: c.location_id,
          targetRank: c.target_rank || 1,
          currentRank: c.current_rank || 1,
          maxBidPaise: Number(c.max_bid_paise) || 1000,
          effectiveBidPaise: Number(c.effective_bid_paise) || 1000,
          spentPaise: Number(c.spent_paise) || 0,
          durationDays: 30,
          startDate: c.start_date,
          endDate: c.end_date,
          status: c.status || 'active',
          autoBidEnabled: c.auto_bid_enabled || false,
          maxBudgetPaise: Number(c.max_budget_paise) || 50000,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
      }

      if (catResult.status === 'fulfilled' && !catResult.value.error && catResult.value.data && catResult.value.data.length > 0) {
        this.categories = catResult.value.data.map((cat: any) => {
          const original = initialCategories.find((c) => c.id === cat.id);
          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            iconName: cat.icon_name || 'Building2',
            minBidPaise: Number(cat.min_bid_paise) || 1000,
            bidIncrementPaise: Number(cat.bid_increment_paise) || 100,
            commissionPercent: cat.commission_percent || 15,
            isActive: cat.is_active ?? true,
            subcategories: original?.subcategories || [],
          };
        });
      }

      if (locResult.status === 'fulfilled' && !locResult.value.error && locResult.value.data && locResult.value.data.length > 0) {
        this.locations = locResult.value.data.map((l: any) => ({
          id: l.id,
          country: l.country,
          state: l.state,
          city: l.city,
          locality: l.locality,
          slug: l.slug,
          latitude: l.latitude,
          longitude: l.longitude,
        }));
      }
    } catch (e) {
      console.error('Supabase parallel sync notice:', e);
    }
  }
  bids: BidRecord[] = [...initialBids];
  wallets: Record<string, Wallet> = { ...initialWallets };
  transactions: WalletTransaction[] = [...initialTransactions];
  notifications: NotificationItem[] = [...initialNotifications];
  positionHistory: Record<string, PositionHistoryPoint[]> = { ...initialPositionHistory };
  fraudAlerts: FraudAlert[] = [...initialFraudAlerts];
  verifications: BusinessVerification[] = [...initialVerifications];
  reviews: Review[] = [...initialReviews];
  enquiries: EnquiryLead[] = [...initialEnquiries];
  teamMembers: BusinessTeamMember[] = [...initialTeamMembers];
  invoices: Invoice[] = [...initialInvoices];
  auditLogs: AuditLog[] = [...initialAuditLogs];
  favorites: Favorite[] = [...initialFavorites];
  payments: PaymentRequest[] = [...initialPayments];

  // Global settings
  settings = {
    platformCommissionPercent: 15,
    gstPercent: 18,
    defaultMinBidPaise: 1000, // ₹10 (1000 paise)
    defaultIncrementPaise: 100, // ₹1 (100 paise)
    currency: 'INR',
    maintenanceMode: false,
    instantOutbidAlerts: true,
  };

  // Backwards compatibility getter for websites
  get websites(): Business[] {
    return this.businesses;
  }

  // --- Users ---
  getUsers(): User[] {
    return this.users;
  }

  getUser(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  upsertUser(data: { id: string; name: string; email: string; role?: UserRole; phone?: string; avatarUrl?: string }): User {
    let user = this.users.find((u) => u.id === data.id);
    if (user) {
      if (data.name && user.name !== data.name) user.name = data.name;
      if (data.email && user.email !== data.email) user.email = data.email;
      if (data.avatarUrl) user.avatarUrl = data.avatarUrl;
      return user;
    }
    user = {
      id: data.id,
      name: data.name || 'Member',
      email: data.email || '',
      role: data.role || 'CUSTOMER',
      phone: data.phone || '',
      avatarUrl: data.avatarUrl,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);

    // Asynchronously persist profile to Supabase
    supabaseAdmin.from('profiles').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatarUrl,
    }).then(({ error }) => {
      if (error) console.error('Supabase profile upsert error:', error);
    });

    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates);

    // Asynchronously persist profile updates to Supabase
    supabaseAdmin.from('profiles').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      avatar_url: user.avatarUrl || null,
    }).then(({ error }) => {
      if (error) console.error('Supabase profile update error:', error);
    });

    return user;
  }

  // --- Categories & Locations ---
  getCategories(): Category[] {
    return this.categories;
  }

  getCategoryBySlug(slug: string): Category | undefined {
    const normalized = slug.toLowerCase();
    const aliasMap: Record<string, string> = {
      dining: 'restaurants',
      food: 'restaurants',
      hospitality: 'hotels',
      hotel: 'hotels',
      medical: 'healthcare',
      health: 'healthcare',
      fitness: 'services',
      service: 'services',
      retail: 'shopping',
      shop: 'shopping',
      coaching: 'education',
    };
    const targetSlug = aliasMap[normalized] || normalized;
    return this.categories.find((c) => c.slug === targetSlug || c.id === targetSlug || c.slug === normalized);
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find((c) => c.id === id);
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const cat = this.categories.find((c) => c.id === id);
    if (!cat) return null;
    Object.assign(cat, updates);
    return cat;
  }

  getLocations(): LocationHierarchy[] {
    return this.locations;
  }

  getLocationBySlug(slug: string): LocationHierarchy | undefined {
    return this.locations.find((l) => l.slug === slug);
  }

  getLocationById(id: string): LocationHierarchy | undefined {
    return this.locations.find((l) => l.id === id);
  }

  // --- Businesses ---
  getBusinesses(ownerId?: string): Business[] {
    if (ownerId) {
      return this.businesses.filter((b) => b.ownerId === ownerId);
    }
    return this.businesses;
  }

  getWebsites(ownerId?: string): Business[] {
    return this.getBusinesses(ownerId);
  }

  getBusinessById(id: string): Business | undefined {
    return this.businesses.find((b) => b.id === id);
  }

  getWebsiteById(id: string): Business | undefined {
    return this.getBusinessById(id);
  }

  getBusinessBySlug(slug: string): Business | undefined {
    const s = slug.toLowerCase();
    return (
      this.businesses.find((b) => b.slug.toLowerCase() === s) ||
      (s === 'the-grand-palace-hotel-suites-indore'
        ? this.businesses.find((b) => b.slug === 'hotel-the-grand-imperial' || b.id === 'biz_hotel_grand_palace')
        : undefined) ||
      (s === 'hotel-the-grand-imperial'
        ? this.businesses.find((b) => b.id === 'biz_hotel_grand_palace')
        : undefined)
    );
  }

  createBusiness(data: {
    ownerId: string;
    name: string;
    description: string;
    fullDescription?: string;
    businessType?: string;
    yearEstablished?: number;
    categoryId: string;
    subcategoryId?: string;
    locationId?: string;
    address: string;
    locality?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    landmark?: string;
    buildingInfo?: string;
    serviceAreas?: string[];
    phone: string;
    alternatePhone?: string;
    whatsapp?: string;
    whatsappEnabled?: boolean;
    email: string;
    website?: string;
    directionsUrl?: string;
    logo?: string;
    coverImage?: string;
    photos?: string[];
    openingHours?: string;
    weeklyHours?: Record<string, { open: string; close: string; isClosed?: boolean; isOpen24Hours?: boolean }>;
    priceRange?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
    startingPrice?: string;
    services?: string[];
    amenities?: string[];
    businessAttributes?: string[];
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      linkedin?: string;
    };
    googleBusinessUrl?: string;
    ownerName?: string;
    ownerDesignation?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    verificationDocType?: string;
    verificationDocNumber?: string;
    verificationDocUrl?: string;
  }): { success: boolean; business?: Business; error?: string } {
    if (!data.name?.trim()) {
      return { success: false, error: 'Business name is required.' };
    }
    if (!data.address?.trim()) {
      return { success: false, error: 'Business address is required.' };
    }
    if (!data.phone?.trim()) {
      return { success: false, error: 'Contact phone number is required.' };
    }

    // Optional website URL validation if provided
    if (data.website?.trim()) {
      try {
        const u = new URL(data.website.startsWith('http') ? data.website : `https://${data.website}`);
        data.website = u.href;
      } catch {
        return { success: false, error: 'Please enter a valid website URL or leave it empty.' };
      }
    }

    const loc = (data.locationId ? this.getLocationById(data.locationId) : undefined) || this.locations[0];
    const slugBase = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const citySlug = (data.city || loc.city).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${slugBase}-${citySlug}-${Math.random().toString(36).substring(2, 5)}`;

    const customDirections = data.directionsUrl?.trim()
      ? (data.directionsUrl.startsWith('http') ? data.directionsUrl : `https://${data.directionsUrl}`)
      : `https://maps.google.com/?q=${encodeURIComponent(data.name + ' ' + data.address + ' ' + (data.city || loc.city))}`;

    const newBusiness: Business = {
      id: `biz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId: data.ownerId,
      name: data.name,
      slug,
      description: data.description,
      fullDescription: data.fullDescription || data.description,
      businessType: data.businessType || 'Retail Store',
      yearEstablished: data.yearEstablished,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      locationId: data.locationId || loc.id,
      address: data.address,
      locality: data.locality || loc.locality || 'City Center',
      city: data.city || loc.city,
      state: data.state || loc.state,
      country: data.country || loc.country || 'India',
      pincode: data.pincode || '452010',
      landmark: data.landmark,
      buildingInfo: data.buildingInfo,
      serviceAreas: data.serviceAreas,
      latitude: loc.latitude || 22.7196,
      longitude: loc.longitude || 75.8577,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      whatsapp: data.whatsapp || data.phone,
      whatsappEnabled: data.whatsappEnabled ?? true,
      email: data.email,
      website: data.website || undefined,
      directionsUrl: customDirections,
      mapLink: customDirections,
      logo: data.logo,
      coverImage: data.coverImage,
      photos: data.photos || [],
      openingHours: data.openingHours || 'Open Mon - Sat: 9:00 AM - 9:00 PM',
      weeklyHours: data.weeklyHours,
      priceRange: data.priceRange || '₹₹',
      startingPrice: data.startingPrice,
      services: data.services || ['Consultation', 'Express Service', 'Appointments'],
      amenities: data.amenities || ['Parking', 'Air Conditioned', 'Card Accepted', 'UPI Accepted'],
      businessAttributes: data.businessAttributes || [],
      socialLinks: data.socialLinks,
      googleBusinessUrl: data.googleBusinessUrl,
      ownerName: data.ownerName,
      ownerDesignation: data.ownerDesignation,
      ownerPhone: data.ownerPhone,
      ownerEmail: data.ownerEmail,
      verificationDocType: data.verificationDocType,
      verificationDocNumber: data.verificationDocNumber,
      verificationDocUrl: data.verificationDocUrl,
      rating: 4.8,
      reviewCount: 1,
      isVerified: true,
      isFeatured: false,
      status: 'approved',
      totalViews: 0,
      totalCalls: 0,
      totalWhatsapp: 0,
      totalDirections: 0,
      totalWebsiteClicks: 0,
      createdAt: new Date().toISOString(),
      title: data.name,
      url: data.website || customDirections,
    };

    this.businesses.unshift(newBusiness);

    // Asynchronously persist to Supabase
    supabaseAdmin.from('businesses').insert({
      id: newBusiness.id,
      owner_id: newBusiness.ownerId,
      name: newBusiness.name,
      slug: newBusiness.slug,
      description: newBusiness.description,
      category_id: newBusiness.categoryId,
      location_id: newBusiness.locationId,
      address: newBusiness.address,
      locality: newBusiness.locality,
      city: newBusiness.city,
      state: newBusiness.state,
      country: newBusiness.country,
      pincode: newBusiness.pincode,
      latitude: newBusiness.latitude,
      longitude: newBusiness.longitude,
      phone: newBusiness.phone,
      whatsapp: newBusiness.whatsapp,
      email: newBusiness.email,
      website: newBusiness.website,
      opening_hours: newBusiness.openingHours,
      price_range: newBusiness.priceRange,
      services: newBusiness.services,
      amenities: newBusiness.amenities,
      rating: newBusiness.rating,
      review_count: newBusiness.reviewCount,
      is_verified: newBusiness.isVerified,
      is_featured: newBusiness.isFeatured,
      status: newBusiness.status,
    }).then(({ error }) => {
      if (error) console.error('Supabase business insert error:', error);
    });

    return { success: true, business: newBusiness };
  }

  // Alias for backward compatibility
  createWebsite(data: any) {
    return this.createBusiness({
      ownerId: data.publisherId || data.ownerId,
      name: data.title || data.name,
      description: data.description,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      locationId: data.locationId,
      address: data.address || 'Commercial Center, Main Road',
      phone: data.contactPhone || '+91 98260 00000',
      email: data.contactEmail || data.email,
      website: data.url || data.website,
    });
  }

  updateBusiness(id: string, updates: Partial<Business>): Business | null {
    const biz = this.businesses.find((b) => b.id === id || b.slug === id);
    if (!biz) return null;

    // Optional website URL cleanup if modified
    if (updates.website !== undefined) {
      if (updates.website && updates.website.trim()) {
        try {
          const u = new URL(updates.website.startsWith('http') ? updates.website : `https://${updates.website}`);
          updates.website = u.href;
        } catch {
          // ignore or keep as is
        }
      } else {
        updates.website = undefined;
      }
    }

    // Directions URL formatting if modified
    if (updates.directionsUrl !== undefined && updates.directionsUrl.trim()) {
      const dUrl = updates.directionsUrl.startsWith('http') ? updates.directionsUrl : `https://${updates.directionsUrl}`;
      updates.directionsUrl = dUrl;
      updates.mapLink = dUrl;
    }

    // Update title/url compatibility fields if name/website changed
    if (updates.name) {
      updates.title = updates.name;
    }
    if (updates.website || updates.directionsUrl) {
      updates.url = updates.website || updates.directionsUrl || biz.url;
    }

    updates.updatedAt = new Date().toISOString();
    Object.assign(biz, updates);

    // Asynchronously persist update to Supabase
    const supabaseUpdates: Record<string, any> = {};
    if (biz.name !== undefined) supabaseUpdates.name = biz.name;
    if (biz.description !== undefined) supabaseUpdates.description = biz.description;
    if (biz.categoryId !== undefined) supabaseUpdates.category_id = biz.categoryId;
    if (biz.locationId !== undefined) supabaseUpdates.location_id = biz.locationId;
    if (biz.address !== undefined) supabaseUpdates.address = biz.address;
    if (biz.locality !== undefined) supabaseUpdates.locality = biz.locality;
    if (biz.city !== undefined) supabaseUpdates.city = biz.city;
    if (biz.state !== undefined) supabaseUpdates.state = biz.state;
    if (biz.country !== undefined) supabaseUpdates.country = biz.country;
    if (biz.pincode !== undefined) supabaseUpdates.pincode = biz.pincode;
    if (biz.phone !== undefined) supabaseUpdates.phone = biz.phone;
    if (biz.whatsapp !== undefined) supabaseUpdates.whatsapp = biz.whatsapp;
    if (biz.email !== undefined) supabaseUpdates.email = biz.email;
    if (biz.website !== undefined) supabaseUpdates.website = biz.website;
    if (biz.openingHours !== undefined) supabaseUpdates.opening_hours = biz.openingHours;
    if (biz.priceRange !== undefined) supabaseUpdates.price_range = biz.priceRange;
    if (biz.services !== undefined) supabaseUpdates.services = biz.services;
    if (biz.amenities !== undefined) supabaseUpdates.amenities = biz.amenities;
    if (biz.photos !== undefined) supabaseUpdates.photos = biz.photos;
    if (biz.coverImage !== undefined) supabaseUpdates.cover_image = biz.coverImage;
    if (biz.logo !== undefined) supabaseUpdates.logo = biz.logo;

    supabaseAdmin.from('businesses').update(supabaseUpdates).eq('id', biz.id).then(({ error }) => {
      if (error) console.error('Supabase business update error:', error);
    });

    return biz;
  }

  updateBusinessStatus(id: string, status: Business['status'], rejectionReason?: string): Business | null {
    const biz = this.businesses.find((b) => b.id === id);
    if (!biz) return null;
    biz.status = status;
    if (rejectionReason) biz.rejectionReason = rejectionReason;
    if (status === 'approved') biz.isVerified = true;
    return biz;
  }

  updateWebsiteStatus(id: string, status: any, reason?: string) {
    return this.updateBusinessStatus(id, status, reason);
  }

  recordLead(businessId: string, leadType: 'call' | 'whatsapp' | 'directions' | 'website' | 'view'): void {
    const biz = this.businesses.find((b) => b.id === businessId || b.slug === businessId);
    if (!biz) return;

    if (leadType === 'call') biz.totalCalls += 1;
    else if (leadType === 'whatsapp') biz.totalWhatsapp += 1;
    else if (leadType === 'directions') biz.totalDirections += 1;
    else if (leadType === 'website') {
      biz.totalWebsiteClicks += 1;
      biz.totalClicks = (biz.totalClicks || 0) + 1;
    }
    else if (leadType === 'view') biz.totalViews += 1;
  }

  recordWebsiteClick(id: string): void {
    this.recordLead(id, 'website');
  }

  recordWebsiteView(id: string): void {
    this.recordLead(id, 'view');
  }

  // --- Vickrey Second-Price Local Auction Engine ---
  recalculateVickreyRankings(categoryId: string, locationId: string, subcategoryId?: string): Campaign[] {
    const category = this.getCategoryById(categoryId) || this.categories[0];
    const minBidPaise = category.minBidPaise || this.settings.defaultMinBidPaise;
    const incrementPaise = category.bidIncrementPaise || this.settings.defaultIncrementPaise;

    const now = Date.now();
    const matched = this.campaigns.filter((c) => {
      const matchCat = c.categoryId === categoryId;
      const matchSub = subcategoryId ? c.subcategoryId === subcategoryId : true;
      const matchLoc = locationId ? c.locationId === locationId : true;
      const isActiveStatus = c.status === 'active' || c.status === 'ACTIVE';
      const isNotExpired = !c.endDate || new Date(c.endDate).getTime() >= now;
      return matchCat && matchSub && matchLoc && isActiveStatus && isNotExpired;
    });

    matched.sort((a, b) => {
      if (b.maxBidPaise !== a.maxBidPaise) {
        return b.maxBidPaise - a.maxBidPaise;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    for (let i = 0; i < matched.length; i++) {
      const current = matched[i];
      current.currentRank = i + 1;

      if (i < matched.length - 1) {
        const nextCompetitor = matched[i + 1];
        const secondPrice = nextCompetitor.maxBidPaise + incrementPaise;
        current.effectiveBidPaise = Math.min(current.maxBidPaise, secondPrice);
      } else {
        current.effectiveBidPaise = minBidPaise;
      }
      current.updatedAt = new Date().toISOString();
    }

    return matched;
  }

  getRankings(categorySlug: string, locationSlug?: string, subcategorySlug?: string) {
    const resolvedCat = this.getCategoryBySlug(categorySlug) || this.getCategoryById(categorySlug);
    const category = resolvedCat || this.categories[0];
    const subcategory = subcategorySlug
      ? category.subcategories.find((s) => s.slug === subcategorySlug)
      : undefined;

    // Resolve location (handles 'indore', city names, location IDs, or legacy slugs)
    const location = locationSlug
      ? this.locations.find(
          (l) =>
            l.slug === locationSlug ||
            l.slug.includes(locationSlug) ||
            locationSlug.includes(l.slug) ||
            l.id === locationSlug ||
            l.city.toLowerCase() === locationSlug.toLowerCase()
        )
      : this.locations[0];

    this.recalculateVickreyRankings(category.id, location?.id || '', subcategory?.id);

    const now = Date.now();
    const activeCampaigns = this.campaigns
      .filter((c) => {
        const catMatch = c.categoryId === category.id;
        const subMatch = subcategory ? c.subcategoryId === subcategory.id : true;
        const locMatch = location ? c.locationId === location.id : true;
        const isActiveStatus = c.status === 'active' || c.status === 'ACTIVE';
        const isNotExpired = !c.endDate || new Date(c.endDate).getTime() >= now;
        return catMatch && subMatch && locMatch && isActiveStatus && isNotExpired;
      })
      .sort((a, b) => a.currentRank - b.currentRank);

    const items = activeCampaigns.map((camp) => {
      const business = this.businesses.find((b) => b.id === (camp.businessId || camp.websiteId));
      const owner = this.users.find((u) => u.id === camp.publisherId);
      const resolvedBiz: Business = business || {
        id: camp.businessId || camp.websiteId || 'biz_default',
        ownerId: camp.publisherId,
        name: 'Verified Local Business',
        slug: 'verified-local-business',
        description: 'Official partner business',
        categoryId: category.id,
        locationId: location?.id || 'loc_default',
        address: 'Main Road, Indore',
        city: location?.city || 'Indore',
        state: location?.state || 'Madhya Pradesh',
        country: 'India',
        phone: '+91 98260 00000',
        email: 'contact@business.in',
        rating: 4.8,
        reviewCount: 50,
        isVerified: true,
        isFeatured: true,
        status: 'approved' as const,
        totalViews: 0,
        totalCalls: 0,
        totalWhatsapp: 0,
        totalDirections: 0,
        totalWebsiteClicks: 0,
        createdAt: new Date().toISOString(),
        title: 'Verified Local Business',
        url: 'https://maps.google.com',
      };

      return {
        campaign: camp,
        business: resolvedBiz,
        website: resolvedBiz, // alias for legacy components
        publisher: {
          id: owner?.id || camp.publisherId,
          name: owner?.name || 'Verified Business Owner',
          companyName: owner?.companyName,
        },
      };
    });

    // Top Rated (Organic Ranking separate from Sponsored Auctions)
    const topRatedBusinesses = this.businesses
      .filter((b) => {
        const catMatch = b.categoryId === category.id;
        const locMatch = location ? b.locationId === location.id : true;
        return catMatch && locMatch && b.status === 'approved';
      })
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
      .slice(0, 6);

    const highestBidPaise = activeCampaigns.length > 0 ? activeCampaigns[0].effectiveBidPaise : 0;
    const minNextBidPaise = activeCampaigns.length > 0
      ? (activeCampaigns[0]?.maxBidPaise || category.minBidPaise) + category.bidIncrementPaise
      : category.minBidPaise;

    return {
      category,
      subcategory,
      location: location || this.locations[0],
      items,
      topRatedBusinesses,
      highestBidPaise,
      minNextBidPaise,
      totalCompetitors: items.length,
    };
  }

  // --- Campaign Creation ---
  createCampaign(data: {
    businessId?: string;
    websiteId?: string;
    publisherId: string;
    categoryId: string;
    subcategoryId?: string;
    locationId: string;
    maxBidPaise: number;
    durationDays: number;
    autoBidEnabled?: boolean;
    maxBudgetPaise?: number;
    paymentMethod?: 'UPI' | 'WALLET_INTERNAL';
  }): { success: boolean; campaign?: Campaign; payment?: PaymentRequest; error?: string } {
    const targetBizId = data.businessId || data.websiteId;
    const business = this.getBusinessById(targetBizId || '');
    if (!business) return { success: false, error: 'Business listing not found.' };

    const category = this.getCategoryById(data.categoryId);
    if (!category) return { success: false, error: 'Category not found.' };

    const minBid = category.minBidPaise || this.settings.defaultMinBidPaise;
    if (data.maxBidPaise < minBid) {
      return { success: false, error: `Minimum bid must be at least ₹${minBid / 100}.` };
    }

    // Calculate required initial price for the campaign based on active competitors in category/location
    const activeCompetitors = this.campaigns.filter((c) => {
      const matchCat = c.categoryId === data.categoryId;
      const matchSub = data.subcategoryId ? c.subcategoryId === data.subcategoryId : true;
      const matchLoc = data.locationId ? c.locationId === data.locationId : true;
      const isActiveStatus = c.status === 'active' || c.status === 'ACTIVE';
      const isNotExpired = !c.endDate || new Date(c.endDate).getTime() >= Date.now();
      return matchCat && matchSub && matchLoc && isActiveStatus && isNotExpired;
    }).sort((a, b) => b.maxBidPaise - a.maxBidPaise);

    let calculatedEffectivePricePaise = minBid; // Default initial campaign amount: 1000 paise (₹10)
    if (activeCompetitors.length > 0) {
      const competitorBelow = activeCompetitors.find((c) => c.maxBidPaise < data.maxBidPaise);
      if (competitorBelow) {
        calculatedEffectivePricePaise = Math.min(
          data.maxBidPaise,
          competitorBelow.maxBidPaise + (category.bidIncrementPaise || this.settings.defaultIncrementPaise)
        );
      } else if (data.maxBidPaise >= activeCompetitors[0].maxBidPaise) {
        calculatedEffectivePricePaise = Math.min(
          data.maxBidPaise,
          activeCompetitors[0].maxBidPaise + (category.bidIncrementPaise || this.settings.defaultIncrementPaise)
        );
      } else {
        calculatedEffectivePricePaise = minBid;
      }
    }

    const useWallet = data.paymentMethod === 'WALLET_INTERNAL';
    const wallet = this.getWallet(data.publisherId);
    const availableBalance = wallet.balancePaise - wallet.reservedPaise;

    if (useWallet) {
      if (availableBalance < calculatedEffectivePricePaise) {
        return {
          success: false,
          error: `Insufficient wallet balance. Please add at least ₹${((calculatedEffectivePricePaise - availableBalance) / 100).toFixed(0)} to activate this campaign.`,
        };
      }
      wallet.reservedPaise += calculatedEffectivePricePaise;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (data.durationDays || 30) * 24 * 60 * 60 * 1000);

    const newCampaign: Campaign = {
      id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: business.id,
      websiteId: business.id,
      publisherId: data.publisherId,
      ownerId: data.publisherId,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      locationId: data.locationId,
      maxBidPaise: data.maxBidPaise,
      effectiveBidPaise: calculatedEffectivePricePaise,
      currentRank: 99,
      durationDays: data.durationDays || 30,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: useWallet ? 'ACTIVE' : 'PAYMENT_PENDING',
      autoBidEnabled: data.autoBidEnabled ?? true,
      maxBudgetPaise: data.maxBudgetPaise ?? data.maxBidPaise * 2,
      spentPaise: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.campaigns.push(newCampaign);

    let createdPayment: PaymentRequest | undefined;

    if (useWallet) {
      this.createTransaction({
        userId: data.publisherId,
        amountPaise: calculatedEffectivePricePaise,
        type: 'campaign_hold',
        status: 'successful',
        description: `Reserve hold for sponsored ranking of ${business.name}`,
        paymentMethod: 'WALLET_INTERNAL',
      });
      this.recalculateVickreyRankings(data.categoryId, data.locationId, data.subcategoryId);
    } else {
      // Manual UPI Payment verification flow (MVP default!)
      const payRes = this.createPaymentRequest({
        businessId: business.id,
        campaignId: newCampaign.id,
        userId: data.publisherId,
        amountPaise: calculatedEffectivePricePaise,
        paymentMethod: 'UPI',
      });
      if (payRes.payment) {
        createdPayment = payRes.payment;
      }
    }

    this.positionHistory[newCampaign.id] = [
      {
        date: 'Day 1',
        rank: newCampaign.currentRank,
        effectiveBidRupees: newCampaign.effectiveBidPaise / 100,
      },
    ];

    return { success: true, campaign: newCampaign, payment: createdPayment };
  }

  // --- Live Bidding Engine ---
  placeBid(data: {
    campaignId: string;
    publisherId: string;
    newMaxBidPaise: number;
    ipAddress?: string;
    autoBidEnabled?: boolean;
    maxBudgetPaise?: number;
  }): { success: boolean; campaign?: Campaign; error?: string; outbidCount?: number } {
    const campaign = this.campaigns.find((c) => c.id === data.campaignId);
    if (!campaign) return { success: false, error: 'Campaign not found.' };

    const category = this.getCategoryById(campaign.categoryId);
    const increment = category?.bidIncrementPaise || this.settings.defaultIncrementPaise;

    if (data.newMaxBidPaise <= campaign.maxBidPaise) {
      return {
        success: false,
        error: `New bid must exceed current max bid of ₹${(campaign.maxBidPaise / 100).toFixed(0)}.`,
      };
    }

    const deltaPaise = data.newMaxBidPaise - campaign.maxBidPaise;
    const wallet = this.getWallet(data.publisherId);
    const available = wallet.balancePaise - wallet.reservedPaise;

    if (available < deltaPaise) {
      return {
        success: false,
        error: `Insufficient wallet balance to cover the ₹${(deltaPaise / 100).toFixed(0)} bid increase. Please recharge your wallet.`,
      };
    }

    wallet.reservedPaise += deltaPaise;

    const previousRanks = new Map<string, number>();
    this.campaigns.forEach((c) => previousRanks.set(c.id, c.currentRank));

    const publisher = this.getUser(data.publisherId);
    const business = this.getBusinessById(campaign.businessId || campaign.websiteId || '');

    campaign.maxBidPaise = data.newMaxBidPaise;
    if (typeof data.autoBidEnabled === 'boolean') {
      campaign.autoBidEnabled = data.autoBidEnabled;
    }
    if (data.maxBudgetPaise && data.maxBudgetPaise > 0) {
      campaign.maxBudgetPaise = data.maxBudgetPaise;
    }
    campaign.updatedAt = new Date().toISOString();

    const bidRecord: BidRecord = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      campaignId: campaign.id,
      publisherId: data.publisherId,
      publisherName: publisher?.name || 'Business Owner',
      businessName: business?.name || 'Local Business',
      websiteTitle: business?.name || 'Local Business',
      maxBidPaise: data.newMaxBidPaise,
      effectivePricePaise: campaign.effectiveBidPaise,
      rankAwarded: campaign.currentRank,
      isAutoBid: false,
      timestamp: new Date().toISOString(),
      categorySlug: category?.slug || 'general',
      locationSlug: campaign.locationId,
    };
    this.bids.unshift(bidRecord);

    this.recalculateVickreyRankings(campaign.categoryId, campaign.locationId, campaign.subcategoryId);

    const rivals = this.campaigns.filter(
      (c) =>
        c.categoryId === campaign.categoryId &&
        c.locationId === campaign.locationId &&
        c.id !== campaign.id &&
        c.autoBidEnabled &&
        (c.status === 'active' || c.status === 'ACTIVE')
    );

    for (const rival of rivals) {
      if (rival.currentRank > 1 && rival.maxBudgetPaise >= campaign.maxBidPaise + increment) {
        const rivalWallet = this.getWallet(rival.publisherId);
        const autoBidTarget = campaign.maxBidPaise + increment;
        const rivalDelta = autoBidTarget - rival.maxBidPaise;

        if (rivalWallet.balancePaise - rivalWallet.reservedPaise >= rivalDelta) {
          rivalWallet.reservedPaise += rivalDelta;
          rival.maxBidPaise = autoBidTarget;
          rival.updatedAt = new Date().toISOString();

          const rivalBiz = this.getBusinessById(rival.businessId || rival.websiteId || '');
          this.bids.unshift({
            id: `bid_auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            campaignId: rival.id,
            publisherId: rival.publisherId,
            publisherName: this.getUser(rival.publisherId)?.name || 'Competitor',
            businessName: rivalBiz?.name || 'Competitor Business',
            websiteTitle: rivalBiz?.name || 'Competitor Business',
            maxBidPaise: autoBidTarget,
            effectivePricePaise: rival.effectiveBidPaise,
            rankAwarded: 1,
            isAutoBid: true,
            timestamp: new Date().toISOString(),
            categorySlug: category?.slug || 'general',
            locationSlug: rival.locationId,
          });

          this.recalculateVickreyRankings(campaign.categoryId, campaign.locationId, campaign.subcategoryId);
        }
      }
    }

    let outbidCount = 0;
    this.campaigns.forEach((c) => {
      const prev = previousRanks.get(c.id);
      if (prev && c.currentRank > prev && (c.status === 'active' || c.status === 'ACTIVE')) {
        outbidCount++;
        c.status = 'OUTBID';
        c.updatedAt = new Date().toISOString();
        const rivalPub = this.getUser(c.publisherId);
        if (rivalPub) {
          const leader = this.campaigns.find(
            (item) => item.categoryId === c.categoryId && item.locationId === c.locationId && item.currentRank === 1
          );
          const nextBidPaise = (leader?.maxBidPaise || 0) + increment;

          const loc = this.getLocationById(campaign.locationId);
          this.notifications.unshift({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: c.publisherId,
            title: `You've been outbid in ${loc?.city || 'Indore'} → ${category?.name || 'Restaurants'}`,
            message: `Your position dropped from #${prev} to #${c.currentRank}. Current #1 bid is ₹${((leader?.effectiveBidPaise || 0) / 100).toFixed(0)}. Increase your bid to challenge for #1!`,
            type: 'CAMPAIGN_OUTBID',
            read: false,
            actionUrl: `/publisher/campaigns`,
            quickBidAmountPaise: nextBidPaise,
            campaignId: c.id,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    return { success: true, campaign, outbidCount };
  }

  // --- Wallet & Payments ---
  getWallet(userId: string): Wallet {
    if (!this.wallets[userId]) {
      this.wallets[userId] = {
        userId,
        balancePaise: 0,
        reservedPaise: 0,
        updatedAt: new Date().toISOString(),
      };
    }
    return this.wallets[userId];
  }

  depositFunds(data: {
    userId: string;
    amountPaise: number;
    paymentMethod: 'UPI' | 'NET_BANKING' | 'CARD';
    upiId?: string;
  }): { success: boolean; transaction: WalletTransaction } {
    const wallet = this.getWallet(data.userId);
    wallet.balancePaise += data.amountPaise;
    wallet.updatedAt = new Date().toISOString();

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: data.userId,
      amountPaise: data.amountPaise,
      type: 'deposit',
      status: 'successful',
      description: `Recharge via ${data.paymentMethod}${data.upiId ? ` (${data.upiId})` : ''}`,
      paymentMethod: data.paymentMethod,
      gatewayRef: `PG_GATEWAY_${Date.now()}`,
      upiId: data.upiId,
      timestamp: new Date().toISOString(),
    };

    this.transactions.unshift(tx);

    this.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: data.userId,
      title: 'Business Wallet Credited',
      message: `₹${(data.amountPaise / 100).toFixed(0)} added to your business wallet via ${data.paymentMethod}.`,
      type: 'wallet_credit',
      read: false,
      actionUrl: '/publisher/wallet',
      timestamp: new Date().toISOString(),
    });

    return { success: true, transaction: tx };
  }

  getTransactions(userId?: string): WalletTransaction[] {
    if (userId) {
      return this.transactions.filter((t) => t.userId === userId);
    }
    return this.transactions;
  }

  createTransaction(txData: Omit<WalletTransaction, 'id' | 'timestamp'>): WalletTransaction {
    const tx: WalletTransaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.transactions.unshift(tx);
    return tx;
  }

  // --- Notifications ---
  getNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  }

  createNotification(data: Omit<NotificationItem, 'id' | 'timestamp' | 'read'> & { read?: boolean }): NotificationItem {
    const notif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: data.read ?? false,
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.notifications.unshift(notif);
    return notif;
  }

  // --- Business Verification & Claiming ---
  getVerifications(status?: string): BusinessVerification[] {
    if (status && status !== 'all') {
      return this.verifications.filter((v) => v.status === status);
    }
    return this.verifications;
  }

  getVerificationById(id: string): BusinessVerification | undefined {
    return this.verifications.find((v) => v.id === id);
  }

  submitVerification(data: {
    businessId: string;
    submittedBy: string;
    submitterName: string;
    documentType: BusinessVerification['documentType'];
    documentNumber: string;
    documentUrl?: string;
    notes?: string;
  }): { success: boolean; verification?: BusinessVerification; error?: string } {
    const biz = this.getBusinessById(data.businessId);
    if (!biz) return { success: false, error: 'Business listing not found.' };

    const newVerif: BusinessVerification = {
      id: `verif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: biz.id,
      businessName: biz.name,
      submittedBy: data.submittedBy,
      submitterName: data.submitterName,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      documentUrl: data.documentUrl || 'https://docs.rankcity.in/verif/upload_doc.pdf',
      notes: data.notes,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    this.verifications.unshift(newVerif);
    biz.verificationStatus = 'pending';

    this.logAudit({
      actorId: data.submittedBy,
      actorName: data.submitterName,
      actorRole: 'BUSINESS_OWNER',
      action: 'BUSINESS_VERIFICATION_SUBMITTED',
      targetType: 'verification',
      targetId: newVerif.id,
      details: { businessId: biz.id, businessName: biz.name, documentType: data.documentType },
    });

    return { success: true, verification: newVerif };
  }

  reviewVerification(
    id: string,
    status: 'approved' | 'rejected',
    notes: string | undefined,
    reviewerId: string
  ): { success: boolean; verification?: BusinessVerification; error?: string } {
    const verif = this.getVerificationById(id);
    if (!verif) return { success: false, error: 'Verification submission not found.' };

    const reviewer = this.getUser(reviewerId);
    verif.status = status;
    verif.reviewedBy = reviewerId;
    verif.reviewedAt = new Date().toISOString();
    if (notes) verif.notes = notes;

    const biz = this.getBusinessById(verif.businessId);
    if (biz) {
      if (status === 'approved') {
        biz.isVerified = true;
        biz.verificationStatus = 'verified';
        biz.status = 'approved';
      } else {
        biz.verificationStatus = 'rejected';
        biz.rejectionReason = notes || 'Verification documentation rejected';
      }
    }

    this.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: verif.submittedBy,
      title: status === 'approved' ? 'Business Verification Approved!' : 'Verification Update Required',
      message:
        status === 'approved'
          ? `Congratulations! ${verif.businessName} has been verified by the moderation team. The verified trust badge is now live.`
          : `Verification for ${verif.businessName} was declined: ${notes || 'Documentation did not match records.'}`,
      type: status === 'approved' ? 'verification_approved' : 'verification_rejected',
      read: false,
      actionUrl: '/publisher/websites',
      timestamp: new Date().toISOString(),
    });

    this.logAudit({
      actorId: reviewerId,
      actorName: reviewer?.name || 'Administrator',
      actorRole: (reviewer?.role as UserRole) || 'ADMIN',
      action: status === 'approved' ? 'BUSINESS_VERIFICATION_APPROVED' : 'BUSINESS_VERIFICATION_REJECTED',
      targetType: 'verification',
      targetId: verif.id,
      details: { businessId: verif.businessId, businessName: verif.businessName, reviewerNotes: notes },
    });

    return { success: true, verification: verif };
  }

  claimBusiness(
    businessId: string,
    userId: string,
    data: { applicantName: string; phone: string; email: string; businessRole: string; registrationNumber?: string; notes?: string }
  ): { success: boolean; business?: Business; error?: string } {
    const biz = this.getBusinessById(businessId);
    if (!biz) return { success: false, error: 'Business listing not found.' };

    biz.ownerId = userId;
    biz.claimStatus = 'claimed';
    biz.claimedBy = userId;
    biz.verificationStatus = 'pending';

    this.submitVerification({
      businessId: biz.id,
      submittedBy: userId,
      submitterName: data.applicantName,
      documentType: 'trade_license',
      documentNumber: data.registrationNumber || 'PENDING_DOCUMENT_UPLOAD',
      notes: `Claim request by ${data.applicantName} (${data.businessRole}, ${data.phone}): ${data.notes || 'Ownership claim submitted.'}`,
    });

    this.logAudit({
      actorId: userId,
      actorName: data.applicantName,
      actorRole: 'BUSINESS_OWNER',
      action: 'BUSINESS_CLAIM_SUBMITTED',
      targetType: 'business',
      targetId: biz.id,
      details: { businessName: biz.name, applicantPhone: data.phone, role: data.businessRole },
    });

    return { success: true, business: biz };
  }

  // --- Reviews & Reputation ---
  getReviews(businessId?: string, status?: string): Review[] {
    return this.reviews.filter((r) => {
      const matchBiz = businessId ? r.businessId === businessId : true;
      const matchStatus = status && status !== 'all' ? r.status === status : true;
      return matchBiz && matchStatus;
    });
  }

  createReview(data: {
    businessId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    photos?: string[];
  }): { success: boolean; review?: Review; error?: string } {
    const biz = this.getBusinessById(data.businessId);
    if (!biz) return { success: false, error: 'Business listing not found.' };

    const newReview: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: biz.id,
      businessName: biz.name,
      userId: data.userId,
      userName: data.userName,
      rating: Math.min(5, Math.max(1, data.rating)),
      comment: data.comment,
      photos: data.photos || [],
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    this.reviews.unshift(newReview);

    const bizReviews = this.reviews.filter((r) => r.businessId === biz.id && r.status === 'approved');
    const sum = bizReviews.reduce((acc, r) => acc + r.rating, 0);
    biz.reviewCount = bizReviews.length;
    biz.rating = Number((sum / bizReviews.length).toFixed(1));

    this.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: biz.ownerId,
      title: 'New Customer Review Received',
      message: `${data.userName} rated ${biz.name} ${data.rating} stars: "${data.comment.slice(0, 80)}..."`,
      type: 'new_review',
      read: false,
      actionUrl: `/publisher/reviews`,
      timestamp: new Date().toISOString(),
    });

    return { success: true, review: newReview };
  }

  replyToReview(
    reviewId: string,
    replyText: string,
    authorName: string
  ): { success: boolean; review?: Review; error?: string } {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (!rev) return { success: false, error: 'Review not found.' };

    rev.reply = {
      text: replyText,
      authorName,
      repliedAt: new Date().toISOString(),
    };
    rev.updatedAt = new Date().toISOString();

    return { success: true, review: rev };
  }

  moderateReview(
    reviewId: string,
    status: 'approved' | 'flagged' | 'rejected',
    moderatorId: string
  ): { success: boolean; review?: Review; error?: string } {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (!rev) return { success: false, error: 'Review not found.' };

    rev.status = status;
    rev.updatedAt = new Date().toISOString();

    const biz = this.getBusinessById(rev.businessId);
    if (biz) {
      const approvedReviews = this.reviews.filter((r) => r.businessId === biz.id && r.status === 'approved');
      if (approvedReviews.length > 0) {
        const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
        biz.reviewCount = approvedReviews.length;
        biz.rating = Number((sum / approvedReviews.length).toFixed(1));
      }
    }

    const mod = this.getUser(moderatorId);
    this.logAudit({
      actorId: moderatorId,
      actorName: mod?.name || 'Moderator',
      actorRole: (mod?.role as UserRole) || 'MODERATOR',
      action: `REVIEW_MODERATED_${status.toUpperCase()}`,
      targetType: 'review',
      targetId: rev.id,
      details: { businessId: rev.businessId, reviewComment: rev.comment.slice(0, 60), newStatus: status },
    });

    return { success: true, review: rev };
  }

  // --- Leads & Enquiries ---
  getLeads(businessId?: string, ownerId?: string): EnquiryLead[] {
    return this.enquiries.filter((l) => {
      if (businessId) return l.businessId === businessId;
      if (ownerId) {
        const userBizIds = this.getBusinesses(ownerId).map((b) => b.id);
        return userBizIds.includes(l.businessId);
      }
      return true;
    });
  }

  createLead(data: {
    businessId: string;
    campaignId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    message: string;
    serviceRequested?: string;
    preferredTime?: string;
    type: EnquiryLead['type'];
  }): { success: boolean; lead?: EnquiryLead; error?: string } {
    const biz = this.getBusinessById(data.businessId);
    if (!biz) return { success: false, error: 'Business not found.' };

    const activeCamp = data.campaignId
      ? this.campaigns.find((c) => c.id === data.campaignId)
      : this.campaigns.find((c) => (c.businessId === biz.id || c.websiteId === biz.id) && c.status === 'active');

    const newLead: EnquiryLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: biz.id,
      businessName: biz.name,
      campaignId: activeCamp?.id,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      message: data.message,
      serviceRequested: data.serviceRequested,
      preferredTime: data.preferredTime,
      type: data.type,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    this.enquiries.unshift(newLead);
    this.recordLead(biz.id, data.type === 'enquiry' ? 'view' : data.type);

    this.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: biz.ownerId,
      title: `New Customer Lead: ${data.customerName}`,
      message: `${data.customerName} sent an inquiry for ${biz.name}: "${data.message.slice(0, 60)}..."`,
      type: 'new_enquiry',
      read: false,
      actionUrl: '/publisher/leads',
      timestamp: new Date().toISOString(),
    });

    return { success: true, lead: newLead };
  }

  updateLeadStatus(id: string, status: EnquiryLead['status'], notes?: string): boolean {
    const lead = this.enquiries.find((l) => l.id === id);
    if (!lead) return false;
    lead.status = status;
    if (notes) lead.notes = notes;
    return true;
  }

  // --- Team Members & RBAC Delegation ---
  getTeamMembers(businessId?: string): BusinessTeamMember[] {
    if (businessId) {
      return this.teamMembers.filter((m) => m.businessId === businessId);
    }
    return this.teamMembers;
  }

  addTeamMember(data: {
    businessId: string;
    name: string;
    email: string;
    role: 'BUSINESS_OWNER' | 'BUSINESS_MANAGER';
    permissions: ('manage_profile' | 'manage_campaigns' | 'manage_leads' | 'view_analytics' | 'manage_billing')[];
  }): { success: boolean; member?: BusinessTeamMember; error?: string } {
    const biz = this.getBusinessById(data.businessId);
    if (!biz) return { success: false, error: 'Business not found.' };

    const existing = this.teamMembers.find(
      (m) => m.businessId === data.businessId && m.email.toLowerCase() === data.email.toLowerCase()
    );
    if (existing) return { success: false, error: 'User is already a team member for this business.' };

    const member: BusinessTeamMember = {
      id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: biz.id,
      businessName: biz.name,
      name: data.name,
      email: data.email,
      role: data.role,
      permissions: data.permissions,
      status: 'active',
      addedAt: new Date().toISOString(),
    };

    this.teamMembers.push(member);
    return { success: true, member };
  }

  removeTeamMember(id: string): boolean {
    const index = this.teamMembers.findIndex((m) => m.id === id);
    if (index === -1) return false;
    this.teamMembers.splice(index, 1);
    return true;
  }

  // --- Invoices & GST Billing ---
  getInvoices(userId?: string): Invoice[] {
    if (userId) {
      return this.invoices.filter((i) => i.userId === userId);
    }
    return this.invoices;
  }

  createInvoice(data: Omit<Invoice, 'id'>): Invoice {
    const inv: Invoice = {
      ...data,
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    this.invoices.unshift(inv);
    return inv;
  }

  // --- Audit Logs ---
  getAuditLogs(limit = 100): AuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  logAudit(data: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      ...data,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  createAuditLog(data: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    return this.logAudit(data);
  }

  // --- Favorites / Saved ---
  getFavorites(userId: string): { favorites: Favorite[]; businesses: Business[] } {
    const userFavs = this.favorites.filter((f) => f.userId === userId);
    const bizList = userFavs
      .map((f) => this.getBusinessById(f.businessId))
      .filter((b): b is Business => Boolean(b));
    return { favorites: userFavs, businesses: bizList };
  }

  toggleFavorite(userId: string, businessId: string): { isFavorite: boolean } {
    const index = this.favorites.findIndex((f) => f.userId === userId && f.businessId === businessId);
    if (index >= 0) {
      this.favorites.splice(index, 1);
      return { isFavorite: false };
    } else {
      this.favorites.unshift({
        id: `fav_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        businessId,
        createdAt: new Date().toISOString(),
      });
      return { isFavorite: true };
    }
  }

  isFavorite(userId: string, businessId: string): boolean {
    return this.favorites.some((f) => f.userId === userId && f.businessId === businessId);
  }

  // --- Campaign Suspension & Resumption ---
  suspendCampaign(campaignId: string, reason: string, adminId: string): { success: boolean; campaign?: Campaign; error?: string } {
    const camp = this.campaigns.find((c) => c.id === campaignId);
    if (!camp) return { success: false, error: 'Campaign not found.' };

    camp.status = 'suspended';
    camp.suspensionReason = reason;
    camp.updatedAt = new Date().toISOString();

    this.recalculateVickreyRankings(camp.categoryId, camp.locationId, camp.subcategoryId);

    const admin = this.getUser(adminId);
    this.logAudit({
      actorId: adminId,
      actorName: admin?.name || 'Administrator',
      actorRole: (admin?.role as UserRole) || 'ADMIN',
      action: 'CAMPAIGN_SUSPENDED',
      targetType: 'campaign',
      targetId: camp.id,
      details: { businessId: camp.businessId, reason },
    });

    this.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: camp.publisherId,
      title: 'Sponsored Campaign Suspended',
      message: `Your campaign has been suspended by administration: ${reason}`,
      type: 'campaign_suspended',
      read: false,
      actionUrl: '/publisher/campaigns',
      timestamp: new Date().toISOString(),
    });

    return { success: true, campaign: camp };
  }

  resumeCampaign(campaignId: string, adminId: string): { success: boolean; campaign?: Campaign; error?: string } {
    const camp = this.campaigns.find((c) => c.id === campaignId);
    if (!camp) return { success: false, error: 'Campaign not found.' };

    camp.status = 'active';
    camp.suspensionReason = undefined;
    camp.updatedAt = new Date().toISOString();

    this.recalculateVickreyRankings(camp.categoryId, camp.locationId, camp.subcategoryId);

    const admin = this.getUser(adminId);
    this.logAudit({
      actorId: adminId,
      actorName: admin?.name || 'Administrator',
      actorRole: (admin?.role as UserRole) || 'ADMIN',
      action: 'CAMPAIGN_RESUMED',
      targetType: 'campaign',
      targetId: camp.id,
      details: { businessId: camp.businessId },
    });

    return { success: true, campaign: camp };
  }

  // --- Admin Stats ---
  getAdminStats(): AdminPlatformStats {
    const activeCampaigns = this.campaigns.filter((c) => c.status === 'active');
    const totalGmvPaise = activeCampaigns.reduce((acc, c) => acc + c.effectiveBidPaise, 0);
    const commissionRevenuePaise = Math.round((totalGmvPaise * this.settings.platformCommissionPercent) / 100);

    const totalCalls = this.businesses.reduce((acc, b) => acc + (b.totalCalls || 0), 0);
    const totalWhatsapp = this.businesses.reduce((acc, b) => acc + (b.totalWhatsapp || 0), 0);
    const totalDirections = this.businesses.reduce((acc, b) => acc + (b.totalDirections || 0), 0);

    return {
      totalUsers: this.users.length,
      totalPublishers: this.users.filter((u) => u.role === 'BUSINESS_OWNER' || u.role === 'PUBLISHER' || u.role === 'BUSINESS_MANAGER').length,
      totalBusinesses: this.businesses.length,
      totalWebsites: this.businesses.length,
      activeCampaigns: activeCampaigns.length,
      totalBidsCount: this.bids.length,
      gmvPaise: totalGmvPaise,
      commissionRevenuePaise,
      pendingApprovalsCount: this.businesses.filter((w) => w.status === 'pending').length,
      pendingVerificationsCount: this.verifications.filter((v) => v.status === 'pending').length,
      fraudAlertsCount: this.fraudAlerts.filter((f) => f.status === 'flagged').length,
      todayRevenuePaise: Math.round(commissionRevenuePaise * 0.14),
      totalCalls,
      totalWhatsapp,
      totalDirections,
      totalEnquiries: this.enquiries.length,
      totalReviews: this.reviews.length,
    };
  }

  getFraudAlerts(): FraudAlert[] {
    return this.fraudAlerts;
  }

  resolveFraudAlert(id: string, action: 'resolved' | 'banned'): boolean {
    const alert = this.fraudAlerts.find((f) => f.id === id);
    if (!alert) return false;
    alert.status = action;
    return true;
  }

  // --- Manual UPI Payments & Verification Engine ---
  getPayments(options?: { businessId?: string; campaignId?: string; userId?: string }): PaymentRequest[] {
    return this.payments.filter((p) => {
      if (options?.businessId && p.businessId !== options.businessId) return false;
      if (options?.campaignId && p.campaignId !== options.campaignId) return false;
      if (options?.userId && p.userId !== options.userId) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getPaymentById(id: string): PaymentRequest | undefined {
    return this.payments.find((p) => p.id === id);
  }

  createPaymentRequest(data: {
    businessId?: string;
    campaignId?: string;
    userId: string;
    amountPaise: number;
    paymentMethod?: string;
  }): { success: boolean; payment?: PaymentRequest; error?: string } {
    const business = data.businessId ? this.getBusinessById(data.businessId) : undefined;
    const campaign = data.campaignId ? this.campaigns.find((c) => c.id === data.campaignId) : undefined;

    const platformFeePaise = 0;
    const gstPaise = 0;
    const totalAmountPaise = data.amountPaise;

    const payment: PaymentRequest = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      businessId: data.businessId || 'wallet_topup',
      businessName: business?.name || 'Wallet Recharge',
      campaignId: data.campaignId || '',
      userId: data.userId,
      amountPaise: data.amountPaise,
      platformFeePaise,
      gstPaise,
      totalAmountPaise,
      paymentMethod: data.paymentMethod || 'UPI',
      upiId: process.env.NEXT_PUBLIC_UPI_ID || 'patreshubham141@okhdfcbank',
      status: 'PAYMENT_PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.payments.push(payment);
    if (campaign) {
      campaign.status = 'PAYMENT_PENDING';
      campaign.paymentId = payment.id;
    }

    return { success: true, payment };
  }

  submitPaymentUtr(data: {
    paymentId: string;
    utr: string;
    screenshotUrl?: string;
  }): { success: boolean; payment?: PaymentRequest; error?: string } {
    const payment = this.getPaymentById(data.paymentId);
    if (!payment) return { success: false, error: 'Payment record not found' };

    if (!data.utr || data.utr.trim().length < 6) {
      return { success: false, error: 'Valid UTR (minimum 6 characters) is required' };
    }

    const cleanUtr = data.utr.trim();
    const existingDuplicate = this.payments.find(
      (p) => p.id !== data.paymentId && p.utr?.toLowerCase() === cleanUtr.toLowerCase() && p.status !== 'PAYMENT_REJECTED'
    );
    if (existingDuplicate) {
      return { success: false, error: 'This UTR has already been submitted for another payment transaction.' };
    }

    payment.utr = cleanUtr;
    if (data.screenshotUrl) payment.screenshotUrl = data.screenshotUrl;
    payment.status = 'PAYMENT_SUBMITTED';
    payment.submittedAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();

    const campaign = this.campaigns.find((c) => c.id === payment.campaignId);
    if (campaign) {
      campaign.status = 'PAYMENT_SUBMITTED';
      campaign.updatedAt = new Date().toISOString();
    }

    this.createNotification({
      userId: payment.userId,
      title: 'Payment Submitted for Verification',
      message: `Your payment of ₹${(payment.totalAmountPaise / 100).toFixed(2)} (UTR: ${cleanUtr}) has been submitted. Our team will verify and activate your sponsored campaign shortly.`,
      type: 'PAYMENT_SUBMITTED',
      campaignId: payment.campaignId,
    });

    this.createAuditLog({
      actorId: payment.userId,
      actorName: 'Business Owner',
      actorRole: 'BUSINESS_OWNER',
      action: 'SUBMIT_PAYMENT_UTR',
      targetType: 'payment',
      targetId: payment.id,
      details: { utr: cleanUtr, campaignId: payment.campaignId, amountPaise: payment.totalAmountPaise },
    });

    return { success: true, payment };
  }

  confirmPayment(data: {
    paymentId: string;
    verifiedBy: string;
  }): { success: boolean; payment?: PaymentRequest; campaign?: Campaign; error?: string } {
    const payment = this.getPaymentById(data.paymentId);
    if (!payment) return { success: false, error: 'Payment record not found' };

    if (payment.status === 'PAYMENT_CONFIRMED') {
      return { success: false, error: 'Payment is already confirmed.' };
    }

    if (payment.status !== 'PAYMENT_SUBMITTED' && payment.status !== 'UNDER_REVIEW') {
      return { success: false, error: `Cannot confirm payment in ${payment.status} state.` };
    }

    const campaign = payment.campaignId ? this.campaigns.find((c) => c.id === payment.campaignId) : undefined;

    const verifier = this.getUser(data.verifiedBy);
    payment.status = 'PAYMENT_CONFIRMED';
    payment.verifiedAt = new Date().toISOString();
    payment.verifiedBy = data.verifiedBy;
    payment.updatedAt = new Date().toISOString();

    if (campaign) {
      // Activate campaign and set active period
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (campaign.durationDays || 30) * 24 * 60 * 60 * 1000);
      campaign.status = 'ACTIVE';
      campaign.startDate = startDate.toISOString();
      campaign.endDate = endDate.toISOString();
      campaign.updatedAt = new Date().toISOString();

      // Recalculate auction ranking
      this.recalculateVickreyRankings(campaign.categoryId, campaign.locationId, campaign.subcategoryId);
    } else {
      // Direct Wallet Top-Up approval
      const wallet = this.getWallet(payment.userId);
      wallet.balancePaise += payment.amountPaise;
      wallet.updatedAt = new Date().toISOString();

      this.createTransaction({
        userId: payment.userId,
        amountPaise: payment.amountPaise,
        type: 'deposit',
        status: 'successful',
        description: `Verified Wallet Topup (UTR: ${payment.utr || 'VERIFIED'})`,
        paymentMethod: 'UPI',
        gatewayRef: payment.utr,
      });
    }

    // Record invoice
    this.invoices.push({
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: payment.userId,
      businessId: payment.businessId,
      businessName: payment.businessName,
      campaignId: payment.campaignId,
      amountPaise: payment.amountPaise + payment.platformFeePaise,
      taxPaise: payment.gstPaise,
      totalPaise: payment.totalAmountPaise,
      status: 'paid',
      description: campaign
        ? `Sponsored Ranking Campaign (${campaign.durationDays || 30} Days) - UTR: ${payment.utr || 'VERIFIED'}`
        : `Business Wallet Deposit Top-Up - UTR: ${payment.utr || 'VERIFIED'}`,
      paymentMethod: 'UPI',
      gatewayRef: payment.utr,
      date: new Date().toISOString(),
    });

    // Notify business owner
    this.createNotification({
      userId: payment.userId,
      title: campaign ? 'Payment Confirmed — Sponsored Campaign Active!' : 'Wallet Deposit Confirmed!',
      message: campaign
        ? `Your payment of ₹${(payment.totalAmountPaise / 100).toFixed(2)} has been confirmed. Your sponsored ranking is now ACTIVE!`
        : `Your wallet deposit of ₹${(payment.amountPaise / 100).toFixed(2)} has been confirmed and credited to your wallet balance.`,
      type: 'PAYMENT_CONFIRMED',
      campaignId: campaign?.id,
    });

    this.createAuditLog({
      actorId: data.verifiedBy,
      actorName: verifier?.name || 'Admin',
      actorRole: verifier?.role || 'ADMIN',
      action: 'CONFIRM_PAYMENT',
      targetType: 'payment',
      targetId: payment.id,
      details: { utr: payment.utr, campaignId: campaign?.id, totalAmountPaise: payment.totalAmountPaise },
    });

    return { success: true, payment, campaign };
  }

  rejectPayment(data: {
    paymentId: string;
    rejectionReason: string;
    verifiedBy: string;
  }): { success: boolean; payment?: PaymentRequest; error?: string } {
    const payment = this.getPaymentById(data.paymentId);
    if (!payment) return { success: false, error: 'Payment record not found' };

    if (!data.rejectionReason || data.rejectionReason.trim().length === 0) {
      return { success: false, error: 'Rejection reason is required.' };
    }

    if (payment.status === 'PAYMENT_CONFIRMED') {
      return { success: false, error: 'Cannot reject an already confirmed payment.' };
    }

    const verifier = this.getUser(data.verifiedBy);
    payment.status = 'PAYMENT_REJECTED';
    payment.rejectionReason = data.rejectionReason.trim();
    payment.verifiedAt = new Date().toISOString();
    payment.verifiedBy = data.verifiedBy;
    payment.updatedAt = new Date().toISOString();

    const campaign = this.campaigns.find((c) => c.id === payment.campaignId);
    if (campaign) {
      campaign.status = 'REJECTED';
      campaign.updatedAt = new Date().toISOString();
    }

    this.createNotification({
      userId: payment.userId,
      title: 'Payment Verification Rejected',
      message: `Your payment submission for ₹${(payment.totalAmountPaise / 100).toFixed(2)} was rejected. Reason: ${data.rejectionReason}`,
      type: 'PAYMENT_REJECTED',
      campaignId: payment.campaignId,
    });

    this.createAuditLog({
      actorId: data.verifiedBy,
      actorName: verifier?.name || 'Admin',
      actorRole: verifier?.role || 'ADMIN',
      action: 'REJECT_PAYMENT',
      targetType: 'payment',
      targetId: payment.id,
      details: { reason: data.rejectionReason, utr: payment.utr },
    });

    return { success: true, payment };
  }

  // --- Sample & Dummy Data Management ---
  getDataCounts() {
    return {
      businesses: this.businesses.length,
      campaigns: this.campaigns.length,
      activeCampaigns: this.campaigns.filter((c) => c.status === 'active' || c.status === 'ACTIVE').length,
      bids: this.bids.length,
      transactions: this.transactions.length,
      notifications: this.notifications.length,
      fraudAlerts: this.fraudAlerts.length,
      verifications: this.verifications.length,
      reviews: this.reviews.length,
      enquiries: this.enquiries.length,
      payments: this.payments.length,
      isClean: this.businesses.length === 0,
    };
  }

  clearSampleData(): { success: boolean; message: string; counts: ReturnType<DatabaseStore['getDataCounts']> } {
    this.businesses = [];
    this.campaigns = [];
    this.bids = [];
    this.notifications = [];
    this.transactions = [];
    this.positionHistory = {};
    this.fraudAlerts = [];
    this.verifications = [];
    this.reviews = [];
    this.enquiries = [];
    this.teamMembers = [];
    this.invoices = [];
    this.favorites = [];
    this.payments = [];
    this.wallets = {};

    for (const u of this.users) {
      this.wallets[u.id] = {
        userId: u.id,
        balancePaise: 0,
        reservedPaise: 0,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      success: true,
      message: 'All dummy sample data has been removed. Platform is clean and ready for real businesses.',
      counts: this.getDataCounts(),
    };
  }

  seedSampleData(): { success: boolean; message: string; counts: ReturnType<DatabaseStore['getDataCounts']> } {
    this.syncWithSupabase();
    return {
      success: true,
      message: 'Synchronized with Supabase database. All records reflect live database entries.',
      counts: this.getDataCounts(),
    };
  }
}

declare global {
  var __rankAuctionDb: DatabaseStore | undefined;
}

export const db: DatabaseStore = globalThis.__rankAuctionDb ?? new DatabaseStore();
globalThis.__rankAuctionDb = db;
