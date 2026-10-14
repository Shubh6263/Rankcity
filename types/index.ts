export type UserRole =
  | 'CUSTOMER'
  | 'BUSINESS_OWNER'
  | 'BUSINESS_MANAGER'
  | 'MODERATOR'
  | 'FINANCE_ADMIN'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'USER'
  | 'PUBLISHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  minBidPaise: number; // e.g. 1000 = ₹10.00
  bidIncrementPaise: number; // e.g. 100 = ₹1.00
  commissionPercent: number; // e.g. 15%
  isActive: boolean;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  minBidPaise?: number;
}

export interface LocationHierarchy {
  id: string;
  name?: string;
  country: string;
  state: string;
  stateId?: string;
  district?: string;
  districtId?: string;
  city: string;
  locality?: string;
  slug: string;
  latitude?: number;
  longitude?: number;
}

export type LocationLevelType = 'country' | 'state' | 'district' | 'city' | 'town' | 'village' | 'locality' | 'pincode';

export interface StateRecord {
  id: string;
  name: string;
  nameHi?: string;
  code: string; // ISO 3166-2:IN code e.g. MP, MH, DL
  lgdCode?: number;
  type: 'STATE' | 'UT';
  capital?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DistrictRecord {
  id: string;
  stateId: string;
  stateLgdCode?: number;
  name: string;
  nameHi?: string;
  lgdCode?: number;
  headquarter?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CityRecord {
  id: string;
  districtId: string;
  name: string;
  nameHi?: string;
  cityType: string; // 'Municipal Corporation' | 'Municipality' | 'Town' | 'Cantonment Board' | etc.
  lgdCode?: number;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VillageRecord {
  id: string;
  districtId: string;
  subdistrictId?: string;
  name: string;
  nameHi?: string;
  lgdCode?: number;
  pincode?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocalityRecord {
  id: string;
  cityId: string;
  name: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PincodeRecord {
  id: string;
  pincode: string;
  postOfficeName: string;
  districtId?: string;
  stateId?: string;
  circle?: string;
  region?: string;
  division?: string;
  officeType?: string;
  deliveryStatus?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationImportLog {
  id: string;
  source: string;
  fileName?: string;
  importDate: string;
  recordsAdded: number;
  recordsUpdated: number;
  recordsRejected: number;
  status: 'completed' | 'failed' | 'dry_run';
  isDryRun: boolean;
  errorDetails?: Array<{ row?: number; field?: string; message: string; data?: any }>;
  triggeredBy?: string;
  createdAt?: string;
}

export interface LocationSuggestion {
  id: string;
  locationType: LocationLevelType;
  name: string;
  stateName: string;
  districtName?: string;
  cityName?: string;
  pincode?: string;
  submittedByUserId?: string;
  contactEmail?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  locationId: string;
  stateId?: string;
  districtId?: string;
  cityId?: string;
  localityId?: string;
  pincodeId?: string;
  address: string;

  locality?: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  whatsapp?: string;
  email: string;
  website?: string; // Optional field
  directionsUrl?: string; // Custom Google Maps directions link
  mapLink?: string;
  logo?: string;
  coverImage?: string;
  photos?: string[];
  cardPhotos?: string[];
  profilePhotos?: string[];
  openingHours?: string;
  priceRange?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  services?: string[];
  amenities?: string[];
  rating: number; // 1.0 to 5.0
  reviewCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  businessType?: string; // Retail Store, Restaurant / Cafe, Hotel, Hospital, Clinic, Pharmacy, Service Provider, etc.
  fullDescription?: string;
  yearEstablished?: number;
  landmark?: string;
  buildingInfo?: string;
  serviceAreas?: string[];
  alternatePhone?: string;
  whatsappEnabled?: boolean;
  weeklyHours?: Record<string, { open: string; close: string; isClosed?: boolean; isOpen24Hours?: boolean }>;
  startingPrice?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  googleBusinessUrl?: string;
  businessAttributes?: string[]; // Dynamic category attributes: Outdoor seating, AC, Veg/Non-veg, etc.
  ownerName?: string;
  ownerDesignation?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  verificationDocType?: string;
  verificationDocNumber?: string;
  verificationDocUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  claimStatus?: 'unclaimed' | 'claimed' | 'verified';
  claimedBy?: string;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  isSuspended?: boolean;
  totalViews: number;
  totalCalls: number;
  totalWhatsapp: number;
  totalDirections: number;
  totalWebsiteClicks: number;
  totalClicks?: number;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string;
  // Aliases for compatibility
  title?: string;
  url?: string;
}

// Alias for backwards compatibility where needed
export type Website = Business;

export type CampaignStatus =
  | 'DRAFT'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PAYMENT_CONFIRMED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'OUTBID'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'active'
  | 'paused'
  | 'expired'
  | 'completed'
  | 'suspended';

export type PaymentVerificationStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_REJECTED'
  | 'EXPIRED'
  | 'REFUNDED';

export interface PaymentRequest {
  id: string; // payment_id
  businessId: string;
  businessName?: string;
  campaignId: string;
  userId: string;
  amountPaise: number; // Campaign Amount
  platformFeePaise: number; // Platform fee
  gstPaise: number; // GST
  totalAmountPaise: number; // Total amount in paise
  utr?: string;
  paymentMethod: string; // 'UPI'
  upiId?: string;
  paymentReference?: string;
  screenshotUrl?: string;
  status: PaymentVerificationStatus;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Campaign {
  id: string;
  businessId: string;
  websiteId?: string; // backward compat alias
  publisherId: string; // business owner id
  ownerId?: string;
  categoryId: string;
  subcategoryId?: string;
  locationId: string;
  cityId?: string;
  areaId?: string;
  targetPosition?: number;
  maxBidPaise: number; // Maximum willingness to pay per month
  effectiveBidPaise: number; // Current second-price charged
  currentRank: number; // 1, 2, 3...
  durationDays: number; // 1, 7, 30, 90
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  suspensionReason?: string;
  autoBidEnabled: boolean;
  maxBudgetPaise: number;
  spentPaise: number;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BidRecord {
  id: string;
  campaignId: string;
  publisherId: string;
  publisherName: string;
  businessName: string;
  websiteTitle?: string; // alias
  maxBidPaise: number;
  effectivePricePaise: number;
  rankAwarded: number;
  isAutoBid: boolean;
  timestamp: string;
  categorySlug: string;
  locationSlug: string;
}

export interface Wallet {
  userId: string;
  balancePaise: number; // Total available balance in paise
  reservedPaise: number; // Reserved for active campaign bids
  updatedAt: string;
}

export type TransactionType = 'deposit' | 'campaign_hold' | 'campaign_charge' | 'commission' | 'refund' | 'withdrawal';
export type PaymentStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'refunded';

export interface WalletTransaction {
  id: string;
  userId: string;
  amountPaise: number;
  type: TransactionType;
  status: PaymentStatus;
  description: string;
  paymentMethod?: 'UPI' | 'NET_BANKING' | 'CARD' | 'WALLET_INTERNAL';
  gatewayRef?: string;
  upiId?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'outbid'
    | 'campaign_active'
    | 'wallet_credit'
    | 'website_approved'
    | 'website_rejected'
    | 'business_approved'
    | 'business_rejected'
    | 'auto_bid_alert'
    | 'verification_submitted'
    | 'verification_approved'
    | 'verification_rejected'
    | 'campaign_suspended'
    | 'new_review'
    | 'new_enquiry'
    | 'BUSINESS_VERIFIED'
    | 'BUSINESS_REJECTED'
    | 'PAYMENT_SUBMITTED'
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_REJECTED'
    | 'CAMPAIGN_ACTIVE'
    | 'CAMPAIGN_OUTBID'
    | 'CAMPAIGN_EXPIRING'
    | 'CAMPAIGN_EXPIRED'
    | 'NEW_REVIEW'
    | 'REVIEW_REPLY'
    | 'NEW_LEAD';
  read: boolean;
  actionUrl?: string;
  quickBidAmountPaise?: number;
  campaignId?: string;
  timestamp: string;
}

export interface FraudAlert {
  id: string;
  publisherId: string;
  businessId?: string;
  websiteId?: string;
  riskScore: number; // 0 to 100
  reason: string;
  ipAddress: string;
  detectedAt: string;
  status: 'flagged' | 'under_review' | 'resolved' | 'banned';
}

export interface PositionHistoryPoint {
  date: string;
  rank: number;
  effectiveBidRupees: number;
}

export interface BusinessVerification {
  id: string;
  businessId: string;
  businessName: string;
  submittedBy: string;
  submitterName: string;
  documentType: 'gst_certificate' | 'trade_license' | 'utility_bill' | 'pan_card' | 'incorporation_cert';
  documentNumber: string;
  documentUrl?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
}

export interface Review {
  id: string;
  businessId: string;
  businessName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  photos?: string[];
  reply?: {
    text: string;
    repliedAt: string;
    authorName: string;
  };
  status: 'approved' | 'pending' | 'flagged' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface EnquiryLead {
  id: string;
  businessId: string;
  businessName: string;
  campaignId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  serviceRequested?: string;
  preferredTime?: string;
  type: 'call' | 'whatsapp' | 'directions' | 'website' | 'enquiry';
  status: 'new' | 'contacted' | 'converted' | 'closed';
  notes?: string;
  createdAt: string;
}

export interface BusinessTeamMember {
  id: string;
  businessId: string;
  businessName?: string;
  userId?: string;
  name: string;
  email: string;
  role: 'BUSINESS_OWNER' | 'BUSINESS_MANAGER';
  permissions: ('manage_profile' | 'manage_campaigns' | 'manage_leads' | 'view_analytics' | 'manage_billing')[];
  status: 'active' | 'invited';
  addedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  businessId?: string;
  businessName?: string;
  campaignId?: string;
  amountPaise: number;
  taxPaise: number; // 18% GST
  totalPaise: number;
  status: 'paid' | 'pending' | 'refunded';
  description: string;
  paymentMethod?: string;
  gatewayRef?: string;
  date: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'business' | 'campaign' | 'verification' | 'review' | 'user' | 'payment' | 'system';
  targetId: string;
  details: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

export interface Favorite {
  id: string;
  userId: string;
  businessId: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface AdminPlatformStats {
  totalUsers: number;
  totalPublishers: number; // total business owners
  totalBusinesses: number;
  totalWebsites?: number;
  activeCampaigns: number;
  totalBidsCount: number;
  gmvPaise: number;
  commissionRevenuePaise: number;
  pendingApprovalsCount: number;
  pendingVerificationsCount: number;
  fraudAlertsCount: number;
  todayRevenuePaise: number;
  totalCalls: number;
  totalWhatsapp: number;
  totalDirections: number;
  totalEnquiries: number;
  totalReviews: number;
}
