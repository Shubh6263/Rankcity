'use client';

import React from 'react';
import Link from 'next/link';
import { Business } from '@/types';
import {
  Phone,
  MessageCircle,
  Navigation,
  Star,
  Heart,
  ChevronRight,
  ShieldCheck,
  Clock,
  MapPin,
  Globe,
  Mail,
  Eye,
  ChevronLeft,
} from 'lucide-react';

export function CustomPhoneIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-label="phone"
      viewBox="0 0 135 145"
      className={className}
    >
      <path d="M21.5 8.7C.6 19.6 1 52.2 22.5 84.6c7.1 10.6 22.7 27 33.5 35.2 9.1 6.8 25.5 15.3 33.2 17.1a42 42 0 0 0 21.8-.8c18.2-6.9 23-23.9 10.3-36.6a51 51 0 0 0-18.6-12.6c-4.6-1.2-10.6 1.1-15.1 6-1.7 1.7-3.8 3.1-4.8 3.1-9 0-36.8-29-36.8-38.3 0-2.4 1-4.2 4-7.1 4.6-4.5 5.4-6.8 4.8-13.6-1-9.8-11.2-25.6-18.5-28.6a20 20 0 0 0-14.8.3M35 15.5c5.5 2.9 13.1 16.4 13.2 23.6 0 3.3-.6 4.7-4.6 8.9S39 53.5 39 57.1c0 14.7 33.7 48.5 45.4 45.5 1.3-.3 4.4-2.2 6.8-4.1 7.4-6 8.3-6.2 13.5-3.5 9.6 5.1 17.3 14 17.3 20.1 0 6.6-7.8 13.8-17.2 15.9-12.8 2.7-30.9-5-50.9-21.6-26.8-22.3-44.6-56-40.8-77C15.7 18.1 25.4 10.6 35 15.5"></path>
    </svg>
  );
}

export function CustomNavigationIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-label="navigation"
      viewBox="0 0 127 126"
      className={className}
    >
      <path d="M81 20.1 28.7 43.2c-17.2 7.5-21 9.6-21.8 11.6-2.6 6.7.5 7.7 28.6 9.7 13.2.9 24.1 1.8 24.3 2s1.3 10.6 2.3 23.2 2.1 23.8 2.4 25.1a6 6 0 0 0 3 3.4c5.2 2.3 6.5.5 16.5-22.3 5.1-11.8 15.3-34.9 22.7-51.4A275 275 0 0 0 120 11.4q0-5.5-4.9-5.3c-1.5 0-16.8 6.4-34.1 14m26.7 9.1L85.5 79.3A555 555 0 0 1 69.9 113c-.3 0-1.1-6.2-1.8-13.7-2.7-31.8-3.2-35.8-4.4-37-1.1-1.1-10.3-2-41-4-5.4-.3-10-.9-10.2-1.3-.4-.7 6.8-4 46-21.1L92 21.2c12.4-5.5 22.6-9.6 22.8-9.2s-3 8.2-7.1 17.2"></path>
    </svg>
  );
}

