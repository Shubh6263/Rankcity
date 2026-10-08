'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface UserLocationState {
  coords: UserCoords | null;
  city: string; // User's real detected city/town e.g. "Indore", "Ujjain", "Dewas", "Jabalpur", etc.
  area: string; // Specific locality or neighborhood
  state: string; // State name
  source: 'browser_gps' | 'manual';
  isLoading: boolean;
  error: string | null;
  requestCurrentLocation: () => Promise<void>;
  setManualCity: (cityName: string) => void;
}

/**
 * Calculates straight line distance in km between two lat/lng coordinates (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place e.g. 1.4 km
}

const LocationContext = createContext<UserLocationState | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [city, setCity] = useState<string>('Indore');
  const [area, setArea] = useState<string>('All Localities');
  const [state, setState] = useState<string>('Madhya Pradesh');
  const [source, setSource] = useState<'browser_gps' | 'manual'>('manual');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Restore cached location from localStorage on initial render
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const cached = localStorage.getItem('rankcity_user_location');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.city) setCity(parsed.city);
        if (parsed.area) setArea(parsed.area);
        if (parsed.state) setState(parsed.state);
        if (parsed.coords) setCoords(parsed.coords);
        if (parsed.source) setSource(parsed.source);
      }
    } catch {
      // ignore
    }
  }, []);

  /**
   * Accurate GPS Geolocation using browser device sensors (GPS/Cell/WiFi)
   * Followed by precise reverse geocoding via OpenStreetMap BigData
   */
  const requestCurrentLocation = async (): Promise<void> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setCoords({ latitude, longitude, accuracy });
          setSource('browser_gps');

          try {
            // High-accuracy reverse geocoding from exact GPS coordinates
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en',
                  'User-Agent': 'RankCityApp/1.0',
                },
                signal: AbortSignal.timeout(6000),
              }
            );

            if (geoRes.ok) {
              const geoData = await geoRes.json();
              const addr = geoData.address || {};

              // Extract actual city / town / district accurately
              const detectedCity =
                addr.city ||
                addr.town ||
                addr.city_district ||
                addr.municipality ||
                addr.county ||
                addr.state_district ||
                'Indore';

              const detectedArea =
                addr.suburb ||
                addr.neighbourhood ||
                addr.residential ||
                addr.village ||
                addr.road ||
                'Near You';

              const detectedState = addr.state || 'Madhya Pradesh';

              setCity(detectedCity);
              setArea(detectedArea);
              setState(detectedState);

              localStorage.setItem(
                'rankcity_user_location',
                JSON.stringify({
                  city: detectedCity,
                  area: detectedArea,
                  state: detectedState,
                  coords: { latitude, longitude, accuracy },
                  source: 'browser_gps',
                })
              );
            }
          } catch (e) {
            console.error('Reverse geocode error:', e);
            // Even if reverse geocode times out, we have the accurate GPS coordinates
            setArea('Current GPS Location');
          }

          setIsLoading(false);
          resolve();
        },
        (err) => {
          console.warn('Geolocation permission denied or error:', err.message);
          let userMsg = 'Unable to fetch your location';
          if (err.code === 1) {
            userMsg = 'Location permission was denied. Please allow location in your browser settings.';
          } else if (err.code === 2) {
            userMsg = 'Location position unavailable.';
          } else if (err.code === 3) {
            userMsg = 'Location request timed out.';
          }
          setError(userMsg);
          setIsLoading(false);
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0, // Never use stale cache, force fresh device GPS fix
        }
      );
    });
  };

  const setManualCity = (cityName: string) => {
    setCity(cityName);
    setArea('All Localities');
    setSource('manual');
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'rankcity_user_location',
        JSON.stringify({
          city: cityName,
          area: 'All Localities',
          coords: null,
          source: 'manual',
        })
      );
    }
  };

  return (
    <LocationContext.Provider
      value={{
        coords,
        city,
        area,
        state,
        source,
        isLoading,
        error,
        requestCurrentLocation,
        setManualCity,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation(): UserLocationState {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
}
