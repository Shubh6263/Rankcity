'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Gavel,
  Wallet,
  Users,
  BarChart3,
  Star,
  Tag,
  UserCheck,
  Settings,
  Bell,
  Receipt,
  FileCheck,
} from 'lucide-react';

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, unreadCount } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/publisher', icon: LayoutDashboard },
    { label: 'Business Profile', href: '/publisher/websites', icon: Building2 },
    { label: 'Campaigns', href: '/publisher/campaigns', icon: TrendingUp },
    { label: 'Bidding', href: '/publisher/bids', icon: Gavel },
    { label: 'Leads', href: '/publisher/leads', icon: Users },
    { label: 'Analytics', href: '/publisher/analytics', icon: BarChart3 },
    { label: 'Wallet', href: '/publisher/wallet', icon: Wallet },
    { label: 'Invoices & Tax', href: '/publisher/invoices', icon: Receipt },
    { label: 'Customer Reviews', href: '/publisher/reviews', icon: Star },
    { label: 'Verification', href: '/publisher/verification', icon: FileCheck },
    { label: 'Team Members', href: '/publisher/team', icon: UserCheck },
    { label: 'Settings', href: '/publisher/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <RoleSwitcherBar />

      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 h-16 sm:h-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group py-1">
            <img
              src="/rankcity-logo.png"
              alt="RankCity - Discover Local Businesses"
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-102"
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/publisher/notifications"
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600" />
              )}
            </Link>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                {(currentUser.companyName || currentUser.name || 'U').charAt(0)}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <span className="font-bold text-neutral-900 block leading-tight truncate max-w-[150px]">
                  {currentUser.companyName || currentUser.name || 'Merchant Account'}
                </span>
                <span className="text-[11px] text-neutral-400 block leading-tight capitalize">
                  {currentUser.role.replace('_', ' ').toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar matching Mockup */}
          <aside className="w-full md:w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-neutral-200 p-3 shadow-2xs">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Dashboard Viewport */}
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
