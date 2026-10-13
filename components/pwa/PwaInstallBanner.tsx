'use client';

import React from 'react';
import { usePwa } from '@/lib/pwa/context';
import { X, Download } from 'lucide-react';

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

  // If already installed, banner dismissed, or an update prompt is actively showing, do not show
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
      aria-label="Install App"
      className="fixed bottom-20 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-84 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-2xl p-2.5 sm:p-3 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.14)] ring-1 ring-black/5 flex items-center justify-between gap-3">
        {/* App Icon */}
        <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 p-0.5 overflow-hidden shadow-2xs">
          <img
            src="/icons/icon-96x96.png"
            alt="RankCity"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-neutral-900 leading-tight">
            RankCity App
          </h4>
          <p className="text-[11px] text-neutral-500 truncate mt-0.5">
            Fast, offline & light
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => promptInstall()}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </button>
          <button
            onClick={dismissInstallBanner}
            aria-label="Dismiss"
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
