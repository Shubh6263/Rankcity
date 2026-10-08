'use client';

import React from 'react';

interface BusinessCardSkeletonProps {
  variant?: 'grid' | 'list';
}

export function BusinessCardSkeleton({ variant = 'grid' }: BusinessCardSkeletonProps) {
  const isList = variant === 'list';

  return (
    <div
      className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs animate-pulse flex ${
        isList ? 'flex-col sm:flex-row items-stretch' : 'flex-col'
      }`}
    >
      {/* Image Skeleton */}
      <div
        className={`bg-neutral-200 shrink-0 relative ${
          isList ? 'w-full sm:w-60 md:w-64 min-h-[170px]' : 'w-full h-44 sm:h-48'
        }`}
      >
        <div className="absolute top-2.5 left-2.5 w-24 h-5 rounded-md bg-neutral-300" />
        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-neutral-300" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 sm:p-4.5 flex-1 min-w-0 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          {/* Title & Badge */}
          <div className="flex items-center justify-between gap-3">
            <div className="h-5 bg-neutral-200 rounded-md w-3/5" />
            <div className="h-4 bg-neutral-200 rounded-md w-16 shrink-0" />
          </div>

          {/* Rating & Location */}
          <div className="flex items-center gap-2">
            <div className="h-4 bg-neutral-200 rounded-md w-12" />
            <div className="h-4 bg-neutral-200 rounded-md w-16" />
            <div className="h-4 bg-neutral-200 rounded-md w-28" />
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="h-4 bg-neutral-200 rounded-md w-20" />
            <div className="h-4 bg-neutral-200 rounded-md w-24" />
            <div className="h-4 bg-neutral-200 rounded-md w-16" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="pt-2.5 border-t border-neutral-100 grid grid-cols-4 gap-1.5">
          <div className="h-7 bg-neutral-200 rounded-xl" />
          <div className="h-7 bg-neutral-200 rounded-xl" />
          <div className="h-7 bg-neutral-200 rounded-xl" />
          <div className="h-7 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BusinessListSkeleton({ count = 4, variant = 'grid' }: { count?: number; variant?: 'grid' | 'list' }) {
  return (
    <div className={variant === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
      {Array.from({ length: count }).map((_, idx) => (
        <BusinessCardSkeleton key={idx} variant={variant} />
      ))}
    </div>
  );
}

export function DashboardCardSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 animate-pulse"
        >
          <div className="space-y-2.5 max-w-xl w-full">
            <div className="flex items-center gap-2.5">
              <div className="h-5 bg-neutral-200 rounded-md w-48" />
              <div className="h-4 bg-neutral-200 rounded-md w-16" />
            </div>
            <div className="h-3.5 bg-neutral-200 rounded-md w-64" />
            <div className="h-3 bg-neutral-200 rounded-md w-full" />
            <div className="flex gap-4 pt-1">
              <div className="h-3 bg-neutral-200 rounded-md w-24" />
              <div className="h-3 bg-neutral-200 rounded-md w-16" />
              <div className="h-3 bg-neutral-200 rounded-md w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-24 bg-neutral-200 rounded-lg" />
            <div className="h-9 w-24 bg-neutral-200 rounded-lg" />
            <div className="h-9 w-28 bg-neutral-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
