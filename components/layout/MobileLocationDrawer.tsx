'use client';

import React, { useEffect } from 'react';
import { useUserLocation } from '@/lib/location/context';
import { CITIES_DIRECTORY } from '@/lib/location/cities';
import { Navigation2, Loader2, MapPin, X, CheckCircle2 } from 'lucide-react';

interface MobileLocationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (cityName: string, slug: string) => void;
}

export function MobileLocationDrawer({
  isOpen,
  onClose,
  onSelectCity,
}: MobileLocationDrawerProps) {
  const {
    city: userCity,
    area: userArea,
    isLoading: isLocLoading,
    source: locSource,
    requestCurrentLocation,
  } = useUserLocation();

  const cities = CITIES_DIRECTORY.map((c) => ({
    name: c.name,
    slug: c.slug,
    badge: c.badge,
  }));

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select City and Location"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-neutral-100 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        {/* Drag Handle */}
        <div className="w-10 h-1.2 rounded-full bg-neutral-300 mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Select Your Location
              </h3>
              <p className="text-[11px] text-neutral-500">Discover businesses around you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close location drawer"
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Auto-detect Button */}
        <button
          type="button"
          disabled={isLocLoading}
          onClick={async () => {
            await requestCurrentLocation();
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/80 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer mb-4 active:scale-98"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            {isLocLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Navigation2 className="w-4 h-4 text-white fill-white" />
            )}
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="text-xs font-bold text-blue-900">
              {isLocLoading ? 'Detecting GPS...' : 'Use Current GPS Location'}
            </div>
            <div className="text-[11px] text-blue-700/80 font-normal truncate mt-0.5">
              {userArea ? `${userArea} (${userCity})` : 'Exact nearby local discovery'}
            </div>
          </div>
          {locSource === 'browser_gps' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
              Active
            </span>
          )}
        </button>

        {/* Manual City Options */}
        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
          Popular Cities
        </div>
        <div className="space-y-1.5">
          {cities.map((c) => {
            const isSelected = userCity.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => {
                  onSelectCity(c.name, c.slug);
                  onClose();
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors active:scale-98 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{c.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {c.badge}
                  </span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
