'use client';

import React, { useState } from 'react';
import { Business, Category, LocationHierarchy } from '@/types';
import { HierarchicalLocationSelector, LocationSelectionValue } from '@/components/location/HierarchicalLocationSelector';
import { X, Save, Building2, MapPin, Phone, Globe, Clock, Sparkles, Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';

interface EditBusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  categories: Category[];
  locations: LocationHierarchy[];
  onClose: () => void;
  onSuccess: (updatedBusiness: Business) => void;
}

export const EditBusinessModal: React.FC<EditBusinessModalProps> = (props) => {
  if (!props.isOpen || !props.business) return null;

  return <EditBusinessForm key={props.business.id} {...props} business={props.business} />;
};

const EditBusinessForm: React.FC<Omit<EditBusinessModalProps, 'business'> & { business: Business }> = ({
  business,
  categories,
  locations,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(business.name || '');
  const [description, setDescription] = useState(business.description || '');
  const [fullDescription, setFullDescription] = useState(business.fullDescription || business.description || '');
  const [businessType, setBusinessType] = useState(business.businessType || 'Retail Store');
  const [categoryId, setCategoryId] = useState(business.categoryId || '');
  const [subcategoryId, setSubcategoryId] = useState(business.subcategoryId || '');
  const [address, setAddress] = useState(business.address || '');
  const [locality, setLocality] = useState(business.locality || '');
  const [city, setCity] = useState(business.city || 'Indore');
  const [state, setState] = useState(business.state || 'Madhya Pradesh');
  const [pincode, setPincode] = useState(business.pincode || '452010');
  const [country, setCountry] = useState(business.country || 'India');
  const [stateId, setStateId] = useState(business.stateId || '');
  const [districtId, setDistrictId] = useState(business.districtId || '');
  const [cityId, setCityId] = useState(business.cityId || '');
  const [landmark, setLandmark] = useState(business.landmark || '');
  const [buildingInfo, setBuildingInfo] = useState(business.buildingInfo || '');
  const [phone, setPhone] = useState(business.phone || '');
  const [whatsapp, setWhatsapp] = useState(business.whatsapp || '');
  const [email, setEmail] = useState(business.email || '');
  const [website, setWebsite] = useState(business.website || '');
  const [directionsUrl, setDirectionsUrl] = useState(business.directionsUrl || business.mapLink || '');
  const [openingHours, setOpeningHours] = useState(business.openingHours || 'Mon - Sun: 9:00 AM - 10:00 PM');
  const [priceRange, setPriceRange] = useState<'₹' | '₹₹' | '₹₹₹' | '₹₹₹₹'>((business.priceRange as any) || '₹₹');
  const [services, setServices] = useState((business.services || []).join(', '));
  const [amenities, setAmenities] = useState((business.amenities || []).join(', '));
  const [coverImage, setCoverImage] = useState(business.coverImage || '');
  const [logo, setLogo] = useState(business.logo || '');
  const [photos, setPhotos] = useState<string[]>(business.photos || []);
  const [cardPhotos, setCardPhotos] = useState<string[]>(business.cardPhotos ?? business.photos ?? []);
  const [profilePhotos, setProfilePhotos] = useState<string[]>(business.profilePhotos ?? business.photos ?? []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'contact' | 'services'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrl.trim()) return;
    if (photos.length >= 10) {
      setError('You can add up to 10 gallery photos.');
      return;
    }
    const photo = newPhotoUrl.trim();
    setPhotos((prev) => [...prev, photo]);
    setCardPhotos((prev) => [...prev, photo]);
    setProfilePhotos((prev) => [...prev, photo]);
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const photo = photos[indexToRemove];
    setPhotos((prev) => prev.filter((_, i) => i !== indexToRemove));
    setCardPhotos((prev) => prev.filter((selectedPhoto) => selectedPhoto !== photo));
    setProfilePhotos((prev) => prev.filter((selectedPhoto) => selectedPhoto !== photo));
  };

  const handleLocationChange = (location: LocationSelectionValue) => {
    setCountry(location.country);
    setStateId(location.stateId);
    setState(location.stateName);
    setDistrictId(location.districtId);
    setCityId(location.cityId);
    setCity(location.cityName);
    setLocality(location.locality);
    setPincode(location.pincode);
    setAddress(location.address);
    setLandmark(location.landmark || '');
    setBuildingInfo(location.buildingInfo || '');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'logo' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'cover') {
        setCoverImage(result);
      } else if (target === 'logo') {
        setLogo(result);
      } else if (target === 'gallery') {
        if (photos.length >= 10) {
          setError('Maximum 10 photos allowed.');
          return;
        }
        setPhotos((prev) => [...prev, result]);
        setCardPhotos((prev) => [...prev, result]);
        setProfilePhotos((prev) => [...prev, result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!stateId || !districtId || !cityId) {
      setError('Select a verified state, district, and city before saving this listing.');
      setActiveTab('location');
      return;
    }
    setIsSubmitting(true);

    try {
      const parsedServices = services
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedAmenities = amenities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          fullDescription,
          businessType,
          categoryId,
          subcategoryId: subcategoryId || undefined,
          locationId: cityId,
          country,
          stateId,
          districtId,
          cityId,
          address,
          locality,
          city,
          state,
          pincode,
          landmark,
          buildingInfo,
          phone,
          whatsapp,
          email,
          website: website.trim() ? website : undefined,
          directionsUrl: directionsUrl.trim() ? directionsUrl : undefined,
          openingHours,
          priceRange,
          services: parsedServices.length > 0 ? parsedServices : undefined,
          amenities: parsedAmenities.length > 0 ? parsedAmenities : undefined,
          coverImage: coverImage.trim() ? coverImage : undefined,
          logo: logo.trim() ? logo : undefined,
          photos: photos,
          cardPhotos,
          profilePhotos,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update business');
      }

      onSuccess(data.business);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                Manage Listing
              </span>
              <span className="text-[11px] text-neutral-400">· ID: {business.id.slice(0, 10)}...</span>
            </div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>Edit: {business.name}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 shrink-0 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'basic'
                ? 'border-neutral-900 text-neutral-900 font-bold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Basic Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'location'
                ? 'border-neutral-900 text-neutral-900 font-bold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>2. Address & Maps</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-neutral-900 text-neutral-900 font-bold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>3. Contact & Hours</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'services'
                ? 'border-neutral-900 text-neutral-900 font-bold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. Services & Media</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
              {error}
            </div>
          )}

          {/* Tab 1: Basic Info */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="E.g. Hotel Grand Palace"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Business Type *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                  >
                    <option value="Retail Store">Retail Store</option>
                    <option value="Restaurant / Cafe">Restaurant / Cafe</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Service Provider">Service Provider</option>
                    <option value="Professional">Professional</option>
                    <option value="Educational Institution">Educational Institution</option>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Primary Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Subcategory
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                >
                  <option value="">All Subcategories</option>
                  {selectedCategoryObj?.subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Short Description (Shown on card & search) *
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary for customers browsing listings..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Full Detailed Description (Shown on public profile)
                </label>
                <textarea
                  rows={4}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Complete business history, specialties, facilities, certifications..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Location & Address */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Physical Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="E.g. Plot 42, Scheme 54, Near Velocity Mirage"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                />
              </div>

              <HierarchicalLocationSelector
                value={{
                  country,
                  stateId,
                  stateName: state,
                  districtId,
                  districtName: '',
                  cityId,
                  cityName: city,
                  locality,
                  pincode,
                  address,
                  landmark,
                  buildingInfo,
                }}
                onChange={handleLocationChange}
              />

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Google Maps Link / Directions URL (Optional)
                </label>
                <input
                  type="url"
                  value={directionsUrl}
                  onChange={(e) => setDirectionsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=... or https://goo.gl/maps/..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Powers the 1-click [📍 Directions] navigation button on customer cards and profile pages.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Contact & Hours */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Primary Phone (Calls) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98260 00000"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
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
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Official Website (Optional)
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://mybusiness.in"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="Mon - Sun: 9:00 AM - 10:00 PM"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Price Range Indicator
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none font-mono"
                  >
                    <option value="₹">₹ (Budget / Affordable)</option>
                    <option value="₹₹">₹₹ (Moderate / Standard)</option>
                    <option value="₹₹₹">₹₹₹ (Premium)</option>
                    <option value="₹₹₹₹">₹₹₹₹ (Luxury / High-End)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Services & Media */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Key Services & Offerings (Comma separated)
                </label>
                <textarea
                  rows={2}
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="E.g. AC Rooms, Free WiFi, Banquet Hall, 24x7 Room Service, Parking"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Shown as badges on customer search cards and profile pages.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Amenities & Facilities (Comma separated)
                </label>
                <input
                  type="text"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  placeholder="E.g. Valet Parking, Wheelchair Accessible, UPI Accepted, Card Accepted"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none"
                />
              </div>

              {/* Cover Photo */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-neutral-600" />
                    <span>Main Cover Banner Photo</span>
                  </label>
                  <label className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'cover')}
                    />
                  </label>
                </div>

                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-none"
                />

                {coverImage && (
                  <div className="relative h-28 w-full rounded-lg overflow-hidden border border-neutral-200">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white p-1 rounded-md"
                      title="Remove Cover"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Logo Image */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Business Logo</span>
                  </label>
                  <label className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                    />
                  </label>
                </div>

                <div className="flex gap-3 items-center">
                  {logo && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-white">
                      <img src={logo} alt="Logo Preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setLogo('')}
                        className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white"
                        title="Remove Logo"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    </div>
                  )}
                  <input
                    type="url"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="Or paste Logo URL (https://...)"
                    className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Gallery (Interior, Exterior, Products, Work Samples) */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-neutral-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>Business Photos Gallery ({photos.length}/10)</span>
                    </label>
                    <p className="text-[10px] text-neutral-500">
                      Choose separately which photos appear in business-card swipes and on the full profile.
                    </p>
                  </div>

                  <label className="text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'gallery')}
                    />
                  </label>
                </div>

                {/* Add Photo by URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Or paste image link (https://...)"
                    className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* Photo selection */}
                {photos.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {photos.map((p, idx) => (
                      <div key={`${idx}-${p}`} className="min-w-0 space-y-1.5">
                        <div className="relative rounded-lg overflow-hidden border border-neutral-200 aspect-video bg-neutral-100">
                          <img src={p} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs cursor-pointer"
                            title="Delete Photo"
                            aria-label={`Delete photo ${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <label className="flex items-center gap-1 text-[10px] leading-tight text-neutral-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cardPhotos.includes(p)}
                            onChange={(e) => setCardPhotos((prev) =>
                              e.target.checked ? [...prev, p] : prev.filter((photo) => photo !== p)
                            )}
                            className="accent-blue-600"
                          />
                          Card carousel
                        </label>
                        <label className="flex items-center gap-1 text-[10px] leading-tight text-neutral-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profilePhotos.includes(p)}
                            onChange={(e) => setProfilePhotos((prev) =>
                              e.target.checked ? [...prev, p] : prev.filter((photo) => photo !== p)
                            )}
                            className="accent-blue-600"
                          />
                          Profile gallery
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-neutral-300 rounded-lg text-center text-[11px] text-neutral-500 bg-white">
                    No gallery photos added yet. Click <strong>Upload Photos</strong> or paste a URL above to showcase your premises.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-neutral-300 rounded-xl font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold transition-colors disabled:bg-neutral-400 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save & Update Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
