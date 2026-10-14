'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  MapPin,
  Search,
  Loader2,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Building,
  Home,
  X,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

export interface LocationSelectionValue {
  country: string;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  cityId: string;
  cityName: string;
  villageId?: string;
  villageName?: string;
  locality: string;
  pincode: string;
  address: string;
  landmark?: string;
  buildingInfo?: string;
}

interface HierarchicalLocationSelectorProps {
  value: LocationSelectionValue;
  onChange: (updated: LocationSelectionValue) => void;
  className?: string;
}

const ALL_COUNTRIES = [
  'India',
];

export function HierarchicalLocationSelector({
  value,
  onChange,
  className = '',
}: HierarchicalLocationSelectorProps) {
  // Lists
  const [statesList, setStatesList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [localitiesList, setLocalitiesList] = useState<any[]>([]);
  const [pincodesList, setPincodesList] = useState<any[]>([]);

  // Settlement mode: 'city' or 'village'
  const [settlementType, setSettlementType] = useState<'city' | 'village'>('city');

  // Loaders & Errors
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [loadingPincode, setLoadingPincode] = useState(false);

  const [errorStates, setErrorStates] = useState<string | null>(null);
  const [errorDistricts, setErrorDistricts] = useState<string | null>(null);
  const [errorCities, setErrorCities] = useState<string | null>(null);

  // Search queries for dropdown filtering
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Suggest Location Modal
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestFormData, setSuggestFormData] = useState({
    name: '',
    locationType: 'city' as 'city' | 'town' | 'village' | 'district' | 'locality',
    stateName: value.stateName || 'Madhya Pradesh',
    districtName: value.districtName || '',
    cityName: value.cityName || '',
    pincode: value.pincode || '',
    contactEmail: '',
    notes: '',
  });
  const [suggestStatus, setSuggestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [suggestMessage, setSuggestMessage] = useState('');

  // 1. Fetch States on Mount
  const fetchStates = async () => {
    setLoadingStates(true);
    setErrorStates(null);
    try {
      const res = await fetch('/api/locations/states?limit=100');
      if (!res.ok) throw new Error('Failed to load states');
      const data = await res.json();
      setStatesList(data.items || []);
    } catch (e: any) {
      setErrorStates(e.message || 'Unable to load Indian States');
    } finally {
      setLoadingStates(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  // 2. Fetch Districts whenever State changes
  useEffect(() => {
    if (!value.stateId) {
      setDistrictsList([]);
      return;
    }
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      setErrorDistricts(null);
      try {
        const res = await fetch(`/api/locations/districts?stateId=${encodeURIComponent(value.stateId)}&limit=150`);
        if (!res.ok) throw new Error('Failed to load districts');
        const data = await res.json();
        setDistrictsList(data.items || []);
      } catch (e: any) {
        setErrorDistricts(e.message || 'Unable to load districts');
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [value.stateId]);

  // 3. Fetch Cities or Villages whenever District changes
  useEffect(() => {
    if (!value.districtId) {
      setCitiesList([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingCities(true);
      setErrorCities(null);
      try {
        const endpoint =
          settlementType === 'village'
            ? `/api/locations/villages?districtId=${encodeURIComponent(value.districtId)}&limit=100`
            : `/api/locations/cities?districtId=${encodeURIComponent(value.districtId)}&limit=100`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Failed to load ${settlementType === 'village' ? 'villages' : 'cities'}`);
        const data = await res.json();
        setCitiesList(data.items || []);
      } catch (e: any) {
        setErrorCities(e.message || 'Unable to load local settlements');
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [value.districtId, settlementType]);

  // 4. Fetch Localities whenever City changes
  useEffect(() => {
    if (!value.cityId) {
      setLocalitiesList([]);
      return;
    }
    const fetchLocalities = async () => {
      setLoadingLocalities(true);
      try {
        const res = await fetch(`/api/locations/localities?cityId=${encodeURIComponent(value.cityId)}&limit=100`);
        if (res.ok) {
          const data = await res.json();
          setLocalitiesList(data.items || []);
        }
      } catch {
        // non-blocking
      } finally {
        setLoadingLocalities(false);
      }
    };
    fetchLocalities();
  }, [value.cityId]);

  // 5. Debounced PIN code lookup
  useEffect(() => {
    if (value.pincode && value.pincode.length >= 3 && /^\d+$/.test(value.pincode)) {
      const timer = setTimeout(async () => {
        setLoadingPincode(true);
        try {
          const res = await fetch(`/api/locations/pincodes?pincode=${encodeURIComponent(value.pincode)}&limit=5`);
          if (res.ok) {
            const data = await res.json();
            setPincodesList(data.items || []);
          }
        } catch {
          // ignore
        } finally {
          setLoadingPincode(false);
        }
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setPincodesList([]);
    }
  }, [value.pincode]);

  // Selection Handlers with clean cascade clearance
  const handleCountryChange = (c: string) => {
    onChange({
      ...value,
      country: c,
      stateId: '',
      stateName: '',
      districtId: '',
      districtName: '',
      cityId: '',
      cityName: '',
      villageId: '',
      villageName: '',
      locality: '',
      pincode: '',
    });
  };

  const handleStateChange = (stId: string) => {
    const selected = statesList.find((s) => s.id === stId);
    setDistrictSearch('');
    setCitySearch('');
    onChange({
      ...value,
      stateId: stId,
      stateName: selected ? selected.name : '',
      districtId: '',
      districtName: '',
      cityId: '',
      cityName: '',
      villageId: '',
      villageName: '',
      locality: '',
      pincode: '',
    });
  };

  const handleDistrictChange = (dstId: string) => {
    const selected = districtsList.find((d) => d.id === dstId);
    setCitySearch('');
    onChange({
      ...value,
      districtId: dstId,
      districtName: selected ? selected.name : '',
      cityId: '',
      cityName: '',
      villageId: '',
      villageName: '',
      locality: '',
    });
  };

  const handleCityChange = (ctyId: string) => {
    const selected = citiesList.find((c) => c.id === ctyId);
    onChange({
      ...value,
      cityId: ctyId,
      cityName: selected ? selected.name : '',
      villageId: settlementType === 'village' ? ctyId : undefined,
      villageName: settlementType === 'village' ? selected?.name : undefined,
      locality: '',
    });
  };

  const handleLocalitySelect = (locName: string, locPincode?: string) => {
    onChange({
      ...value,
      locality: locName,
      pincode: locPincode || value.pincode,
    });
  };

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestStatus('submitting');
    try {
      const res = await fetch('/api/locations/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestFormData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuggestStatus('success');
      setSuggestMessage(data.message || 'Location suggested successfully! Our administrators will review and add it.');
      setTimeout(() => {
        setShowSuggestModal(false);
        setSuggestStatus('idle');
      }, 2500);
    } catch (err: any) {
      setSuggestStatus('error');
      setSuggestMessage(err.message || 'An error occurred while submitting suggestion.');
    }
  };

  const isIndia = value.country === 'India';

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. Country Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="loc-country" className="block text-xs font-bold text-neutral-700 mb-1.5">
            Country *
          </label>
          <select
            id="loc-country"
            value={value.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-colors"
          >
            {ALL_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 2. State / Union Territory (India-wide) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="loc-state" className="block text-xs font-bold text-neutral-700">
              State / Union Territory *
            </label>
            {loadingStates && (
              <span className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading 36 States/UTs...
              </span>
            )}
          </div>

          {errorStates ? (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{errorStates}</span>
              <button
                type="button"
                onClick={fetchStates}
                className="font-bold underline text-rose-800 hover:text-rose-950"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  disabled={!isIndia || loadingStates}
                  placeholder="Type to filter states (e.g. MP, Maharashtra)..."
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 rounded-lg text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 disabled:opacity-60 transition-colors"
                />
              </div>
              <select
                id="loc-state"
                disabled={!isIndia || loadingStates}
                value={value.stateId}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 disabled:opacity-60 transition-colors"
              >
                <option value="">-- Select State or UT ({statesList.length} total) --</option>
                {statesList
                  .filter((st) => {
                    if (!stateSearch) return true;
                    const q = stateSearch.toLowerCase();
                    return st.name.toLowerCase().includes(q) || (st.nameHi && st.nameHi.includes(q)) || st.code.toLowerCase().includes(q);
                  })
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} {st.type === 'UT' ? '(UT)' : ''} {st.nameHi ? `• ${st.nameHi}` : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. District & Settlement Level (Only enabled once State is picked) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* District */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="loc-district" className="block text-xs font-bold text-neutral-700">
              Administrative District *
            </label>
            {loadingDistricts && (
              <span className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading Districts...
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {value.stateId && districtsList.length > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter districts in this state..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 rounded-lg text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            )}
            <select
              id="loc-district"
              disabled={!value.stateId || loadingDistricts}
              value={value.districtId}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 disabled:opacity-50 transition-colors"
            >
              <option value="">
                {!value.stateId
                  ? 'Select State first to view districts'
                  : `-- Select District (${districtsList.length} districts in ${value.stateName}) --`}
              </option>
              {districtsList
                .filter((d) => {
                  if (!districtSearch) return true;
                  const q = districtSearch.toLowerCase();
                  return (
                    d.name.toLowerCase().includes(q) ||
                    (d.nameHi && d.nameHi.includes(q)) ||
                    (d.headquarter && d.headquarter.toLowerCase().includes(q))
                  );
                })
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.nameHi ? `(${d.nameHi})` : ''} {d.headquarter ? `• HQ: ${d.headquarter}` : ''}
                  </option>
                ))}
            </select>
          </div>

          {errorDistricts && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errorDistricts}
            </p>
          )}
        </div>

        {/* City / Town / Village */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <label htmlFor="loc-city" className="block text-xs font-bold text-neutral-700">
                {settlementType === 'city' ? 'City / Town / Urban Body *' : 'Village / Rural Area *'}
              </label>
              {/* Type Switcher pill */}
              <div className="inline-flex rounded-md bg-neutral-200 p-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setSettlementType('city')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    settlementType === 'city' ? 'bg-white text-blue-600 shadow-2xs' : 'text-neutral-600'
                  }`}
                >
                  City/Town
                </button>
                <button
                  type="button"
                  onClick={() => setSettlementType('village')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    settlementType === 'village' ? 'bg-white text-blue-600 shadow-2xs' : 'text-neutral-600'
                  }`}
                >
                  Village
                </button>
              </div>
            </div>

            {loadingCities && (
              <span className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading...
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {value.districtId && citiesList.length > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={`Filter ${settlementType === 'village' ? 'villages' : 'cities'} in this district...`}
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 rounded-lg text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            )}
            <select
              id="loc-city"
              disabled={!value.districtId || loadingCities}
              value={value.cityId}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 disabled:opacity-50 transition-colors"
            >
              <option value="">
                {!value.districtId
                  ? 'Select District first'
                  : `-- Select ${settlementType === 'city' ? 'City/Town' : 'Village'} (${citiesList.length} available) --`}
              </option>
              {citiesList
                .filter((c) => {
                  if (!citySearch) return true;
                  const q = citySearch.toLowerCase();
                  return (
                    c.name.toLowerCase().includes(q) ||
                    (c.nameHi && c.nameHi.includes(q)) ||
                    (c.cityType && c.cityType.toLowerCase().includes(q))
                  );
                })
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.cityType ? `• ${c.cityType}` : ''} {c.nameHi ? `(${c.nameHi})` : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Missing Location Quick Helper */}
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-neutral-500">
              Not listed? Suggest your town or village.
            </span>
            <button
              type="button"
              onClick={() => {
                setSuggestFormData((prev) => ({
                  ...prev,
                  stateName: value.stateName || 'Madhya Pradesh',
                  districtName: value.districtName || '',
                  locationType: settlementType === 'village' ? 'village' : 'city',
                }));
                setShowSuggestModal(true);
              }}
              className="font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3 h-3" /> Suggest Missing Location
            </button>
          </div>
        </div>
      </div>

      {/* 4. Locality & PIN Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Locality with quick recommendations */}
        <div>
          <label htmlFor="loc-locality" className="block text-xs font-bold text-neutral-700 mb-1.5">
            Locality / Ward / Colony / Market *
          </label>
          <input
            id="loc-locality"
            type="text"
            required
            placeholder="e.g. Vijay Nagar, Palasia, Connaught Place, Bandra..."
            value={value.locality}
            onChange={(e) => onChange({ ...value, locality: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-colors"
          />

          {/* Quick chip suggestions if known localities exist for this city */}
          {localitiesList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-neutral-400 font-bold uppercase py-0.5">Popular:</span>
              {localitiesList.slice(0, 5).map((loc) => (
                <button
                  type="button"
                  key={loc.id}
                  onClick={() => handleLocalitySelect(loc.name, loc.pincode)}
                  className="px-2 py-0.5 bg-neutral-100 hover:bg-blue-50 hover:text-blue-700 text-neutral-700 rounded-md text-[11px] font-medium border border-neutral-200 cursor-pointer transition-colors"
                >
                  {loc.name} {loc.pincode ? `(${loc.pincode})` : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PIN Code with live Post Office verification */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="loc-pincode" className="block text-xs font-bold text-neutral-700">
              PIN Code (India Post) *
            </label>
            {loadingPincode && (
              <span className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Verifying PIN...
              </span>
            )}
          </div>

          <div className="relative">
            <input
              id="loc-pincode"
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 452010"
              value={value.pincode}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                onChange({ ...value, pincode: clean });
              }}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono font-bold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-colors"
            />
            {value.pincode.length === 6 && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 6-digit
              </span>
            )}
          </div>

          {/* Matched Post Offices */}
          {pincodesList.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50/60 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
              <span className="font-bold block text-[10px] uppercase tracking-wider text-blue-800">
                India Post Verified Delivery Offices ({pincodesList.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pincodesList.map((po) => (
                  <span
                    key={po.id}
                    className="inline-block bg-white px-2 py-0.5 rounded border border-blue-200 font-medium"
                  >
                    {po.postOfficeName} ({po.officeType})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Full Physical Address, Landmark & Building Info */}
      <div className="space-y-4 pt-1">
        <div>
          <label htmlFor="loc-address" className="block text-xs font-bold text-neutral-700 mb-1.5">
            Full Physical Street Address *
          </label>
          <input
            id="loc-address"
            type="text"
            required
            placeholder="e.g. 102, Shrivardhan Complex, 4 RNT Marg, Near Indore Railway Station"
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="loc-landmark" className="block text-xs font-bold text-neutral-700 mb-1.5">
              Prominent Landmark (Optional)
            </label>
            <input
              id="loc-landmark"
              type="text"
              placeholder="e.g. Opposite High Court, Near C21 Mall"
              value={value.landmark || ''}
              onChange={(e) => onChange({ ...value, landmark: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="loc-building" className="block text-xs font-bold text-neutral-700 mb-1.5">
              Building / Floor / Shop No. (Optional)
            </label>
            <input
              id="loc-building"
              type="text"
              placeholder="e.g. Shop #14, Ground Floor, Regal Square"
              value={value.buildingInfo || ''}
              onChange={(e) => onChange({ ...value, buildingInfo: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Suggest Missing Location Modal */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-neutral-200 shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setShowSuggestModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Suggest a Missing Location
                </h3>
                <p className="text-xs text-neutral-500">
                  Can&apos;t find your town, village or locality? Submit it for quick admin verification.
                </p>
              </div>
            </div>

            {suggestStatus === 'success' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Suggestion Submitted</h4>
                <p className="text-xs text-emerald-700">{suggestMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSuggestSubmit} className="space-y-3.5">
                {suggestStatus === 'error' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{suggestMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Location Type
                    </label>
                    <select
                      value={suggestFormData.locationType}
                      onChange={(e) =>
                        setSuggestFormData((prev) => ({
                          ...prev,
                          locationType: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="city">City</option>
                      <option value="town">Town</option>
                      <option value="village">Village</option>
                      <option value="locality">Locality</option>
                      <option value="district">District</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Official Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rau, Pithampur, Sanwer"
                      value={suggestFormData.name}
                      onChange={(e) => setSuggestFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      State / UT *
                    </label>
                    <input
                      type="text"
                      required
                      value={suggestFormData.stateName}
                      onChange={(e) => setSuggestFormData((prev) => ({ ...prev, stateName: e.target.value }))}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      District Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Indore"
                      value={suggestFormData.districtName}
                      onChange={(e) => setSuggestFormData((prev) => ({ ...prev, districtName: e.target.value }))}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      PIN Code (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="453331"
                      value={suggestFormData.pincode}
                      onChange={(e) => setSuggestFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Your Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="business@gmail.com"
                      value={suggestFormData.contactEmail}
                      onChange={(e) => setSuggestFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Notes or Govt Reference (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mention nearest highway, tehsil or government reference..."
                    value={suggestFormData.notes}
                    onChange={(e) => setSuggestFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSuggestModal(false)}
                    className="px-4 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={suggestStatus === 'submitting'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {suggestStatus === 'submitting' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit for Admin Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
