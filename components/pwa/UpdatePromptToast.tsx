'use client';

import React from 'react';
import { usePwa } from '@/lib/pwa/context';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export function UpdatePromptToast() {
  const { isUpdateAvailable, isUpdateDismissed, applyUpdate, dismissUpdateToast } = usePwa();

  if (!isUpdateAvailable || isUpdateDismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="bg-neutral-900/95 text-white backdrop-blur-md border border-neutral-700/80 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white tracking-tight">
              App Update Available
            </p>
            <p className="text-[11px] text-neutral-300 truncate">
              A newer version of RankCity is ready.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={applyUpdate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload
          </button>
          <button
            onClick={dismissUpdateToast}
            aria-label="Dismiss update notification"
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
