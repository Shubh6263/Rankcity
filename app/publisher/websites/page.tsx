'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Business, Category, LocationHierarchy } from '@/types';
import { Building2, Plus, CheckCircle2, Clock, Phone, MapPin, ExternalLink, Star, Edit3, MessageCircle, Navigation, Eye, Globe } from 'lucide-react';
import Link from 'next/link';
import { EditBusinessModal } from '@/components/publisher/EditBusinessModal';
import { DashboardCardSkeleton } from '@/components/business/BusinessCardSkeleton';

export default function BusinessManagementPage() {
  const { currentUser } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationHierarchy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('452010');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [website, setWebsite] = useState(''); // Optional!
  const [directionsUrl, setDirectionsUrl] = useState(''); // Optional Google Maps directions!
  const [openingHours, setOpeningHours] = useState('Mon - Sun: 9:00 AM - 10:00 PM');
  const [priceRange, setPriceRange] = useState<'₹' | '₹₹' | '₹₹₹' | '₹₹₹₹'>('₹₹');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        fetch(`/api/businesses?ownerId=${currentUser.id}`),
        fetch('/api/categories'),
      ]);
      if (bRes.ok && cRes.ok) {
        const bJson = await bRes.json();
        const cJson = await cRes.json();
        setBusinesses(bJson.businesses || []);
        setCategories(cJson.categories || []);
        setLocations(cJson.locations || []);
        if (cJson.categories?.[0]) setCategoryId(cJson.categories[0].id);
        if (cJson.locations?.[0]) {
          setLocationId(cJson.locations[0].id);
          setCity(cJson.locations[0].city);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [currentUser.id]);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: currentUser.id,
          name,
          description,
          categoryId,
          subcategoryId: subcategoryId || undefined,
          locationId,
          address,
          locality,
          city: city || 'Indore',
          state: 'Madhya Pradesh',
          pincode,
          phone,
          whatsapp,
          email,
          website: website.trim() ? website : undefined, // Optional!
          directionsUrl: directionsUrl.trim() ? directionsUrl : undefined, // Optional Google Maps Directions!
          openingHours,
          priceRange,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit business listing');
      }

      setFormSuccess('Business listing created and approved for auctions!');
      setName('');
      setDescription('');
      setAddress('');
      setWebsite('');
      await fetchBusinesses();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
      }, 1200);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Merchant Assets
          </span>
          <h1 className="text-2xl font-bold text-neutral-900">
            My Business Listings
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Add and manage multiple business places, clinics, hotels, and retail outlets under one account.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your Business Free</span>
        </button>
      </div>

      {/* Business Cards Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <DashboardCardSkeleton count={2} />
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
            <Building2 className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-900 mb-1">No Business Listings Registered Yet</h3>
            <p className="text-neutral-500 text-xs mb-4 max-w-sm mx-auto">
              Add your physical business, clinic, hotel, or retail outlet for ₹0 to start receiving direct phone calls and bidding for top positions.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Add Your First Business Free
            </button>
          </div>
        ) : (
          businesses.map((biz) => {
            const cat = categories.find((c) => c.id === biz.categoryId);
            const loc = locations.find((l) => l.id === biz.locationId);

            return (
              <div
                key={biz.id}
                className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900">
                      <Link href={`/business/${biz.slug}`} className="hover:text-amber-600 transition-colors">
                        {biz.name}
                      </Link>
                    </h3>

                    {biz.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Verification
                      </span>
                    )}

                    <span className="text-[11px] text-neutral-500 font-mono font-bold">
                      ★ {biz.rating} ({biz.reviewCount})
                    </span>
                  </div>

                  <div className="text-xs text-neutral-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{biz.address}, {biz.city}</span>
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                    {biz.description}
                  </p>

                  {/* Contact Badges with Icons */}
                  <div className="flex flex-wrap items-center gap-3 text-xs pt-0.5">
                    {biz.phone && (
                      <span className="inline-flex items-center gap-1 text-neutral-700 font-semibold bg-neutral-100 px-2 py-0.5 rounded-md">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{biz.phone}</span>
                      </span>
                    )}
                    {biz.whatsapp && (
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                        <span>{biz.whatsapp}</span>
                      </span>
                    )}
                    {biz.website && (
                      <a
                        href={biz.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 pt-1">
                    <span>Category: <strong className="text-neutral-700">{cat?.name}</strong></span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3 text-neutral-400" />
                      <span>Views: <strong className="text-neutral-700 tabular-nums">{biz.totalViews}</strong></span>
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>Calls: <strong className="text-neutral-700 tabular-nums">{biz.totalCalls}</strong></span>
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp: <strong className="text-neutral-700 tabular-nums">{biz.totalWhatsapp}</strong></span>
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-rose-500" />
                      <span>Directions: <strong className="text-neutral-700 tabular-nums">{biz.totalDirections}</strong></span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingBusiness(biz)}
                    className="px-3.5 py-2 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit Business</span>
                  </button>

                  <Link
                    href={`/business/${biz.slug}`}
                    className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <span>Public Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/publisher/campaigns/new?businessId=${biz.id}`}
                    className="px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Promote / Bid #1</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Business Modal */}
      <EditBusinessModal
        business={editingBusiness}
        isOpen={Boolean(editingBusiness)}
        categories={categories}
        locations={locations}
        onClose={() => setEditingBusiness(null)}
        onSuccess={(updated) => {
          setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
          setEditingBusiness(null);
        }}
      />

      {/* Add Business Modal (Requirement #4) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider block">
                  Free Registration (₹0)
                </span>
                <h2 className="text-base font-bold">Add Your Business</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="p-6 space-y-4 overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                  {formSuccess}
                </div>
              )}

              <div>
                <label htmlFor="biz-name" className="block font-semibold text-neutral-700 mb-1">
                  Business Name *
                </label>
                <input
                  id="biz-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Hotel Grand Palace / Dr. Smile Dental Clinic"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="biz-cat" className="block font-semibold text-neutral-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="biz-cat"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none text-neutral-800"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="biz-subcat" className="block font-semibold text-neutral-700 mb-1">
                    Subcategory
                  </label>
                  <select
                    id="biz-subcat"
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none text-neutral-800"
                  >
                    <option value="">All Subcategories</option>
                    {selectedCategoryObj?.subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="biz-desc" className="block font-semibold text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  id="biz-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your business offerings, experience, and facilities..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="biz-address" className="block font-semibold text-neutral-700 mb-1">
                  Physical Address *
                </label>
                <input
                  id="biz-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 42, Scheme 54, Near Velocity Mirage"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="biz-loc" className="block font-semibold text-neutral-700 mb-1">
                    Locality / Area
                  </label>
                  <input
                    id="biz-loc"
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="Vijay Nagar"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="biz-city" className="block font-semibold text-neutral-700 mb-1">
                    City *
                  </label>
                  <select
                    id="biz-city"
                    value={locationId}
                    onChange={(e) => {
                      setLocationId(e.target.value);
                      const l = locations.find((loc) => loc.id === e.target.value);
                      if (l) setCity(l.city);
                    }}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.locality && loc.locality !== 'All Localities'
                          ? `${loc.locality}, ${loc.city}`
                          : loc.city} ({loc.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="biz-pincode" className="block font-semibold text-neutral-700 mb-1">
                    Pincode
                  </label>
                  <input
                    id="biz-pincode"
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="biz-phone" className="block font-semibold text-neutral-700 mb-1">
                    Phone Number (for Calls) *
                  </label>
                  <input
                    id="biz-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98260 00000"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="biz-whatsapp" className="block font-semibold text-neutral-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    id="biz-whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+91 98260 00000"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="biz-email" className="block font-semibold text-neutral-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    id="biz-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="biz-website" className="block font-semibold text-neutral-700 mb-1">
                    Website URL (Optional)
                  </label>
                  <input
                    id="biz-website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://mybusiness.in"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="biz-directions" className="block font-semibold text-neutral-700 mb-1">
                  Google Maps Link / Directions URL (Optional)
                </label>
                <input
                  id="biz-directions"
                  type="url"
                  value={directionsUrl}
                  onChange={(e) => setDirectionsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=... or https://goo.gl/maps/..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Powers the 1-tap [Directions] button on your public card and profile.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="biz-hours" className="block font-semibold text-neutral-700 mb-1">
                    Opening Hours
                  </label>
                  <input
                    id="biz-hours"
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="biz-price" className="block font-semibold text-neutral-700 mb-1">
                    Price Range
                  </label>
                  <select
                    id="biz-price"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none font-mono"
                  >
                    <option value="₹">₹ (Budget)</option>
                    <option value="₹₹">₹₹ (Moderate)</option>
                    <option value="₹₹₹">₹₹₹ (Premium)</option>
                    <option value="₹₹₹₹">₹₹₹₹ (Luxury)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-neutral-300 rounded-lg font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold transition-colors disabled:bg-neutral-400"
                >
                  {isSubmitting ? 'Registering...' : 'Register Business Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
