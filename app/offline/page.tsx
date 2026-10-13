'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, RotateCcw, Home, Compass, CheckCircle2, Sparkles } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    document.title = 'Offline | RankCity';
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : false);

    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    if (typeof window !== 'undefined') {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setTimeout(() => {
          setRetrying(false);
        }, 1200);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
      {/* Icon Badge */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner border border-blue-100">
          {isOnline ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
          ) : (
            <WifiOff className="w-10 h-10 text-blue-600" />
          )}
        </div>
        <span
          className={`absolute -top-1 -right-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isOnline
              ? 'bg-emerald-500 text-white shadow-emerald-200'
              : 'bg-amber-500 text-white shadow-amber-200'
          } shadow`}
        >
          {isOnline ? 'Back Online' : 'Offline Mode'}
        </span>
      </div>

      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-3">
        {isOnline ? 'Connection Restored!' : 'You Are Currently Offline'}
      </h1>

      {/* Description */}
      <p className="text-sm sm:text-base text-neutral-600 max-w-md mb-8 leading-relaxed">
        {isOnline
          ? 'Your internet connection is back. Reload the page to view the latest real-time business rankings and live auctions.'
          : "RankCity is designed with offline resilience. While disconnected, you can still view pre-cached pages and any businesses you previously visited."}
      </p>

      {/* Primary Action Button */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm mb-10">
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 cursor-pointer"
        >
          <RotateCcw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Checking Network...' : isOnline ? 'Reload Page' : 'Retry Connection'}
        </button>
      </div>

      {/* Offline Available Section */}
      <div className="w-full bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Available While Offline
          </span>
          <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
            PWA Cached
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-neutral-200 hover:border-blue-300 hover:shadow-xs transition-all text-xs font-semibold text-neutral-800"
          >
            <Home className="w-4 h-4 text-blue-600" />
            <div>
              <div className="font-bold">Home Page</div>
              <div className="text-[10px] text-neutral-500 font-normal">Pre-cached application shell</div>
            </div>
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-neutral-200 hover:border-blue-300 hover:shadow-xs transition-all text-xs font-semibold text-neutral-800"
          >
            <Compass className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="font-bold">Explore Directory</div>
              <div className="text-[10px] text-neutral-500 font-normal">Top categories and city directory</div>
            </div>
          </Link>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-200/60 flex items-start gap-2 text-[11px] text-neutral-500">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <span>Any business profile or ranking list you opened earlier is preserved in your local browser cache.</span>
        </div>
      </div>

      <p className="mt-8 text-xs text-neutral-400">
        Tip: Install the RankCity app to your home screen for seamless instant access anytime.
      </p>
    </div>
  );
}
