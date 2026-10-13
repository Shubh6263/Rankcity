'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/auth/context';
import { Business, Review } from '@/types';
import {
  User,
  Heart,
  Star,
  Clock,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export default function CustomerAccountPage() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'saved' | 'reviews' | 'activity' | 'settings'>('profile');
  const [savedBusinesses, setSavedBusinesses] = useState<Business[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [recentViews, setRecentViews] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerData() {
      try {
        const userId = currentUser?.id || 'guest_user';
        const [favRes, bizRes, revRes] = await Promise.all([
          fetch(`/api/favorites?userId=${userId}`),
          fetch('/api/businesses'),
          fetch(`/api/reviews?userId=${userId}`),
        ]);

        if (favRes.ok) {
          const fData = await favRes.json();
          setSavedBusinesses(fData.businesses || []);
        }

        if (bizRes.ok) {
          const bData = await bizRes.json();
          const allBiz: Business[] = bData.businesses || [];
          // Curate recently viewed from businesses
          setRecentViews(allBiz.slice(0, 3));
        }

        if (revRes.ok) {
          const rData = await revRes.json();
          setMyReviews(rData.reviews || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomerData();
  }, [currentUser?.id]);

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'saved', label: 'Saved Businesses', icon: Heart, count: savedBusinesses.length },
    { id: 'reviews', label: 'My Reviews', icon: Star, count: myReviews.length },
    { id: 'activity', label: 'Recently Viewed', icon: Clock },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 pb-16 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* User Header Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">{currentUser.name}</h2>
                  <p className="text-xs text-neutral-500">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                    Verified Customer
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-2 shadow-sm space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-blue-500 text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-2 border-t border-neutral-100 mt-2 space-y-1">
                <Link
                  href="/contact"
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-neutral-400" />
                  <span>Help & Support</span>
                </Link>

                <Link
                  href="/publisher"
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Switch to Business Portal</span>
                </Link>

                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content Pane */}
          <section className="lg:col-span-3 space-y-6">
            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Personal Information</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Manage your local discovery profile and preferences.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Full Name</span>
                    <span className="text-sm font-semibold text-neutral-900">{currentUser.name}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Email Address</span>
                    <span className="text-sm font-semibold text-neutral-900">{currentUser.email}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Phone Number</span>
                    <span className="text-sm font-semibold text-neutral-900">{currentUser.phone || '+91 98260 00000'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Primary City</span>
                    <span className="text-sm font-semibold text-neutral-900">Indore, Madhya Pradesh</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">Looking to advertise your local business?</h4>
                      <p className="text-[11px] text-blue-700">Claim your verified business profile or create a sponsored campaign.</p>
                    </div>
                  </div>
                  <Link
                    href="/publisher"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold whitespace-nowrap transition-colors"
                  >
                    Open Business Portal
                  </Link>
                </div>
              </div>
            )}

            {/* Tab: Saved Businesses */}
            {activeTab === 'saved' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">Saved Businesses</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">Places and services you have bookmarked for quick access.</p>
                  </div>
                  <Link href="/saved" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                    View Full List →
                  </Link>
                </div>

                {savedBusinesses.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200 space-y-2">
                    <Heart className="w-8 h-8 text-neutral-300 mx-auto" />
                    <p className="text-xs text-neutral-500">You haven't bookmarked any businesses yet.</p>
                    <Link
                      href="/indore/hotels"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold mt-2"
                    >
                      Explore Top Businesses
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedBusinesses.map((biz) => (
                      <div
                        key={biz.id}
                        className="p-4 rounded-xl border border-neutral-200 hover:border-blue-300 hover:shadow-xs transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-neutral-900 hover:text-blue-600">
                              <Link href={`/business/${biz.slug}`}>{biz.name}</Link>
                            </h4>
                            <p className="text-xs text-neutral-500">{biz.locality}, {biz.city}</p>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {biz.rating}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-100 text-center">
                          <a
                            href={`tel:${biz.phone}`}
                            className="py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-[11px] font-semibold flex items-center justify-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-blue-600" />
                            <span>Call</span>
                          </a>
                          <a
                            href={`https://wa.me/${(biz.whatsapp || biz.phone).replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-[11px] font-semibold flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                          <Link
                            href={`/business/${biz.slug}`}
                            className="py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold flex items-center justify-center"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: My Reviews */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">My Community Reviews</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Ratings and feedback you have shared with local businesses.</p>
                </div>

                {myReviews.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200 space-y-2">
                    <Star className="w-8 h-8 text-neutral-300 mx-auto" />
                    <p className="text-xs text-neutral-500">You haven't written any reviews yet.</p>
                    <p className="text-[11px] text-neutral-400">Share your experiences to help other customers find great services.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-xl border border-neutral-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-neutral-900">{rev.businessName}</h4>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-neutral-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-neutral-700 leading-relaxed font-normal">{rev.comment}</p>
                        {rev.reply && (
                          <div className="p-3 rounded-lg bg-neutral-50 border-l-2 border-blue-500 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase">
                              Response from {rev.reply.authorName}
                            </span>
                            <p className="text-neutral-700">{rev.reply.text}</p>
                          </div>
                        )}
                        <span className="text-[10px] text-neutral-400 block">
                          Posted on {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Recently Viewed */}
            {activeTab === 'activity' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Recently Viewed Places</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Quickly revisit businesses and services you checked recently.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recentViews.map((biz) => (
                    <div
                      key={biz.id}
                      className="p-4 rounded-xl border border-neutral-200 hover:border-blue-300 transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                          <Link href={`/business/${biz.slug}`}>{biz.name}</Link>
                        </h4>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{biz.locality}, {biz.city}</p>
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-1">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{biz.rating} ({biz.reviewCount})</span>
                        </div>
                      </div>

                      <Link
                        href={`/business/${biz.slug}`}
                        className="w-full py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 rounded-lg text-center text-xs font-semibold block transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Account Preferences</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Control notifications and privacy settings.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Review Response Notifications</h4>
                      <p className="text-[11px] text-neutral-500">Get notified when a business replies to your review.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Location-based Suggestions</h4>
                      <p className="text-[11px] text-neutral-500">Show top-rated businesses around your selected city.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
