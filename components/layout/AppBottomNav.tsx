'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, TrendingUp, Heart, User, Sparkles } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isCenter?: boolean;
}

export function AppBottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
    },
    {
      label: 'Explore',
      href: '/explore',
      icon: Compass,
    },
    {
      label: 'Rankings',
      href: '/categories',
      icon: TrendingUp,
      isCenter: true,
    },
    {
      label: 'Saved',
      href: '/saved',
      icon: Heart,
    },
    {
      label: 'Account',
      href: '/profile',
      icon: User,
    },
  ];

  const checkIsActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      aria-label="Mobile Navigation Dock"
      className="lg:hidden fixed bottom-3 left-3 right-3 sm:left-auto sm:right-1/2 sm:translate-x-1/2 sm:w-[420px] z-40 pointer-events-none"
    >
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-full px-2 py-1.5 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.06)] ring-1 ring-black/5 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = checkIsActive(item.href);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative -top-3.5 flex flex-col items-center group active:scale-90 transition-transform duration-150"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border-3 border-white ${
                    isActive
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/40 ring-2 ring-blue-500/30'
                      : 'bg-gradient-to-tr from-blue-600 to-blue-700 text-white shadow-blue-600/30 hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-neutral-800 tracking-tight mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-9 h-7 rounded-full transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-neutral-500'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-blue-600" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
