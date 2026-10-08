'use client';

import { Business, Category, LocationHierarchy } from '@/types';

// In-memory module-level cache for instant 0ms access within the session
let memBusinesses: Business[] | null = null;
let memCategories: Category[] | null = null;
let memLocations: LocationHierarchy[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh TTL, with stale-while-revalidate

export function getCachedBusinesses(): Business[] | null {
  if (memBusinesses && memBusinesses.length > 0) {
    return memBusinesses;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('rankcity_cache_businesses');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memBusinesses = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function setCachedBusinesses(data: Business[]) {
  memBusinesses = data;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('rankcity_cache_businesses', JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

export function getCachedCategories(): { categories: Category[]; locations: LocationHierarchy[] } | null {
  if (memCategories && memCategories.length > 0) {
    return { categories: memCategories, locations: memLocations || [] };
  }
  if (typeof window !== 'undefined') {
    try {
      const rawCat = localStorage.getItem('rankcity_cache_categories');
      const rawLoc = localStorage.getItem('rankcity_cache_locations');
      if (rawCat) {
        const parsedCat = JSON.parse(rawCat);
        const parsedLoc = rawLoc ? JSON.parse(rawLoc) : [];
        if (Array.isArray(parsedCat) && parsedCat.length > 0) {
          memCategories = parsedCat;
          memLocations = parsedLoc;
          return { categories: parsedCat, locations: parsedLoc };
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function setCachedCategories(categories: Category[], locations: LocationHierarchy[]) {
  memCategories = categories;
  memLocations = locations;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('rankcity_cache_categories', JSON.stringify(categories));
      localStorage.setItem('rankcity_cache_locations', JSON.stringify(locations));
    } catch {
      // ignore
    }
  }
}

/**
 * Optimizes remote Unsplash image URLs to small thumbnails for instant loading.
 * Unsplash supports dynamic image resizing: &w=400&q=65&auto=format
 */
export function getOptimizedImageUrl(
  url?: string | null,
  categoryId?: string,
  width: number = 380,
  quality: number = 65
): string {
  if (!url) {
    // Return fast category-specific defaults
    switch (categoryId) {
      case 'cat_healthcare':
        return `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=${width}&q=${quality}`;
      case 'cat_dining':
        return `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=${width}&q=${quality}`;
      case 'cat_hospitality':
        return `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=${width}&q=${quality}`;
      case 'cat_shopping':
      case 'cat_electronics':
        return `https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=${width}&q=${quality}`;
      case 'cat_beauty_wellness':
        return `https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=${width}&q=${quality}`;
      case 'cat_gyms_fitness':
        return `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=${width}&q=${quality}`;
      default:
        return `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=${width}&q=${quality}`;
    }
  }

  // If it's an Unsplash URL, ensure it is compressed and right-sized
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', String(quality));
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      return u.toString();
    } catch {
      return url;
    }
  }

  return url;
}
