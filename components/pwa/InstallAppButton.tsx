'use client';

import React from 'react';
import { usePwa } from '@/lib/pwa/context';
import { Download, Check } from 'lucide-react';

interface InstallAppButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showIfInstalled?: boolean;
}

export function InstallAppButton({
  className = '',
  variant = 'outline',
  size = 'sm',
  showIfInstalled = false,
}: InstallAppButtonProps) {
  const { isInstallable, isInstalled, promptInstall } = usePwa();

  if (isInstalled && !showIfInstalled) {
    return null;
  }

  if (isInstalled && showIfInstalled) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 ${className}`}
      >
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        App Installed
      </span>
    );
  }

  if (!isInstallable) {
    return null;
  }

  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-xl cursor-pointer active:scale-98';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
    secondary: 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs',
    outline:
      'border border-neutral-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 text-neutral-800 hover:text-blue-600 shadow-2xs',
    ghost: 'text-neutral-600 hover:text-blue-600 hover:bg-blue-50/50',
  }[variant];

  return (
    <button
      onClick={() => promptInstall()}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      title="Install RankCity as a Progressive Web App"
      aria-label="Install RankCity App"
    >
      <Download className="w-3.5 h-3.5 text-blue-600" />
      <span>Install App</span>
    </button>
  );
}
