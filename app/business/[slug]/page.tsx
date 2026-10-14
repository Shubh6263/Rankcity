'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { useAuth } from '@/lib/auth/context';
import { Business, Review } from '@/types';
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import {
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Clock,
  Star,
  ShieldCheck,
  Navigation,
  Share2,
  Bed,
  Utensils,
  PartyPopper,
  Wifi,
  Bell,
  Car,
  Tag,
  ChevronRight,
  Check,
  Bookmark,
  Send,
  Building2,
  FileCheck,
  MessageSquare,
  CornerDownRight,
  X,
  Edit3,
} from 'lucide-react';
import { EditBusinessModal } from '@/components/publisher/EditBusinessModal';
import { Category, LocationHierarchy } from '@/types';

interface BusinessProfilePageProps {
  params: Promise<{ slug: string }>;
}

import { getCachedBusinesses } from '@/lib/cache/dataCache';
import { CustomPhoneIcon, CustomNavigationIcon, CustomWhatsAppIcon } from '@/components/business/BusinessCard';

export default function BusinessProfilePage({ params }: BusinessProfilePageProps) {
  const { slug } = use(params);
  const { currentUser } = useAuth();
  
  // Hydration-safe initial state (identical between server SSR and client first pass)
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leadFeedback, setLeadFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'reviews' | 'services' | 'offers' | 'map'>('overview');
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Modals state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState<string | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [locationsList, setLocationsList] = useState<LocationHierarchy[]>([]);

  // Form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [enquiryName, setEnquiryName] = useState(currentUser.name || '');
  const [enquiryPhone, setEnquiryPhone] = useState(currentUser.phone || '+91 ');
  const [enquiryEmail, setEnquiryEmail] = useState(currentUser.email || '');
  const [enquiryService, setEnquiryService] = useState('Standard Service / Booking');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);

  const [claimApplicant, setClaimApplicant] = useState(currentUser.name || '');
  const [claimPhone, setClaimPhone] = useState(currentUser.phone || '+91 ');
  const [claimRole, setClaimRole] = useState('Proprietor / Director');
  const [claimRegNum, setClaimRegNum] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    // 1. Immediately hydrate from memory/client cache if available (0ms instant display)
    const cached = getCachedBusinesses()?.find((b) => b.slug === slug || b.id === slug);
    if (cached) {
      setBusiness(cached);
      setIsLoading(false);
    }

    // 2. Fresh background fetch
    async function loadData() {
      try {
        const res = await fetch(`/api/businesses/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBusiness(data.business);

          if (data.business?.id) {
            // Load real reviews
            const revRes = await fetch(`/api/reviews?businessId=${data.business.id}`);
            if (revRes.ok) {
              const rData = await revRes.json();
              setReviews(rData.reviews || []);
            }

            // Load categories & locations for editing
            const catRes = await fetch('/api/categories');
            if (catRes.ok) {
              const catData = await catRes.json();
              setCategoriesList(catData.categories || []);
              setLocationsList(catData.locations || []);
            }

            // Check if saved
            const favRes = await fetch(`/api/favorites?userId=${currentUser.id}`);
            if (favRes.ok) {
              const fData = await favRes.json();
              const saved = (fData.favorites || []).some((f: any) => f.businessId === data.business.id);
              setIsSaved(saved);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug, currentUser.id]);

  const toggleFavorite = async () => {
    if (!business) return;
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, businessId: business.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.isFavorite);
        setLeadFeedback(data.isFavorite ? 'Saved to bookmarks!' : 'Removed from bookmarks');
        setTimeout(() => setLeadFeedback(null), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeadAction = async (type: 'call' | 'whatsapp' | 'directions' | 'website') => {
    if (!business) return;
    try {
      await fetch(`/api/businesses/${business.id}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      setLeadFeedback(`Connected via ${type}!`);
      setTimeout(() => setLeadFeedback(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          userId: currentUser.id,
          userName: currentUser.name || 'Verified Customer',
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.review) {
          setReviews((prev) => [data.review, ...prev]);
        }
        setShowReviewModal(false);
        setReviewComment('');
        setLeadFeedback('Thank you! Your review has been published.');
        setTimeout(() => setLeadFeedback(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !enquiryPhone || !enquiryMessage.trim()) return;
    setEnquirySubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          customerName: enquiryName,
          customerPhone: enquiryPhone,
          customerEmail: enquiryEmail,
          serviceRequested: enquiryService,
          message: enquiryMessage.trim(),
          type: 'enquiry',
        }),
      });
      if (res.ok) {
        setShowEnquiryModal(false);
        setEnquiryMessage('');
        setLeadFeedback('Enquiry sent directly to the business owner!');
        setTimeout(() => setLeadFeedback(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !claimApplicant || !claimPhone) return;
    setClaimSubmitting(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          userId: currentUser.id,
          applicantName: claimApplicant,
          phone: claimPhone,
          email: currentUser.email,
          businessRole: claimRole,
          registrationNumber: claimRegNum,
          notes: claimNotes,
        }),
      });
      if (res.ok) {
        setShowClaimModal(false);
        setLeadFeedback('Ownership claim submitted! Moderator review pending in admin queue.');
        setTimeout(() => setLeadFeedback(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyText: replyText.trim(),
          authorName: currentUser.name || 'Management',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, reply: data.review.reply } : r))
        );
        setShowReplyModal(null);
        setReplyText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplySubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500 text-xs">
        Loading business profile...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-neutral-900">
        <RoleSwitcherBar />
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Business Not Found</h1>
          <p className="text-xs text-neutral-500 mt-2">
            The requested business profile does not exist or has moved.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
          >
            Explore Verified Directory
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwnerOrManager =
    currentUser.id === business.ownerId ||
    currentUser.role === 'BUSINESS_OWNER' ||
    currentUser.role === 'BUSINESS_MANAGER';

  const profileGalleryPhotos = business.profilePhotos ?? business.photos ?? [];
  const gallery = Array.from(new Set([
    business.coverImage || business.logo || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    ...profileGalleryPhotos,
  ]));

  const mapQuery = encodeURIComponent(`${business.name} ${business.address} ${business.city}`);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* Schema.org LocalBusiness & BreadcrumbList JSON-LD for Rich Snippets & GEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusinessSchema(business)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: business.city || 'Indore', url: `/${(business.city || 'indore').toLowerCase()}/hotels` },
              { name: business.name, url: `/business/${business.slug}` },
            ])
          ),
        }}
      />

      <RoleSwitcherBar />
      <Navbar />

      {/* Floating Feedback Alert */}
      {leadFeedback && (
        <div className="fixed top-20 right-4 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-neutral-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{leadFeedback}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Photo Gallery Grid */}
        <div className="rounded-3xl overflow-hidden shadow-xs border border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5 h-[340px] sm:h-[440px] bg-neutral-900">
            <div className="md:col-span-2 h-full relative cursor-pointer overflow-hidden group">
              <img
                src={gallery[selectedPhotoIdx] || gallery[0]}
                alt={business.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-1.5 h-full">
              {gallery.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPhotoIdx(i + 1)}
                  className="h-[216px] relative cursor-pointer overflow-hidden group"
                >
                  <img
                    src={img}
                    alt={`${business.name} preview ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {i === 3 && (
                    <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-2xs flex flex-col items-center justify-center text-white text-xs sm:text-sm font-bold">
                      <span>View All Photos</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Business Header & Badges */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                  {business.name}
                </h1>
                {business.isVerified && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Business
                  </span>
                )}
                {business.isFeatured && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-amber-950 text-xs font-bold shadow-2xs">
                    🟠 Sponsored #1
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-neutral-600">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="text-neutral-900">{business.rating || 4.8}</span>
                  <span className="text-neutral-400 font-normal">
                    ({reviews.length > 0 ? reviews.length : business.reviewCount} reviews)
                  </span>
                </div>
                <span>&bull;</span>
                <div className="flex items-center gap-1 text-neutral-600">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{business.address || `${business.locality}, Indore, Madhya Pradesh`}</span>
                </div>
                {business.priceRange && (
                  <>
                    <span>&bull;</span>
                    <span className="font-semibold text-neutral-700">{business.priceRange} Price Band</span>
                  </>
                )}
              </div>
            </div>

            {/* Owner/Admin Edit CTA or Claim / Verify CTA */}
            <div className="flex items-center gap-2">
              {(currentUser.id === business.ownerId || currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Edit Business</span>
                </button>
              )}

              <button
                onClick={toggleFavorite}
                className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                  isSaved
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                }`}
                title="Save Business"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {currentUser.id !== business.ownerId && (
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Claim This Business</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons Bar: [Call], [WhatsApp], [Directions], [Send Enquiry], [Share] */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 pt-2">
            <a
              href={`tel:${business.phone}`}
              onClick={() => handleLeadAction('call')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <CustomPhoneIcon className="w-4 h-4 shrink-0" />
              <span>Call Now</span>
            </a>

            <a
              href={`https://wa.me/${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(business.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLeadAction('whatsapp')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <CustomWhatsAppIcon className="w-4 h-4 shrink-0" />
              <span>WhatsApp</span>
            </a>

            <a
              href={business.directionsUrl || business.mapLink || `https://maps.google.com/?q=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLeadAction('directions')}
              className="px-4 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <CustomNavigationIcon className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Directions</span>
            </a>

            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Send className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Enquiry</span>
            </button>

            <button
              onClick={handleShare}
              className="col-span-2 sm:col-span-1 px-4 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Share2 className="w-4 h-4 text-neutral-500 shrink-0" />}
              <span>{isCopied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 pt-4">
          <div className="flex items-center gap-8 overflow-x-auto text-sm font-medium">
            {(['overview', 'photos', 'reviews', 'services', 'offers', 'map'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 capitalize transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 border-b-2 border-transparent'
                }`}
              >
                {tab}
                {tab === 'reviews' && reviews.length > 0 && ` (${reviews.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 pt-2">
            <div className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">About {business.name}</h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl">
                {business.description ||
                  `${business.name} is a premier verified enterprise in ${business.city} delivering certified local quality and transparent service.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Operating Hours
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-900">
                  {business.openingHours || 'Mon - Sun: 9:00 AM - 10:00 PM'}
                </span>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Location Hierarchy
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-900">
                  {business.locality || 'Central'}, {business.city}, {business.state}
                </span>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Verification Badge
                </span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  {business.isVerified ? 'Official Verified Partner' : 'Verification Under Review'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Photos */}
        {activeTab === 'photos' && (
          <div className="pt-2 space-y-4">
            <h2 className="text-base font-bold text-neutral-900">Property Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map((imgUrl, i) => (
                <div key={i} className="h-48 rounded-xl overflow-hidden bg-neutral-100 shadow-2xs">
                  <img
                    src={imgUrl}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: REVIEWS (Full Interactive PRD Flow) */}
        {activeTab === 'reviews' && (
          <div className="pt-2 space-y-6 max-w-3xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Customer Ratings & Reviews</h2>
                <div className="text-xs text-neutral-500 font-medium mt-0.5">
                  ★ {business.rating} out of 5 based on authentic customer submissions
                </div>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span>Write a Review</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <Star className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="font-bold text-neutral-800 text-sm">No reviews yet</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Be the first to share your experience with {business.name}.
                </p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl"
                >
                  Write First Review
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-5 bg-neutral-50/80 rounded-2xl border border-neutral-200/90 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-neutral-900 font-bold text-sm block">{rev.userName}</strong>
                        <span className="text-[11px] text-neutral-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex text-amber-500 text-sm">
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">{rev.comment}</p>

                    {/* Owner Response Display */}
                    {rev.reply && (
                      <div className="p-3.5 bg-blue-50/60 border-l-4 border-blue-600 rounded-r-xl space-y-1 mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Owner Response ({rev.reply.authorName})</span>
                        </div>
                        <p className="text-xs text-blue-950/80">{rev.reply.text}</p>
                      </div>
                    )}

                    {/* Owner Reply Button if current persona is owner/manager and no reply yet */}
                    {!rev.reply && isOwnerOrManager && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setShowReplyModal(rev.id);
                            setReplyText('');
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Reply to Customer as Owner</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Services */}
        {activeTab === 'services' && (
          <div className="pt-2 space-y-4 max-w-3xl">
            <h2 className="text-base font-bold text-neutral-900">Services & Offerings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-700">
              {(business.services || ['Executive Suite Accommodation', 'Conference Banquet Facilities', 'Gourmet Rooftop Dining', 'Airport Valet Transfers']).map((svc, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-neutral-800">{svc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Offers */}
        {activeTab === 'offers' && (
          <div className="pt-2 space-y-4 max-w-3xl">
            <h2 className="text-base font-bold text-neutral-900">Current Exclusive Offers</h2>
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-base text-neutral-900">Seasonal Direct Customer 20% Off</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Book direct or initiate a WhatsApp inquiry through RankCity to unlock exclusive 20% savings on food, beverages, and conference packages.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowEnquiryModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Claim Offer via Enquiry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Map */}
        {activeTab === 'map' && (
          <div className="pt-2 space-y-4">
            <h2 className="text-base font-bold text-neutral-900">Location & Route Map</h2>
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm relative">
              <iframe
                title="Business Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={mapEmbedUrl}
                className="w-full h-full"
              />
            </div>
            <div className="text-xs text-neutral-600 flex items-center justify-between">
              <span>{business.address}</span>
              <a
                href={`https://maps.google.com/?q=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-bold hover:underline"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Write a Review */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900">Rate & Review {business.name}</h3>
            <p className="text-xs text-neutral-500">
              Share your genuine customer experience with the local community.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl cursor-pointer transition-transform hover:scale-125 ${
                        star <= reviewRating ? 'text-amber-500' : 'text-neutral-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-neutral-600 ml-2">{reviewRating} of 5 Stars</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe the service quality, amenities, cleanliness, and value..."
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Send Enquiry Form */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowEnquiryModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900">Direct Enquiry to {business.name}</h3>
            <p className="text-xs text-neutral-500">
              Submit your inquiry or quote request. The verified business owner will reach out directly.
            </p>

            <form onSubmit={handleSubmitEnquiry} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Email (Optional)</label>
                <input
                  type="email"
                  value={enquiryEmail}
                  onChange={(e) => setEnquiryEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Service / Booking Type</label>
                <input
                  type="text"
                  value={enquiryService}
                  onChange={(e) => setEnquiryService(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Message / Request</label>
                <textarea
                  required
                  rows={3}
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  placeholder="Specify dates, number of persons, or specific services needed..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enquirySubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {enquirySubmitting ? 'Sending...' : 'Send Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Claim Business Form */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900">Claim Profile: {business.name}</h3>
            <p className="text-xs text-neutral-500">
              Submit proof of business management or ownership. Claims are authenticated via trade license / GST verification.
            </p>

            <form onSubmit={handleSubmitClaim} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Applicant Name</label>
                  <input
                    type="text"
                    required
                    value={claimApplicant}
                    onChange={(e) => setClaimApplicant(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Official Mobile</label>
                  <input
                    type="tel"
                    required
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Your Business Role</label>
                  <input
                    type="text"
                    required
                    value={claimRole}
                    onChange={(e) => setClaimRole(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">GST or Trade License No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 23AAAAA0000A1Z5"
                    value={claimRegNum}
                    onChange={(e) => setClaimRegNum(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Verification Notes</label>
                <textarea
                  rows={3}
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder="Provide registration details or domain email for swift verification..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Owner Reply to Review */}
      {showReplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowReplyModal(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900">Reply as Business Owner</h3>
            <p className="text-xs text-neutral-500">
              Your response will be permanently visible under this customer review.
            </p>

            <div className="space-y-3 pt-2">
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank the customer or address their feedback professionally..."
                className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowReplyModal(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitReply(showReplyModal)}
                  disabled={replySubmitting || !replyText.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {replySubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Owner / Admin Edit Business */}
      {showEditModal && business && (
        <EditBusinessModal
          business={business}
          isOpen={showEditModal}
          categories={categoriesList}
          locations={locationsList}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            setBusiness((prev) => (prev ? { ...prev, ...updated } : updated));
            setShowEditModal(false);
            setLeadFeedback('Business details successfully updated!');
            setTimeout(() => setLeadFeedback(null), 3000);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
