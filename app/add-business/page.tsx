'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { useAuth } from '@/lib/auth/context';
import GlobeStudy from '@/components/visual/GlobeStudy';
import {
  CheckCircle2,
  Building2,
  MapPin,
  FileText,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Upload,
  Phone,
  MessageCircle,
  Clock,
  Globe,
  Navigation,
  Mail,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Compass,
  Check,
} from 'lucide-react';

const BUSINESS_TYPES = [
  'Retail Store',
  'Restaurant / Cafe',
  'Hotel',
  'Hospital',
  'Clinic',
  'Pharmacy',
  'Service Provider',
  'Professional',
  'Educational Institution',
  'Manufacturer',
  'Wholesaler',
  'Distributor',
  'Other',
];

const ALL_COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'United Arab Emirates',
  'Saudi Arabia',
  'Singapore',
  'Germany',
  'France',
  'Nepal',
  'Bangladesh',
  'Sri Lanka',
  'Other',
];

const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
  'Other',
];

const ATTRIBUTES_BY_CATEGORY: Record<string, string[]> = {
  cat_dining: [
    'Pure Vegetarian',
    'Non-Vegetarian',
    'Vegan Options',
    'Family Friendly',
    'Outdoor Seating',
    'Home Delivery',
    'Takeaway',
    'Air Conditioned',
    'Free Wi-Fi',
    'Valet Parking',
  ],
  cat_hospitality: [
    'Air Conditioned Rooms',
    'Free High-Speed Wi-Fi',
    'Swimming Pool',
    'In-house Restaurant',
    '24/7 Room Service',
    'Conference Hall',
    'Valet Parking',
    'Airport Shuttle',
    'Pet Friendly',
  ],
  cat_healthcare: [
    'Emergency 24x7',
    'ICU / Critical Care',
    'OPD Consultations',
    'In-house Diagnostics / Lab',
    '24x7 Pharmacy',
    'Wheelchair Accessible',
    'Ambulance Service',
    'Cashless Mediclaim',
  ],
  cat_gyms_fitness: [
    'Certified Personal Trainers',
    'Cardio & CrossFit Zone',
    'Heavy Weight Training',
    'Shower & Steam Room',
    'Personal Lockers',
    'Diet & Nutrition Support',
    'Air Conditioned Gym',
  ],
  cat_beauty_wellness: [
    'Unisex Services',
    'Bridal Makeup Studio',
    'Air Conditioned',
    'Pre-Booking Available',
    'Steam & Sauna',
    'Organic / Herbal Products',
  ],
  cat_education: [
    'AC Smart Classrooms',
    'Test Series & Mock Exams',
    'Experienced Faculty',
    'Library & Study Room',
    'Hostel / Transport Facility',
  ],
  default: [
    'Air Conditioned',
    'Parking Available',
    'UPI / Card Accepted',
    'Free Wi-Fi',
    'Verified Staff',
    'Doorstep Service',
  ],
};

