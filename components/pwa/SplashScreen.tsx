'use client';

import React, { useState, useEffect } from 'react';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Only show on fresh launch / reload in this tab session
    const hasShown = sessionStorage.getItem('rankcity_splash_shown');
    if (hasShown) {
      setIsVisible(false);
      return;
    }

    // Display splash screen, then initiate smooth fade out
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1300);

    // Remove from DOM after fade out completes
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      try {
        sessionStorage.setItem('rankcity_splash_shown', 'true');
      } catch {
        // ignore
      }
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-between px-6 py-10 sm:py-12 select-none transition-opacity duration-500 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer for vertical balance */}
      <div className="w-full h-8" />

      {/* Center: Logo + Tagline */}
      <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        <img
          src="/rankcity-logo.png"
          alt="RankCity"
          className="h-12 sm:h-14 md:h-16 w-auto object-contain drop-shadow-2xs"
        />
        <p className="text-xs sm:text-sm font-medium text-neutral-500 tracking-wide mt-2">
          Discover the Best Businesses in Your City
        </p>
      </div>

      {/* Bottom: Powered by webloft */}
      <div className="w-full text-center pb-2">
        <p className="text-xs text-neutral-400 font-medium tracking-wide">
          Powered by <span className="font-semibold text-neutral-600">webloft</span>
        </p>
      </div>
    </div>
  );
}
