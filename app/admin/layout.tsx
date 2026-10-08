'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Navbar } from '@/components/layout/Navbar';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import {
  LayoutDashboard,
  Globe,
  Tag,
  MapPin,
  TrendingUp,
  History,
  CreditCard,
  ShieldAlert,
  Settings,
  FileCheck,
  MessageSquare,
  Users,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const navItems = [
    { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Verification Queue', href: '/admin/verification', icon: FileCheck },
    { label: 'Review Moderation', href: '/admin/reviews', icon: MessageSquare },
    { label: 'Live Auctions', href: '/admin/auctions', icon: TrendingUp },
    { label: 'Business Directory', href: '/admin/websites', icon: Globe },
    { label: 'Users & RBAC', href: '/admin/users', icon: Users },
    { label: 'Payments & Ledger', href: '/admin/payments', icon: CreditCard },
    { label: 'Audit Logs', href: '/admin/audit', icon: History },
    { label: 'Anti-Fraud Monitor', href: '/admin/fraud', icon: ShieldAlert },
    { label: 'Categories & Min Bids', href: '/admin/categories', icon: Tag },
    { label: 'Global Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900">
      <RoleSwitcherBar />
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
              <div className="px-3 py-2 mb-2">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                  Root Controller
                </span>
                <span className="text-sm font-bold text-neutral-900 block truncate">
                  Admin Command
                </span>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-neutral-900 text-white font-semibold'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 mt-4 border-t border-neutral-100 px-3 text-[11px] text-neutral-400">
                <span>Access: {currentUser.role}</span>
              </div>
            </div>
          </aside>

          {/* Main Viewport */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
