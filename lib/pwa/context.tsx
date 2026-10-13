'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// BeforeInstallPromptEvent type interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  isBannerDismissed: boolean;
  isUpdateDismissed: boolean;
  showIosGuide: boolean;
  setShowIosGuide: (show: boolean) => void;
  promptInstall: () => Promise<boolean>;
  applyUpdate: () => void;
  dismissInstallBanner: () => void;
  dismissUpdateToast: () => void;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

const DISMISS_TIMEOUT_MS = 3 * 24 * 60 * 60 * 1000; // 3 days snooze

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [isUpdateDismissed, setIsUpdateDismissed] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(true); // start true to prevent flash
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  // Check standalone mode (already installed or launched as PWA)
  const checkInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const isStandaloneMatch = window.matchMedia('(display-mode: standalone)').matches;
    const isNavStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
    const hasPwaParam =
      window.location.search.includes('source=pwa') ||
      window.location.search.includes('source=pwa_shortcut') ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches;
    return isStandaloneMatch || isNavStandalone || hasPwaParam;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check online status
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if installed/PWA mode and tag html element for styling
    const installed = checkInstalled();
    setIsInstalled(installed);
    if (installed) {
      document.documentElement.classList.add('pwa-mode');
    } else {
      document.documentElement.classList.remove('pwa-mode');
    }

    // Listen for display mode changes (e.g. user opens standalone window)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches || checkInstalled());
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayChange);
    }

    // Check iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice =
      /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // Check banner dismiss status from sessionStorage (session snooze)
    try {
      const isSessionDismissed = sessionStorage.getItem('rankcity_pwa_install_dismissed');
      if (isSessionDismissed) {
        setIsBannerDismissed(true);
      } else {
        const dismissedAt = localStorage.getItem('rankcity_pwa_install_dismissed');
        if (dismissedAt) {
          const timeDiff = Date.now() - parseInt(dismissedAt, 10);
          setIsBannerDismissed(timeDiff < 2 * 60 * 60 * 1000); // 2 hours snooze
        } else {
          setIsBannerDismissed(false);
        }
      }
    } catch {
      setIsBannerDismissed(false);
    }

    // Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // App installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsBannerDismissed(true);
      try {
        localStorage.setItem('rankcity_pwa_installed', 'true');
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register Service Worker in production or dev
    let controllerChangeHandler: (() => void) | null = null;

    if ('serviceWorker' in navigator) {
      const registerServiceWorker = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            // Check for updates
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setIsUpdateAvailable(true);
                    setWaitingWorker(newWorker);
                  }
                });
              }
            });

            // If a worker is already waiting
            if (reg.waiting) {
              setIsUpdateAvailable(true);
              setWaitingWorker(reg.waiting);
            }
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });

        // Controller change listener
        let refreshing = false;
        controllerChangeHandler = () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        };
        navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);
      };

      // Handle race condition: if page load already finished before hydration, register immediately
      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker, { once: true });
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayChange);
      }
      if (controllerChangeHandler && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      }
    };
  }, [checkInstalled]);

  // Prompt install function
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          setIsBannerDismissed(true);
          return true;
        }
        return false;
      } catch (err) {
        console.error('[PWA] Error calling prompt():', err);
        setShowIosGuide(true);
        return false;
      }
    } else if (!isInstalled) {
      // If native beforeinstallprompt is not available, show step-by-step install guide
      setShowIosGuide(true);
      return false;
    }
    return false;
  }, [deferredPrompt, isInstalled]);

  // Apply service worker update
  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      // Fallback reload if controllerchange event does not trigger within 1s
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      window.location.reload();
    }
  }, [waitingWorker]);

  // Dismiss install banner
  const dismissInstallBanner = useCallback(() => {
    setIsBannerDismissed(true);
    try {
      sessionStorage.setItem('rankcity_pwa_install_dismissed', 'true');
      localStorage.setItem('rankcity_pwa_install_dismissed', Date.now().toString());
    } catch {
      // ignore
    }
  }, []);

  // Dismiss update toast
  const dismissUpdateToast = useCallback(() => {
    setIsUpdateDismissed(true);
  }, []);

  return (
    <PwaContext.Provider
      value={{
        isInstallable: !isInstalled,
        isInstalled,
        isIos,
        isOnline,
        isUpdateAvailable,
        isBannerDismissed,
        isUpdateDismissed,
        showIosGuide,
        setShowIosGuide,
        promptInstall,
        applyUpdate,
        dismissInstallBanner,
        dismissUpdateToast,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa(): PwaContextType {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
}
