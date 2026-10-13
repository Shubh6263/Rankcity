'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCheck, Sparkles, MapPin, ShieldCheck, Flame, Trash2 } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'welcome' | 'ranking' | 'verified' | 'nearby';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'RankCity PWA Ready Offline',
    message: 'RankCity is installed on your device. You can explore businesses and cached listings even when offline!',
    time: 'Just now',
    read: false,
    type: 'welcome',
  },
  {
    id: '2',
    title: 'Top Spots in Indore',
    message: 'Explore newly ranked and verified restaurants, cafes, and rooftop lounges in Vijay Nagar & Palasia.',
    time: '2 hours ago',
    read: false,
    type: 'ranking',
  },
  {
    id: '3',
    title: '100+ Verified Businesses',
    message: 'Look for the green shield badge to discover trusted, phone-verified local businesses.',
    time: '1 day ago',
    read: true,
    type: 'verified',
  },
];

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Hydrate persisted notifications from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rankcity_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Persist notifications state
  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      localStorage.setItem('rankcity_notifications', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

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

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'welcome':
        return <Sparkles className="w-4 h-4 text-blue-600" />;
      case 'ranking':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'verified':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <MapPin className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notification Center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
    >
      <div className="relative w-84 sm:w-96 max-w-[90vw] h-full bg-white text-neutral-900 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-neutral-500">Updates, rankings & verified spots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="px-5 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-xs">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold disabled:text-neutral-400 cursor-pointer disabled:cursor-default"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <Bell className="w-10 h-10 mb-2 stroke-1 text-neutral-300" />
              <p className="text-xs font-semibold text-neutral-600">No notifications</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                You are all caught up! New ranking alerts will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  !item.read
                    ? 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/70 shadow-2xs'
                    : 'bg-white border-neutral-100 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-neutral-100 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-neutral-400 mt-1 block font-medium">
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-100 text-center bg-neutral-50">
          <p className="text-[10px] text-neutral-400">
            RankCity Notification Center • Powered by webloft
          </p>
        </div>
      </div>
    </div>
  );
}
