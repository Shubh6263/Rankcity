'use client';

import React from 'react';
import { usePwa } from '@/lib/pwa/context';
import { Download, X, Zap, Wifi, ShieldCheck } from 'lucide-react';

export function PwaInstallBanner() {
  const {
    isInstallable,
    isInstalled,
    isBannerDismissed,
    isUpdateAvailable,
    isUpdateDismissed,
    promptInstall,
    dismissInstallBanner,
  } = usePwa();

  // If already installed, banner dismissed, or an update prompt is actively showing, do not show banner
  if (
    !isInstallable ||
    isInstalled ||
    isBannerDismissed ||
    (isUpdateAvailable && !isUpdateDismissed)
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Install RankCity App"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.18)] ring-1 ring-black/5">
        <div className="flex items-start gap-3.5">
          {/* App Icon */}
          <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-0.5 shadow-sm flex items-center justify-center">
            <img
              src="/icons/icon-96x96.png"
              alt="RankCity App"
              className="w-full h-full object-contain rounded-[10px]"
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Install RankCity App
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">
                Fast & Offline
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
              Add to your home screen for instant local business search, real-time rankings, and offline access.
            </p>

            {/* Micro Feature Bullets */}
            <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-500 font-medium">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Instant launch
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-blue-500" /> Offline mode
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified
              </span>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={dismissInstallBanner}
            aria-label="Dismiss install banner"
            className="shrink-0 text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 mt-3.5 pt-3 border-t border-neutral-100">
          <button
            onClick={() => promptInstall()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Install App
          </button>
          <button
            onClick={dismissInstallBanner}
            className="px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Not Now
          </button>
        </div>
      </div>
    </aside>
  );
}
