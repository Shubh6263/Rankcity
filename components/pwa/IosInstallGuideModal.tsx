'use client';

import React, { useEffect } from 'react';
import { usePwa } from '@/lib/pwa/context';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';

export function IosInstallGuideModal() {
  const { showIosGuide, setShowIosGuide, isIos } = usePwa();

  // Close on Escape key press
  useEffect(() => {
    if (!showIosGuide) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowIosGuide(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIosGuide, setShowIosGuide]);

  if (!showIosGuide) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowIosGuide(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-100 text-neutral-900 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center shadow-2xs p-1">
              <img
                src="/icons/icon-96x96.png"
                alt="RankCity"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h3 id="ios-install-title" className="text-base font-bold text-neutral-900 tracking-tight">
                {isIos ? 'Install RankCity on iOS' : 'Install RankCity App'}
              </h3>
              <p className="text-xs text-neutral-500">
                {isIos ? 'Apple iPhone & iPad Safari' : 'Chrome, Edge & Android'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowIosGuide(false)}
            aria-label="Close install guide"
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-600 mb-5 leading-relaxed">
          {isIos
            ? 'To install RankCity as a native app on iOS, follow these 3 quick steps in Safari:'
            : 'To install RankCity directly to your device home screen, follow these quick steps:'}
        </p>

        {isIos ? (
          <div className="space-y-3.5 mb-6">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Share className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                1. Tap the <span className="text-blue-600 font-bold">Share</span> button at the bottom of Safari.
              </p>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <PlusSquare className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                2. Scroll down and tap <span className="font-bold">Add to Home Screen</span>.
              </p>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                3. Tap <span className="font-bold">Add</span> in the top-right corner to finish.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 mb-6">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <span className="font-black text-sm">⋮</span>
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                1. Tap your browser menu <span className="text-blue-600 font-bold">(⋮)</span> in the top-right corner.
              </p>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <PlusSquare className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                2. Tap <span className="font-bold">Install app</span> or <span className="font-bold">Add to Home screen</span>.
              </p>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                3. Confirm and enjoy instant offline access from your app launcher!
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowIosGuide(false)}
          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
