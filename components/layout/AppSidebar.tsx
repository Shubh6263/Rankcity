'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useUserLocation } from '@/lib/location/context';
import { InstallAppButton } from '@/components/pwa/InstallAppButton';
import { SignInButton, Show, UserButton } from '@clerk/nextjs';
import {
  X,
  Home,
  Compass,
  TrendingUp,
  Layers,
  Heart,
  PlusCircle,
  Briefcase,
  Receipt,
  HelpCircle,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  User,
} from 'lucide-react';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLocationDrawer?: () => void;
}

export function AppSidebar({ isOpen, onClose, onOpenLocationDrawer }: AppSidebarProps) {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { city: userCity, area: userArea } = useUserLocation();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  if (!isOpen) return null;

  const menuSections = [
    {
      title: 'Discover',
      items: [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Explore Businesses', href: '/explore', icon: Compass },
        { label: 'Top Rankings', href: '/categories', icon: TrendingUp, badge: 'Hot' },
        { label: 'All 50+ Categories', href: '/categories', icon: Layers },
        { label: 'Saved Places', href: '/saved', icon: Heart },
      ],
    },
    {
      title: 'For Business',
      items: [
        { label: 'Add Your Business', href: '/add-business', icon: PlusCircle, highlight: true },
        { label: 'Merchant Dashboard', href: '/publisher', icon: Briefcase },
        { label: 'Pricing & Bid Plans', href: '/pricing', icon: Receipt },
        { label: 'How Rankings Work', href: '/how-it-works', icon: HelpCircle },
      ],
    },
    {
      title: 'Support & Info',
      items: [{ label: 'Contact & Support', href: '/contact', icon: Phone }],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="App Navigation Menu"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200"
    >
      <div className="relative w-80 max-w-[85vw] h-full bg-white text-neutral-900 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-300">
        {/* Top Header Card */}
        <div className="p-5 border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" onClick={onClose} className="flex items-center gap-2">
              <img
                src="/rankcity-logo.png"
                alt="RankCity"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Account Snippet */}
          <Show when="signed-in">
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
              <UserButton />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-neutral-900 truncate">
                  {currentUser?.name || 'Welcome'}
                </p>
                <p className="text-[10px] text-neutral-500 truncate">
                  {currentUser?.email || 'Logged In'}
                </p>
              </div>
            </div>
          </Show>
          <Show when="signed-out">
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-blue-950">Welcome to RankCity</p>
                <p className="text-[10px] text-blue-700/80">Sign in to save businesses & bid</p>
              </div>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Sign In
                </button>
              </SignInButton>
            </div>
          </Show>

          {/* Location Chip */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenLocationDrawer) onOpenLocationDrawer();
            }}
            className="w-full mt-3 flex items-center justify-between p-2.5 rounded-xl bg-neutral-100/80 hover:bg-neutral-200/70 transition-colors text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-neutral-800">
                City: {userCity}
              </span>
            </div>
            <span className="text-[10px] text-blue-600 font-bold">Change</span>
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-2">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-98 ${
                        item.highlight
                          ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                          : isActive
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-blue-600' : 'text-neutral-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Area with PWA Install Button */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/70 space-y-2">
          <InstallAppButton
            variant="outline"
            size="md"
            className="w-full justify-center bg-white border-neutral-200"
          />
          <div className="text-center pt-1">
            <p className="text-[10px] text-neutral-400">
              RankCity Progressive Web App • v1.1
            </p>
            <p className="text-[10px] text-neutral-400">
              Powered by <span className="font-semibold text-neutral-600 lowercase">webloft</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
