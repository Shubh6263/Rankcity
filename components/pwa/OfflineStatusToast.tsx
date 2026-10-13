'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePwa } from '@/lib/pwa/context';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineStatusToast() {
  const { isOnline } = usePwa();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      setShowReconnected(false);
    } else if (wasOffline.current && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        wasOffline.current = false;
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none"
    >
      <div
        className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md ${
          !isOnline
            ? 'bg-neutral-900/90 text-white border border-neutral-700/60 shadow-black/20'
            : 'bg-emerald-600/95 text-white border border-emerald-500/60 shadow-emerald-900/20'
        }`}
      >
        {!isOnline ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>You are offline • Showing cached content</span>
          </>
        ) : (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-200" />
            <span>Back online • Rankings synced</span>
          </>
        )}
      </div>
    </div>
  );
}