export function CustomWhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="whatsapp"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 31C23.732 31 30 24.732 30 17C30 9.26801 23.732 3 16 3C8.26801 3 2 9.26801 2 17C2 19.5109 2.661 21.8674 3.81847 23.905L2 31L9.31486 29.3038C11.3014 30.3854 13.5789 31 16 31ZM16 28.8462C22.5425 28.8462 27.8462 23.5425 27.8462 17C27.8462 10.4576 22.5425 5.15385 16 5.15385C9.45755 5.15385 4.15385 10.4576 4.15385 17C4.15385 19.5261 4.9445 21.8675 6.29184 23.7902L5.23077 27.7692L9.27993 26.7569C11.1894 28.0746 13.5046 28.8462 16 28.8462Z"
        fill="#BFC8D0"
      />
      <path
        d="M28 16C28 22.6274 22.6274 28 16 28C13.4722 28 11.1269 27.2184 9.19266 25.8837L5.09091 26.9091L6.16576 22.8784C4.80092 20.9307 4 18.5589 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z"
        fill="url(#whatsapp_card_grad)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 18.5109 2.661 20.8674 3.81847 22.905L2 30L9.31486 28.3038C11.3014 29.3854 13.5789 30 16 30ZM16 27.8462C22.5425 27.8462 27.8462 22.5425 27.8462 16C27.8462 9.45755 22.5425 4.15385 16 4.15385C9.45755 4.15385 4.15385 9.45755 4.15385 16C4.15385 18.5261 4.9445 20.8675 6.29184 22.7902L5.23077 26.7692L9.27993 25.7569C11.1894 27.0746 13.5046 27.8462 16 27.8462Z"
        fill="white"
      />
      <path
        d="M12.5 9.49989C12.1672 8.83131 11.6565 8.8905 11.1407 8.8905C10.2188 8.8905 8.78125 9.99478 8.78125 12.05C8.78125 13.7343 9.52345 15.578 12.0244 18.3361C14.438 20.9979 17.6094 22.3748 20.2422 22.3279C22.875 22.2811 23.4167 20.0154 23.4167 19.2503C23.4167 18.9112 23.2062 18.742 23.0613 18.696C22.1641 18.2654 20.5093 17.4631 20.1328 17.3124C19.7563 17.1617 19.5597 17.3656 19.4375 17.4765C19.0961 17.8018 18.4193 18.7608 18.1875 18.9765C17.9558 19.1922 17.6103 19.083 17.4665 19.0015C16.9374 18.7892 15.5029 18.1511 14.3595 17.0426C12.9453 15.6718 12.8623 15.2001 12.5959 14.7803C12.3828 14.4444 12.5392 14.2384 12.6172 14.1483C12.9219 13.7968 13.3426 13.254 13.5313 12.9843C13.7199 12.7145 13.5702 12.305 13.4803 12.05C13.0938 10.953 12.7663 10.0347 12.5 9.49989Z"
        fill="white"
      />
      <defs>
        <linearGradient id="whatsapp_card_grad" x1="26.5" y1="7" x2="4" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5BD066" />
          <stop offset="1" stopColor="#27B43E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

import { getOptimizedImageUrl } from '@/lib/cache/dataCache';

interface BusinessCardProps {
  business: Business;
  isSponsored?: boolean;
  sponsoredRank?: number; // 1, 2, 3...
  distanceKm?: number | null;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  onLeadAction?: (type: 'call' | 'whatsapp' | 'directions' | 'view', id: string) => void;
  variant?: 'grid' | 'list' | 'compact';
  isPriority?: boolean;
}

