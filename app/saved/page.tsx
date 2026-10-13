'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { useAuth } from '@/lib/auth/context';
import { Business } from '@/types';
import {
  Bookmark,
  Star,
  Phone,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Trash2,
  MapPin,
  ExternalLink,
  HeartCrack,
} from 'lucide-react';

export default function SavedBusinessesPage() {
  const { currentUser } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const userId = currentUser?.id || 'guest_user';
      const res = await fetch(`/api/favorites?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.businesses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [currentUser?.id]);

  const handleRemove = async (businessId: string) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, businessId }),
      });
      if (res.ok) {
        setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeadAction = async (businessId: string, type: 'call' | 'whatsapp' | 'directions') => {
    try {
      await fetch(`/api/businesses/${businessId}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-blue-600 fill-blue-600" />
              <h1 className="text-2xl font-black text-neutral-900">Saved Businesses</h1>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Your bookmarked local services, hotels, clinics, and restaurants for fast access.
            </p>
          </div>
          <div className="text-xs font-semibold text-neutral-600 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs">
            Saved Listings: <strong className="text-neutral-900">{businesses.length}</strong>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-neutral-400">Loading your saved businesses...</div>
        ) : businesses.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-neutral-200 p-8 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Bookmark className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">No saved businesses yet</h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              When you explore businesses, tap the bookmark icon on any card or business profile to quickly save them here.
            </p>
            <Link
              href="/explore"
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Explore Local Directory
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => {
              const mapQuery = encodeURIComponent(`${biz.name} ${biz.address}`);
              return (
                <div
                  key={biz.id}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 bg-neutral-100 overflow-hidden relative">
                      <img
                        src={biz.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                        alt={biz.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemove(biz.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-rose-600 hover:bg-rose-50 shadow-xs transition-colors cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/business/${biz.slug}`}
                          className="font-bold text-base text-neutral-900 hover:text-blue-600 line-clamp-1"
                        >
                          {biz.name}
                        </Link>
                        {biz.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {biz.rating}
                        </span>
                        <span>({biz.reviewCount} reviews)</span>
                        <span>·</span>
                        <span>{biz.locality || biz.city}</span>
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-2">{biz.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                      <a
                        href={`tel:${biz.phone}`}
                        onClick={() => handleLeadAction(biz.id, 'call')}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${(biz.whatsapp || biz.phone).replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLeadAction(biz.id, 'whatsapp')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${mapQuery}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLeadAction(biz.id, 'directions')}
                        className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-neutral-600"
                        title="Directions"
                      >
                        <Navigation className="w-4 h-4 text-rose-500" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