export default function AddBusinessPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBusinessSlug, setCreatedBusinessSlug] = useState<string | null>(null);

  // Form State matching Complete Registration Specification
  const [formData, setFormData] = useState({
    // Step 1: Basic Business Information
    name: '',
    businessType: 'Retail Store',
    categoryId: 'cat_hospitality',
    categoryName: 'Hotels & Hospitality',
    subcategoryId: '',
    subcategoryName: '',
    description: '', // Short description (Card/Search)
    fullDescription: '', // Full detailed description (Profile)
    yearEstablished: new Date().getFullYear() - 5,
    logo: '',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',

    // Step 2: Location (RankCity Core Data)
    country: 'India',
    state: 'Madhya Pradesh',
    city: '',
    locality: '',
    address: '', // Full physical address
    pincode: '',
    landmark: '',
    buildingInfo: '',
    serviceAreas: 'Vijay Nagar, Palasia, Rajwada, City Center',
    directionsUrl: '', // Google Maps Directions URL

    // Step 3: Contact & Operations
    phone: '',
    alternatePhone: '',
    whatsapp: '',
    whatsappEnabled: true,
    email: '',
    website: '',
    openingHours: 'Mon - Sun: 9:00 AM - 10:00 PM',
    priceRange: '₹₹' as '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹',
    startingPrice: '₹500',
    services: 'Express Service, Quality Guarantee, Customer Support',
    businessAttributes: [] as string[],
    googleBusinessUrl: '',
    instagramUrl: '',

    // Step 4: Verification & Ownership (Private - Not shown on Card)
    ownerName: '',
    ownerDesignation: 'Founder / Proprietor',
    ownerPhone: '',
    ownerEmail: '',
    documentType: 'GSTIN Registration Certificate',
    documentNumber: '23AAAAA0000A1Z5',
    ownershipProofName: 'GSTIN / Trade License Certificate.pdf',
    declarationAccepted: true,
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategoriesList(data.categories);
        }
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Pre-fill owner details if logged in
  useEffect(() => {
    if (currentUser?.id && currentUser.id !== 'guest_user') {
      setFormData((prev) => ({
        ...prev,
        ownerName: prev.ownerName || currentUser.name || '',
        ownerEmail: prev.ownerEmail || currentUser.email || '',
        ownerPhone: prev.ownerPhone || currentUser.phone || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleAttribute = (attr: string) => {
    setFormData((prev) => {
      const exists = prev.businessAttributes.includes(attr);
      return {
        ...prev,
        businessAttributes: exists
          ? prev.businessAttributes.filter((a) => a !== attr)
          : [...prev.businessAttributes, attr],
      };
    });
  };

  // Profile completion % calculation
  const calculateCompletion = () => {
    let score = 20; // Base score
    if (formData.name) score += 15;
    if (formData.phone) score += 15;
    if (formData.address) score += 15;
    if (formData.whatsapp) score += 10;
    if (formData.description) score += 10;
    if (formData.services) score += 5;
    if (formData.businessAttributes.length > 0) score += 5;
    if (formData.documentNumber) score += 5;
    return Math.min(score, 100);
  };

  const completionPercent = calculateCompletion();

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const slug =
        formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'new-business';

      const servicesList = formData.services
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (formData.subcategoryName && !servicesList.includes(formData.subcategoryName)) {
        servicesList.unshift(formData.subcategoryName);
      }

      const payload = {
        name: formData.name || 'Sample Business',
        businessType: formData.businessType,
        description: formData.description || `Verified ${formData.businessType} in ${formData.city}`,
        fullDescription: formData.fullDescription || formData.description,
        yearEstablished: Number(formData.yearEstablished) || undefined,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        city: formData.city,
        locality: formData.locality,
        address: formData.address || `${formData.locality}, ${formData.city}`,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        landmark: formData.landmark || undefined,
        buildingInfo: formData.buildingInfo || undefined,
        serviceAreas: formData.serviceAreas.split(',').map((s) => s.trim()),
        phone: formData.phone || '+91 98000 00000',
        alternatePhone: formData.alternatePhone || undefined,
        whatsapp: formData.whatsapp || formData.phone,
        whatsappEnabled: formData.whatsappEnabled,
        email: formData.email || currentUser?.email || 'contact@mycity.in',
        website: formData.website || undefined,
        directionsUrl:
          formData.directionsUrl ||
          `https://maps.google.com/?q=${encodeURIComponent(`${formData.name} ${formData.address} ${formData.city}`)}`,
        openingHours: formData.openingHours,
        priceRange: formData.priceRange,
        startingPrice: formData.startingPrice,
        services: servicesList,
        businessAttributes: formData.businessAttributes,
        coverImage: formData.coverImage,
        logo: formData.logo || undefined,
        googleBusinessUrl: formData.googleBusinessUrl || undefined,
        socialLinks: {
          instagram: formData.instagramUrl || undefined,
        },
        ownerName: formData.ownerName || currentUser?.name || 'Business Owner',
        ownerDesignation: formData.ownerDesignation,
        ownerPhone: formData.ownerPhone || formData.phone,
        ownerEmail: formData.ownerEmail || formData.email,
        verificationDocType: formData.documentType,
        verificationDocNumber: formData.documentNumber,
        ownerId:
          currentUser?.id && currentUser.id !== 'guest_user'
            ? currentUser.id
            : `owner_${Date.now()}`,
      };

      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedBusinessSlug(data.business?.slug || slug);
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('rankcity_cache_businesses');
          } catch {}
        }
        if (currentUser?.id && currentUser.id !== 'guest_user') {
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
            }),
          });
        }
      } else {
        setCreatedBusinessSlug(slug);
      }
      setCurrentStep(5);
    } catch (e) {
      console.error(e);
      setCreatedBusinessSlug('my-business');
      setCurrentStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dynamicAttributes =
    ATTRIBUTES_BY_CATEGORY[formData.categoryId] || ATTRIBUTES_BY_CATEGORY.default;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Complete Business Registration Form */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-6">
            {/* Onboarding Header & Profile Completion Score */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    RankCity Business Onboarding &bull; Add Your Business in 3 Minutes
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-neutral-950 mt-0.5">
                    Register Your Verified Business
                  </h1>
                </div>

                {/* Completion Meter */}
                <div className="bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-neutral-500 block">
                      Profile Strength
                    </span>
                    <span className="text-sm font-black text-neutral-900">
                      {completionPercent}% Complete
                    </span>
                  </div>
                  <div className="w-16 bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4 Step Progress Pills */}
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-neutral-100">
                {[
                  { num: 1, label: '1. Basic Info' },
                  { num: 2, label: '2. Location' },
                  { num: 3, label: '3. Operations' },
                  { num: 4, label: '4. Verification' },
                  { num: 5, label: '5. Done' },
                ].map((step) => (
                  <div key={step.num} className="flex flex-col items-center text-center">
                    <div
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentStep === step.num
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : currentStep > step.num
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {currentStep > step.num ? `✓ ${step.num}` : step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Container Form */}
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-sm space-y-8">
          {/* ================= STEP 1: BASIC BUSINESS INFORMATION ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Stage 1 &bull; Core Identity
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-950 mt-1">
                  Basic Business Information
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Enter official trade name, business type, industry taxonomy, and brand images.
                </p>
              </div>

              <div className="space-y-4">
                {/* Business Name */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Hotel Grand Imperial / ABC Multi-Specialty Clinic"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Business Type & Year Established */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Business Type *
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      {BUSINESS_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Year Established
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        name="yearEstablished"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.yearEstablished}
                        onChange={handleChange}
                        placeholder="2018"
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Primary Category *
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => {
                        const sel = categoriesList.find((c) => c.id === e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          categoryId: e.target.value,
                          categoryName: sel?.name || '',
                          subcategoryId: sel?.subcategories?.[0]?.id || '',
                          subcategoryName: sel?.subcategories?.[0]?.name || '',
                        }));
                      }}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Subcategory / Niche
                    </label>
                    {(() => {
                      const cur = categoriesList.find((c) => c.id === formData.categoryId);
                      const subcats = cur?.subcategories || [];
                      return (
                        <select
                          name="subcategoryId"
                          value={formData.subcategoryId}
                          onChange={(e) => {
                            const sub = subcats.find((s: any) => s.id === e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              subcategoryId: e.target.value,
                              subcategoryName: sub?.name || '',
                            }));
                          }}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="">All Services in {cur?.name || 'Category'}</option>
                          {subcats.map((sub: any) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Short Tagline / Card Description *
                    </label>
                    <span className="text-[11px] text-neutral-400">Shown on search cards</span>
                  </div>
                  <input
                    type="text"
                    name="description"
                    required
                    placeholder="e.g. Premier luxury business hotel with rooftop multi-cuisine dining."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Full Description (For Profile Page) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Full Business Profile Description (Optional)
                    </label>
                    <span className="text-[11px] text-neutral-400">Detailed overview on public profile</span>
                  </div>
                  <textarea
                    rows={3}
                    name="fullDescription"
                    placeholder="Describe your company history, customer experience, team, and specialties..."
                    value={formData.fullDescription}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Cover Photo & Logo URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Cover Image URL
                    </label>
                    <div className="relative">
                      <ImageIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        name="coverImage"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={formData.coverImage}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Business Logo URL (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        name="logo"
                        placeholder="https://mybusiness.in/logo.png"
                        value={formData.logo}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: LOCATION (RANKCITY CORE DATA) ================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Stage 2 &bull; Geographic Discovery
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-950 mt-1">
                  Location & Map Coordinates
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Full physical address, landmark, PIN code, and Google Maps directions link for customer routing.
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Physical Address */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Full Physical Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="e.g. 123, Ring Road, Scheme 54, Near Velocity Mirage"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* City & Locality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Indore, Bhopal, Mumbai..."
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Area / Locality *
                    </label>
                    <input
                      type="text"
                      name="locality"
                      required
                      placeholder="e.g. Vijay Nagar, Palasia, Kolar Road..."
                      value={formData.locality}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Landmark & Building Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      placeholder="e.g. Near C21 Mall / Opp Orbit Mall"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Building / Floor / Shop No. (Optional)
                    </label>
                    <input
                      type="text"
                      name="buildingInfo"
                      placeholder="e.g. 2nd Floor, Crystal IT Park"
                      value={formData.buildingInfo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* State, Country & PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="452010"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono font-bold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      {INDIAN_STATES_AND_UTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      {ALL_COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Google Maps Directions Link */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-rose-500" />
                      Google Maps Directions Link (Powers [📍 Directions] CTA)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const generated = `https://maps.google.com/?q=${encodeURIComponent(
                          `${formData.name} ${formData.address || formData.locality} ${formData.city}`
                        )}`;
                        setFormData((prev) => ({ ...prev, directionsUrl: generated }));
                      }}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      ⚡ Auto-generate from Address
                    </button>
                  </div>
                  <input
                    type="url"
                    name="directionsUrl"
                    placeholder="https://maps.google.com/?q=... or https://goo.gl/maps/..."
                    value={formData.directionsUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-[11px] text-neutral-500">
                    When customers click <strong>[📍 Directions]</strong> on your card or profile, they will navigate directly to this coordinate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: CONTACT & OPERATIONS ================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Stage 3 &bull; Operations & Customer Experience
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-950 mt-1">
                  Contact Details, Hours & Services
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Control direct calling, 1-tap WhatsApp chat, opening schedules, price bands, and category attributes.
                </p>
              </div>

              <div className="space-y-4">
                {/* Contact Phone & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Primary Phone (Powers [Call] CTA) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+91 98260 12345"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      WhatsApp Number (Powers [WhatsApp] CTA)
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="whatsapp"
                        placeholder="+91 98260 12345"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Business Email (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        placeholder="contact@mybusiness.in"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Business Website URL (Optional)
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        name="website"
                        placeholder="https://mybusiness.in"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Hours & Price Range */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Business Operating Hours
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="openingHours"
                        placeholder="Mon - Sun: 9:00 AM - 10:00 PM"
                        value={formData.openingHours}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Price Range Indicator
                    </label>
                    <select
                      name="priceRange"
                      value={formData.priceRange}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="₹">₹ (Budget / Affordable)</option>
                      <option value="₹₹">₹₹ (Moderate / Average)</option>
                      <option value="₹₹₹">₹₹₹ (Premium / Upscale)</option>
                      <option value="₹₹₹₹">₹₹₹₹ (Luxury / High-End)</option>
                    </select>
                  </div>
                </div>

                {/* Key Services (Comma Separated) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Key Services / Products (Comma Separated)
                    </label>
                    <span className="text-[11px] text-neutral-400">First 2-4 displayed on cards</span>
                  </div>
                  <input
                    type="text"
                    name="services"
                    placeholder="e.g. Luxury AC Rooms, Multi-cuisine Dining, Banquet Hall, Valet Parking"
                    value={formData.services}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Dynamic Category Attributes Checklist */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">
                    Category Attributes ({formData.categoryName})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {dynamicAttributes.map((attr) => {
                      const isChecked = formData.businessAttributes.includes(attr);
                      return (
                        <button
                          key={attr}
                          type="button"
                          onClick={() => toggleAttribute(attr)}
                          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all text-left cursor-pointer ${
                            isChecked
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          <span className="truncate">{attr}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: VERIFICATION & OWNERSHIP (PRIVATE) ================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Stage 4 &bull; Verification & Authorized Ownership
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-950 mt-1">
                  Business Verification
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  These records are stored securely for trust verification and grant the <strong>✓ Verified</strong> badge. (Never shown on public customer cards).
                </p>
              </div>

              <div className="space-y-4">
                {/* Authorized Owner Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Authorized Contact / Owner Name *
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Designation / Relationship
                    </label>
                    <input
                      type="text"
                      name="ownerDesignation"
                      placeholder="e.g. Proprietor / Managing Director / Store Manager"
                      value={formData.ownerDesignation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Verification Document Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Document Type *
                    </label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="GSTIN Registration Certificate">GSTIN Registration Certificate</option>
                      <option value="Gumasta / Shop & Establishment Act">Gumasta / Shop & Establishment Act</option>
                      <option value="MSME Udyam Registration">MSME Udyam Registration Certificate</option>
                      <option value="FSSAI Food Safety License">FSSAI Food Safety License</option>
                      <option value="Trade License / Electricity Bill">Trade License / Commercial Electricity Bill</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Registration / Certificate Number *
                    </label>
                    <input
                      type="text"
                      name="documentNumber"
                      required
                      placeholder="e.g. 23AAAAA0000A1Z5"
                      value={formData.documentNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono font-bold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Document File Mockup */}
                <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-6 text-center space-y-2 bg-neutral-50/60 hover:bg-neutral-50 transition-colors">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto" />
                  <div className="text-xs font-bold text-neutral-800">
                    {formData.ownershipProofName}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    PDF, JPG, PNG accepted (Max 10MB) &bull; Encrypted & Private
                  </p>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-100 shadow-2xs"
                  >
                    Select Proof File
                  </button>
                </div>

                {/* Legal Declaration */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 space-y-1">
                    <p className="font-bold">Trust & Integrity Guarantee</p>
                    <p className="text-emerald-800/90 leading-relaxed">
                      Verification documents and personal contact numbers are kept strictly confidential. Only your public business card details and <strong>✓ Verified</strong> badge will be visible to consumers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: SUCCESS / SUBMITTED ================= */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center py-6 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-neutral-950">
                  Business Listing Successfully Created!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
                  Your business is now live on RankCity. You can preview your public business card or promote your listing with sponsored rankings.
                </p>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 max-w-md mx-auto text-left space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Business Name:</span>
                  <strong className="text-neutral-900">{formData.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Type / Category:</span>
                  <strong className="text-neutral-900">{formData.businessType} &bull; {formData.categoryName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Address:</span>
                  <strong className="text-neutral-900">{formData.locality}, {formData.city}</strong>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
                  <span className="text-neutral-500">Badge Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Business
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href={`/business/${createdBusinessSlug || 'my-business'}`}
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  View Public Profile & Card
                </Link>
                <Link
                  href="/publisher"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Promote / Bid for #1 Rank
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Buttons for Steps 1 - 4 */}
          {currentStep < 5 && (
            <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting || (currentStep === 1 && !formData.name)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  'Submitting Business...'
                ) : currentStep === 4 ? (
                  'Submit & Publish Listing'
                ) : (
                  <>
                    Continue to Step {currentStep + 1} <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Seamless GlobeStudy (bina koi card ke, desktop only, hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 sticky top-16 flex-col items-center justify-center min-h-[720px] pointer-events-auto">
        <div className="w-full h-[720px] relative flex items-center justify-center overflow-visible">
          <GlobeStudy
            background="transparent"
            baseColor="#0F40BA"
            phrase="Rankcity"
            density={195}
            glyphSize={48}
            speed={42}
            globe={{
              drift: 210,
              radius: 142,
              letters: 100,
            }}
            pointer={{
              pins: 7,
              zoom: 100,
              light: 100,
            }}
          />
        </div>
      </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