export function BusinessCard({
  business,
  isSponsored = false,
  sponsoredRank,
  distanceKm,
  isFavorite = false,
  onToggleFavorite,
  onLeadAction,
  variant = 'grid',
  isPriority = false,
}: BusinessCardProps) {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  const ignoreClickAfterSwipe = React.useRef(false);
  const rank = sponsoredRank || (isSponsored ? 1 : null);

  // 2-3 key decision-making services only
  const keyServices = (business.services && business.services.length > 0
    ? business.services
    : ['Verified Service', 'Top Quality']
  ).slice(0, 3);

  // Decision-making action URLs
  const phoneUrl = `tel:${business.phone}`;
  const cleanPhone = (business.whatsapp || business.phone).replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(business.name)}`;
  const directionsUrl =
    business.directionsUrl ||
    business.mapLink ||
    `https://maps.google.com/?q=${encodeURIComponent(`${business.name} ${business.address || ''} ${business.city}`)}`;

  const handleAction = (type: 'call' | 'whatsapp' | 'directions' | 'view') => {
    if (onLeadAction) {
      onLeadAction(type, business.id);
    } else {
      fetch(`/api/businesses/${business.id}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      }).catch(() => {});
    }
  };

  const coverImg = getOptimizedImageUrl(
    business.coverImage || business.logo,
    business.categoryId,
    400,
    65
  );
  const cardPhotoUrls = Array.from(new Set([
    business.coverImage || business.logo,
    ...(business.cardPhotos ?? business.photos ?? []),
  ].filter((photo): photo is string => Boolean(photo))));
  const carouselPhotos = cardPhotoUrls.length > 0 ? cardPhotoUrls : [coverImg];
  const activePhotoIndex = currentPhotoIndex % carouselPhotos.length;
  const showPhoto = (index: number) => {
    setImgLoaded(false);
    setCurrentPhotoIndex((index + carouselPhotos.length) % carouselPhotos.length);
  };
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStart.current || carouselPhotos.length < 2) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    showPhoto(activePhotoIndex + (deltaX < 0 ? 1 : -1));
    ignoreClickAfterSwipe.current = true;
    window.setTimeout(() => {
      ignoreClickAfterSwipe.current = false;
    }, 500);
  };

  const isList = variant === 'list';
  const shouldPrioritize = isPriority || (isSponsored && (rank === 1 || rank === 2));

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`bg-white rounded-2xl transition-all duration-200 overflow-hidden group relative flex ${
        isList ? 'flex-col sm:flex-row items-stretch' : 'flex-col'
      } ${
        isSponsored
          ? 'border-2 border-amber-300/90 hover:border-amber-400 shadow-sm hover:shadow-md'
          : 'border border-neutral-200 hover:border-neutral-300 shadow-2xs hover:shadow-sm'
      }`}
    >
      <Link
        href={`/business/${business.slug}`}
        onClick={(event) => {
          if (ignoreClickAfterSwipe.current) {
            event.preventDefault();
            ignoreClickAfterSwipe.current = false;
            return;
          }
          handleAction('view');
        }}
        aria-label={`View profile of ${business.name}`}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      />

      {/* Photo Container - Well balanced aspect ratio */}
      <div
        className={`relative overflow-hidden bg-neutral-100 shrink-0 pointer-events-none ${
          isList
            ? 'w-full sm:w-60 md:w-64 sm:min-h-[170px]'
            : 'w-full h-44 sm:h-48'
        }`}
      >
        {/* Placeholder shimmer while image is loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-neutral-200/60 animate-pulse" />
        )}
        <img
          src={getOptimizedImageUrl(carouselPhotos[activePhotoIndex], business.categoryId, 400, 65)}
          key={carouselPhotos[activePhotoIndex]}
          alt={business.name}
          loading={shouldPrioritize ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {carouselPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => showPhoto(activePhotoIndex - 1)}
              aria-label="Previous business photo"
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white shadow-sm transition-colors hover:bg-black/75 pointer-events-auto"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => showPhoto(activePhotoIndex + 1)}
              aria-label="Next business photo"
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white shadow-sm transition-colors hover:bg-black/75 pointer-events-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 pointer-events-auto">
              {carouselPhotos.map((photo, index) => (
                <button
                  key={`${index}-${photo}`}
                  type="button"
                  onClick={() => showPhoto(index)}
                  aria-label={`Show photo ${index + 1} of ${carouselPhotos.length}`}
                  aria-current={index === activePhotoIndex ? 'true' : undefined}
                  className={`h-1.5 rounded-full shadow-sm transition-all ${
                    index === activePhotoIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/65 hover:bg-white'
                  } pointer-events-auto`}
                />
              ))}
            </div>
          </>
        )}

        {/* Sponsored Label Banner */}
        {isSponsored && rank && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                rank === 1
                  ? 'bg-amber-500 text-neutral-950 font-black ring-1 ring-amber-400'
                  : rank === 2
                  ? 'bg-slate-700 text-white'
                  : rank === 3
                  ? 'bg-amber-700 text-white'
                  : 'bg-neutral-800 text-neutral-100'
              }`}
            >
              <span>🟠 SPONSORED #{rank}</span>
            </span>
          </div>
        )}

        {/* Favorite Bookmark Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite?.(business.id, e);
          }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer shadow-xs text-neutral-500 hover:text-neutral-900 z-10 pointer-events-auto"
          aria-label="Save to bookmarks"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'
            }`}
          />
        </button>

        {/* Quick Price Range / Status pill */}
        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5">
          {business.priceRange && (
            <span className="px-2 py-0.5 rounded-md bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
              {business.priceRange}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            <span>Open</span>
          </span>
        </div>
      </div>

      {/* Content Section: Customer Decision-Making Information */}
      <div className="p-4 sm:p-4.5 flex-1 min-w-0 flex flex-col justify-between space-y-2.5 pointer-events-none">
        <div>
          {/* Header Row: Name & Verified badge */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/business/${business.slug}`}
              onClick={() => handleAction('view')}
              className="relative z-10 pointer-events-auto text-base font-bold text-neutral-900 group-hover:text-blue-600 transition-colors truncate block flex-1"
            >
              {business.name}
            </Link>

            {business.isVerified && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Subheader Row: Star Rating, Reviews & Location inline */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-xs">
            <div className="flex items-center gap-1 font-bold text-neutral-900 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{business.rating ? Number(business.rating).toFixed(1) : '4.8'}</span>
            </div>
            <span className="text-neutral-500 text-[11px] shrink-0">
              ({business.reviewCount || 0} reviews)
            </span>

            <span className="text-neutral-300 hidden sm:inline">&bull;</span>

            {/* Location & Distance */}
            <div className="flex items-center gap-1 text-neutral-600 text-[11px] truncate min-w-0">
              <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
              <span className="truncate">
                {business.locality || 'City Center'}, {business.city || 'Indore'}
              </span>
              {distanceKm !== undefined && distanceKm !== null && (
                <span className="font-semibold text-blue-700 shrink-0">
                  &bull; {distanceKm.toFixed(1)} km
                </span>
              )}
            </div>
          </div>

          {/* Direct Contact Indicators with Icons */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-600 pt-0.5">
            {business.phone && (
              <a
                href={phoneUrl}
                onClick={() => handleAction('call')}
                className="relative z-10 pointer-events-auto inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors font-semibold"
              >
                <CustomPhoneIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{business.phone}</span>
              </a>
            )}

            {business.whatsapp && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleAction('whatsapp')}
                className="relative z-10 pointer-events-auto inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 transition-colors font-semibold"
              >
                <CustomWhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                <span>WhatsApp</span>
              </a>
            )}

            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 pointer-events-auto inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 transition-colors"
                title={business.website}
              >
                <Globe className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate max-w-[120px]">{business.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
          </div>

          {/* Key Services & Working Hours */}
          <div className="flex items-center justify-between flex-wrap gap-1.5 mt-2">
            <div className="flex flex-wrap items-center gap-1">
              {keyServices.map((srv, sIdx) => (
                <span
                  key={sIdx}
                  className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-medium"
                >
                  {srv}
                </span>
              ))}
            </div>

            <div className="text-[10px] text-neutral-500 flex items-center gap-1 truncate">
              <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
              <span>{business.openingHours ? business.openingHours.slice(0, 24) : 'Open daily 9am–10pm'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Decision Actions: Well-proportioned 4-button grid with clear icons */}
        <div className="pt-2.5 border-t border-neutral-100 grid grid-cols-4 gap-1.5">
          {/* Call CTA - Icon Only as requested */}
          <a
            href={phoneUrl}
            onClick={() => handleAction('call')}
            className="relative z-10 pointer-events-auto py-2 px-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer text-center group/btn"
            title={`Call ${business.name}`}
            aria-label={`Call ${business.name}`}
          >
            <CustomPhoneIcon className="w-5 h-5 shrink-0 transition-transform group-hover/btn:scale-115" />
          </a>

          {/* WhatsApp CTA - Icon Only with user's custom SVG */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleAction('whatsapp')}
            className="relative z-10 pointer-events-auto py-2 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer text-center group/btn"
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
          >
            <CustomWhatsAppIcon className="w-5 h-5 shrink-0 transition-transform group-hover/btn:scale-115" />
          </a>

          {/* Directions CTA - Icon Only as requested */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleAction('directions')}
            className="relative z-10 pointer-events-auto py-2 px-1 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer text-center group/btn"
            title="Get Directions on Map"
            aria-label="Get Directions on Map"
          >
            <CustomNavigationIcon className="w-5 h-5 text-rose-600 shrink-0 transition-transform group-hover/btn:scale-115" />
          </a>

          {/* View Details Link - Icon Only */}
          <Link
            href={`/business/${business.slug}`}
            onClick={() => handleAction('view')}
            className="relative z-10 pointer-events-auto py-2 px-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition-colors cursor-pointer text-center group/btn"
            title="View Full Profile"
            aria-label={`View full profile of ${business.name}`}
          >
            <Eye className="w-5 h-5 text-neutral-600 shrink-0 transition-transform group-hover/btn:scale-115" />
          </Link>
        </div>
      </div>
    </div>
  );
}
