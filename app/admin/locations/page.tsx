'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import {
  MapPin,
  Database,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Building2,
  Compass,
} from 'lucide-react';
import { ImportReport } from '@/lib/location/importer';

export default function AdminLocationsPage() {
  const { currentUser } = useAuth();

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'import' | 'suggestions' | 'browse' | 'duplicates' | 'logs'>('overview');

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Browse hierarchy state
  const [statesList, setStatesList] = useState<any[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [loadingBrowse, setLoadingBrowse] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');

  // Location Management & Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'state' | 'district' | 'city' | 'village' | 'locality' | 'pincode'>('city');
  const [addFormData, setAddFormData] = useState<any>({
    name: '',
    nameHi: '',
    code: '',
    lgdCode: '',
    stateId: '',
    districtId: '',
    cityId: '',
    cityType: 'Municipal Corporation',
    pincode: '',
    headquarter: '',
    capital: '',
    type: 'STATE',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Duplicates State
  const [duplicateCandidates, setDuplicateCandidates] = useState<any[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [duplicateType, setDuplicateType] = useState<'cities' | 'districts'>('cities');

  // Import Pipeline State
  const [importDatasetType, setImportDatasetType] = useState<'states' | 'districts' | 'cities' | 'villages' | 'localities' | 'pincodes'>('cities');
  const [importSource, setImportSource] = useState<'LGD' | 'OGD_INDIA' | 'INDIA_POST' | 'CUSTOM_CSV' | 'CUSTOM_JSON'>('LGD');
  const [isCsvFormat, setIsCsvFormat] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [importContent, setImportContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actioningSugId, setActioningSugId] = useState<string | null>(null);

  // Logs state
  const [importLogs, setImportLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);


  // 1. Fetch Stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/locations/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 2. Fetch States for Browse tab
  useEffect(() => {
    if (activeTab === 'browse' && statesList.length === 0) {
      fetch('/api/locations/states?limit=100')
        .then((r) => r.json())
        .then((d) => {
          setStatesList(d.items || []);
          if (d.items?.length > 0 && !selectedStateId) {
            setSelectedStateId(d.items[0].id);
          }
        });
    }
  }, [activeTab]);

  // 3. Fetch Districts when selected State changes in Browse tab
  useEffect(() => {
    if (selectedStateId && activeTab === 'browse') {
      setLoadingBrowse(true);
      fetch(`/api/locations/districts?stateId=${encodeURIComponent(selectedStateId)}&limit=100`)
        .then((r) => r.json())
        .then((d) => {
          setDistrictsList(d.items || []);
          if (d.items?.length > 0) {
            setSelectedDistrictId(d.items[0].id);
          } else {
            setSelectedDistrictId('');
            setCitiesList([]);
          }
        })
        .finally(() => setLoadingBrowse(false));
    }
  }, [selectedStateId, activeTab]);

  // 4. Fetch Cities when selected District changes in Browse tab
  useEffect(() => {
    if (selectedDistrictId && activeTab === 'browse') {
      setLoadingBrowse(true);
      fetch(`/api/locations/cities?districtId=${encodeURIComponent(selectedDistrictId)}&limit=100`)
        .then((r) => r.json())
        .then((d) => {
          setCitiesList(d.items || []);
        })
        .finally(() => setLoadingBrowse(false));
    }
  }, [selectedDistrictId, activeTab]);

  // 5. Fetch Suggestions
  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const param = suggestionFilter !== 'all' ? `?status=${suggestionFilter}` : '';
      const res = await fetch(`/api/locations/suggest${param}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'suggestions') {
      fetchSuggestions();
    }
  }, [activeTab, suggestionFilter]);

  // 6. Fetch Logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/locations/logs?limit=30');
      if (res.ok) {
        const data = await res.json();
        setImportLogs(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  // Handle Suggestion Status Change
  const handleSuggestionAction = async (id: string, status: 'approved' | 'rejected') => {
    setActioningSugId(id);
    try {
      const res = await fetch(`/api/locations/suggest/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes: `Reviewed and ${status} by admin (${currentUser?.name || 'Administrator'}) on ${new Date().toLocaleDateString()}`,
        }),
      });
      if (res.ok) {
        fetchSuggestions();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActioningSugId(null);
    }
  };

  // Toggle location active status
  const handleToggleStatus = async (type: 'state' | 'district' | 'city', id: string, currentStatus: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/locations/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_status',
          type,
          id,
          isActive: !currentStatus,
        }),
      });
      if (res.ok) {
        if (type === 'city') {
          setCitiesList((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c)));
        } else if (type === 'district') {
          setDistrictsList((prev) => prev.map((d) => (d.id === id ? { ...d, isActive: !currentStatus } : d)));
        } else if (type === 'state') {
          setStatesList((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s)));
        }
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Add custom location handler
  const handleAddLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/locations/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          type: addType,
          data: addFormData,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to add location');
      setActionMessage(`Successfully added ${addType}!`);
      setTimeout(() => {
        setShowAddModal(false);
        setActionMessage(null);
      }, 1500);
      fetchStats();
      if (addType === 'city' && addFormData.districtId === selectedDistrictId) {
        setCitiesList((prev) => [...prev, d.record]);
      } else if (addType === 'district' && addFormData.stateId === selectedStateId) {
        setDistrictsList((prev) => [...prev, d.record]);
      } else if (addType === 'state') {
        setStatesList((prev) => [...prev, d.record]);
      }
    } catch (err: any) {
      setActionMessage(err.message || 'Error adding location');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch duplicate candidates
  const fetchDuplicates = async (dataset: 'cities' | 'districts' = 'cities') => {
    setLoadingDuplicates(true);
    try {
      const res = await fetch('/api/admin/locations/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate_candidates',
          datasetType: dataset,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setDuplicateCandidates(d.candidates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'duplicates') {
      fetchDuplicates(duplicateType);
    }
  }, [activeTab, duplicateType]);


  // Handle Import Submission
  const handleRunImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importContent.trim()) {
      setImportErrorMessage('Please paste or load CSV / JSON content to import.');
      return;
    }

    setIsImporting(true);
    setImportErrorMessage(null);
    setImportReport(null);

    try {
      const res = await fetch('/api/admin/locations/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetType: importDatasetType,
          source: importSource,
          rawContent: importContent,
          isCsv: isCsvFormat,
          dryRun: isDryRun,
          adminId: currentUser?.id || 'admin',
          fileName: `${importDatasetType}_${importSource.toLowerCase()}_manual_import`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Import request failed');
      }

      setImportReport(data.report);
      fetchStats();
    } catch (err: any) {
      setImportErrorMessage(err.message || 'An error occurred during import processing.');
    } finally {
      setIsImporting(false);
    }
  };

  // Sample data quick load
  const loadSampleData = (type: 'states' | 'districts' | 'cities' | 'pincodes', format: 'json' | 'csv') => {
    setImportDatasetType(type);
    setIsCsvFormat(format === 'csv');
    setImportReport(null);
    setImportErrorMessage(null);

    if (type === 'cities') {
      if (format === 'json') {
        setImportContent(
          JSON.stringify(
            [
              {
                name: 'Dewas',
                nameHi: 'देवास',
                districtName: 'Dewas',
                cityType: 'Municipal Corporation',
                lgdCode: 802130,
                latitude: 22.9676,
                longitude: 76.0534,
              },
              {
                name: 'Pithampur',
                nameHi: 'पीथमपुर',
                districtName: 'Dhar',
                cityType: 'Municipality',
                lgdCode: 802136,
                latitude: 22.6074,
                longitude: 75.6881,
              },
            ],
            null,
            2
          )
        );
      } else {
        setImportContent(
          'City Name,District Name,City Type,LGD Code,Latitude,Longitude\n' +
            'Dewas,Dewas,Municipal Corporation,802130,22.9676,76.0534\n' +
            'Pithampur,Dhar,Municipality,802136,22.6074,75.6881'
        );
      }
    } else if (type === 'pincodes') {
      if (format === 'json') {
        setImportContent(
          JSON.stringify(
            [
              {
                pincode: '452010',
                postOfficeName: 'Vijay Nagar S.O.',
                districtName: 'Indore',
                stateName: 'Madhya Pradesh',
                officeType: 'S.O.',
                circle: 'Madhya Pradesh',
              },
              {
                pincode: '452010',
                postOfficeName: 'Sukhlia S.O.',
                districtName: 'Indore',
                stateName: 'Madhya Pradesh',
                officeType: 'S.O.',
                circle: 'Madhya Pradesh',
              },
            ],
            null,
            2
          )
        );
      } else {
        setImportContent(
          'PIN Code,Post Office Name,District,State,Office Type,Circle\n' +
            '452010,Vijay Nagar S.O.,Indore,Madhya Pradesh,S.O.,Madhya Pradesh\n' +
            '452010,Sukhlia S.O.,Indore,Madhya Pradesh,S.O.,Madhya Pradesh'
        );
      }
    } else if (type === 'districts') {
      if (format === 'json') {
        setImportContent(
          JSON.stringify(
            [
              {
                name: 'Indore',
                nameHi: 'इन्दौर',
                stateCode: 'MP',
                lgdCode: 412,
                headquarter: 'Indore',
              },
              {
                name: 'Bhopal',
                nameHi: 'भोपाल',
                stateCode: 'MP',
                lgdCode: 390,
                headquarter: 'Bhopal',
              },
            ],
            null,
            2
          )
        );
      } else {
        setImportContent(
          'District Name,State Code,LGD Code,Headquarter\n' +
            'Indore,MP,412,Indore\n' +
            'Bhopal,MP,390,Bhopal'
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              National Infrastructure &bull; Local Government Directory (LGD)
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              India-Wide Coverage
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mt-0.5">
            India Location Database Engine
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Authoritative administrative boundaries, urban local bodies, postal PIN codes, and missing location review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchStats();
              if (activeTab === 'suggestions') fetchSuggestions();
              if (activeTab === 'logs') fetchLogs();
            }}
            className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Snapshot */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              States & UTs
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-neutral-900">{stats.statesCount}</span>
              <span className="text-[11px] text-emerald-600 font-bold">/ 36 Complete</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Districts
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-neutral-900">{stats.districtsCount}</span>
              <span className="text-[11px] text-blue-600 font-bold">LGD Indexed</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Cities & Towns
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-neutral-900">{stats.citiesCount}</span>
              <span className="text-[11px] text-neutral-400 font-medium">Urban Bodies</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Villages
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-neutral-900">{stats.villagesCount}</span>
              <span className="text-[11px] text-neutral-400 font-medium">Rural Units</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              PIN Codes
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-neutral-900">{stats.pincodesCount}</span>
              <span className="text-[11px] text-neutral-400 font-medium">Post Offices</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Suggestions
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-amber-600">{stats.pendingSuggestions}</span>
              <span className="text-[11px] text-amber-700 font-bold">Pending</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-1.5 flex flex-wrap gap-1">
        {[
          { key: 'overview', label: 'Overview & Coverage', icon: Compass },
          { key: 'import', label: 'Data Ingestion & Import', icon: UploadCloud },
          { key: 'suggestions', label: `Location Suggestions (${stats?.pendingSuggestions || 0})`, icon: AlertTriangle },
          { key: 'browse', label: 'Browse Location Tree', icon: Database },
          { key: 'duplicates', label: 'Duplicate Candidates', icon: Building2 },
          { key: 'logs', label: 'Audit Logs & Sync History', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & COVERAGE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-neutral-900 mb-1">
              Data Source Lineage & Coverage Assurance
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              RankCity uses legitimate and verified Indian open data standards with robust fallback and normalization:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    LGD
                  </div>
                  <h3 className="text-xs font-bold text-neutral-900">
                    Local Government Directory
                  </h3>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Primary source for 28 States, 8 Union Territories, 760+ administrative districts, and Urban Local Bodies (ULBs) via <code className="bg-white px-1 py-0.5 rounded border text-[10px]">lgdirectory.gov.in</code>.
                </p>
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md inline-block">
                  ✓ Official Codes Indexed
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    OGD
                  </div>
                  <h3 className="text-xs font-bold text-neutral-900">
                    Open Government Data
                  </h3>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Census towns, municipality boundaries and geographical coordinates from the Ministry of Panchayati Raj / <code className="bg-white px-1 py-0.5 rounded border text-[10px]">data.gov.in</code>.
                </p>
                <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md inline-block">
                  ✓ City Types & Lat/Lng Enabled
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                    POST
                  </div>
                  <h3 className="text-xs font-bold text-neutral-900">
                    Department of Posts (India Post)
                  </h3>
                </div>
                <p className="text-[11px] text-neutral-600">
                  6-digit All-India PIN Code dataset mapping Postal Circles, Regions, Divisions and multi-office delivery hubs.
                </p>
                <div className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-md inline-block">
                  ✓ Multi-Office PIN Mapping Active
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Hardcoded Constraints &bull; Full Idempotent Re-Import Protection</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className="font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
              >
                Launch Ingestion Pipeline <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA INGESTION & IMPORT PIPELINE */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5 mb-5">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Bulk Location Data Ingestion Pipeline
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Process official CSV or JSON datasets with automatic validation, parent-child LGD resolution, and dry-run safety.
                </p>
              </div>

              {/* Quick Load Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-neutral-400 font-bold uppercase mr-1">Load Demo:</span>
                <button
                  type="button"
                  onClick={() => loadSampleData('cities', 'json')}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  Cities (JSON)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleData('pincodes', 'csv')}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  PIN Codes (CSV)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleData('districts', 'json')}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  Districts (JSON)
                </button>
              </div>
            </div>

            <form onSubmit={handleRunImport} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Target Level */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    1. Target Dataset Level *
                  </label>
                  <select
                    value={importDatasetType}
                    onChange={(e) => setImportDatasetType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800"
                  >
                    <option value="cities">Cities & Towns (Urban Local Bodies)</option>
                    <option value="districts">Districts (LGD Administrative Units)</option>
                    <option value="states">States & Union Territories</option>
                    <option value="villages">Villages (Rural Revenue Units)</option>
                    <option value="localities">Localities (City Neighborhoods)</option>
                    <option value="pincodes">PIN Codes & Post Offices</option>
                  </select>
                </div>

                {/* Source Lineage */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    2. Data Source *
                  </label>
                  <select
                    value={importSource}
                    onChange={(e) => setImportSource(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800"
                  >
                    <option value="LGD">Local Government Directory (LGD)</option>
                    <option value="OGD_INDIA">Open Govt Data (data.gov.in)</option>
                    <option value="INDIA_POST">India Post Official Directory</option>
                    <option value="CUSTOM_CSV">Custom Organization CSV</option>
                    <option value="CUSTOM_JSON">Custom Organization JSON</option>
                  </select>
                </div>

                {/* Format Toggle & Dry Run */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    3. Payload Format & Safety
                  </label>
                  <div className="flex items-center gap-3 h-[38px]">
                    <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCsvFormat}
                        onChange={(e) => setIsCsvFormat(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Format is CSV</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDryRun}
                        onChange={(e) => setIsDryRun(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span className="font-bold">Dry-Run Only</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data Content Box */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-neutral-700">
                    Paste {isCsvFormat ? 'CSV Data (with headers)' : 'JSON Array of Records'} *
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    {importContent.split('\n').filter(Boolean).length} rows detected
                  </span>
                </div>
                <textarea
                  rows={8}
                  required
                  placeholder={
                    isCsvFormat
                      ? 'City Name,District Name,City Type,LGD Code\nIndore,Indore,Municipal Corporation,802144'
                      : '[\n  {\n    "name": "Indore",\n    "districtName": "Indore",\n    "cityType": "Municipal Corporation"\n  }\n]'
                  }
                  value={importContent}
                  onChange={(e) => setImportContent(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {importErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{importErrorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-500">
                  {isDryRun
                    ? '🛡️ Dry-run mode will validate and report counts without committing changes.'
                    : '⚡ Live mode will insert new records and update existing records idempotently.'}
                </span>

                <button
                  type="submit"
                  disabled={isImporting}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{isDryRun ? 'Run Validation Dry-Run' : 'Execute Production Ingestion'}</span>
                </button>
              </div>
            </form>

            {/* Import Report Card */}
            {importReport && (
              <div className="mt-6 p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {importReport.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : importReport.status === 'dry_run' ? (
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <h3 className="text-sm font-bold text-neutral-900">
                      Import Report: {importReport.status.toUpperCase()}
                    </h3>
                  </div>

                  <span className="text-xs font-mono text-neutral-400">
                    {new Date(importReport.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-neutral-200">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase block">Processed</span>
                    <strong className="text-base text-neutral-900">{importReport.totalProcessed}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block">Added</span>
                    <strong className="text-base text-emerald-600">+{importReport.recordsAdded}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-200">
                    <span className="text-[10px] text-blue-700 font-bold uppercase block">Updated</span>
                    <strong className="text-base text-blue-600">{importReport.recordsUpdated}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-rose-200">
                    <span className="text-[10px] text-rose-700 font-bold uppercase block">Rejected</span>
                    <strong className="text-base text-rose-600">{importReport.recordsRejected}</strong>
                  </div>
                </div>

                {importReport.errors && importReport.errors.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold text-rose-900 block">
                      Validation Issues ({importReport.errors.length}):
                    </span>
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                      {importReport.errors.map((err, i) => (
                        <div key={i} className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
                          <strong>Row {err.row}:</strong> {err.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LOCATION SUGGESTIONS MODERATION */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  User Location Suggestions Queue
                </h2>
                <p className="text-xs text-neutral-500">
                  Locations submitted by registering merchants that were missing from the official index.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-xs font-bold">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSuggestionFilter(filter)}
                    className={`px-3 py-1 rounded-lg capitalize cursor-pointer transition-colors ${
                      suggestionFilter === filter
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {loadingSuggestions ? (
              <div className="py-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading suggestions queue...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 space-y-1 border border-dashed border-neutral-200 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-xs font-bold text-neutral-600">No suggestions in this view</p>
                <p className="text-[11px]">All user requests have been processed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] font-bold border-y border-neutral-200">
                    <tr>
                      <th className="py-3 px-3">Location Name</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">State / District</th>
                      <th className="py-3 px-3">PIN Code</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {suggestions.map((sug) => (
                      <tr key={sug.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-3 font-bold text-neutral-900">
                          {sug.name}
                          {sug.notes && (
                            <span className="block text-[11px] font-normal text-neutral-500 mt-0.5">
                              {sug.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-neutral-100 rounded-md text-[10px] font-bold uppercase">
                            {sug.locationType}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-neutral-800">{sug.stateName}</span>
                          {sug.districtName && (
                            <span className="block text-[11px] text-neutral-400">
                              District: {sug.districtName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-neutral-700">
                          {sug.pincode || '—'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              sug.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : sug.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {sug.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {sug.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                disabled={actioningSugId === sug.id}
                                onClick={() => handleSuggestionAction(sug.id, 'rejected')}
                                className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 rounded-lg font-bold border border-rose-200 cursor-pointer disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                disabled={actioningSugId === sug.id}
                                onClick={() => handleSuggestionAction(sug.id, 'approved')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                {actioningSugId === sug.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>Approve & Add</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BROWSE LOCATION TREE */}
      {activeTab === 'browse' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                National Location Hierarchy Explorer
              </h2>
              <p className="text-xs text-neutral-500">
                Drill down from State to District to Urban Local Bodies. Manage active status or add custom records.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setAddFormData({
                  name: '',
                  nameHi: '',
                  code: '',
                  lgdCode: '',
                  stateId: selectedStateId || '',
                  districtId: selectedDistrictId || '',
                  cityId: '',
                  cityType: 'Municipal Corporation',
                  pincode: '',
                  headquarter: '',
                  capital: '',
                  type: 'STATE',
                });
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Add Location Record</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Column 1: States */}
            <div className="border border-neutral-200 rounded-2xl p-3 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                1. States & UTs ({statesList.length})
              </span>
              <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
                {statesList.map((st) => (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => setSelectedStateId(st.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                      selectedStateId === st.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    <span>{st.name} {st.type === 'UT' ? '(UT)' : ''}</span>
                    <span className="font-mono text-[10px] opacity-75">{st.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: Districts */}
            <div className="border border-neutral-200 rounded-2xl p-3 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                2. Districts ({districtsList.length})
              </span>
              <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
                {loadingBrowse ? (
                  <div className="py-8 text-center text-xs text-neutral-400">Loading districts...</div>
                ) : districtsList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">No districts found</div>
                ) : (
                  districtsList.map((dst) => (
                    <div
                      key={dst.id}
                      onClick={() => setSelectedDistrictId(dst.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                        selectedDistrictId === dst.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{dst.name}</span>
                        {dst.isActive === false && (
                          <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {dst.lgdCode && (
                          <span className="font-mono text-[10px] opacity-75">#{dst.lgdCode}</span>
                        )}
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus('district', dst.id, dst.isActive !== false);
                          }}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                            selectedDistrictId === dst.id
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : dst.isActive === false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                          }`}
                        >
                          {dst.isActive === false ? 'Enable' : 'Disable'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Cities & Towns */}
            <div className="border border-neutral-200 rounded-2xl p-3 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                3. Cities & Towns ({citiesList.length})
              </span>
              <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
                {citiesList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No urban bodies mapped to this district yet.
                  </div>
                ) : (
                  citiesList.map((cty) => (
                    <div
                      key={cty.id}
                      className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-neutral-900">
                        <div className="flex items-center gap-1.5">
                          <span>{cty.name}</span>
                          {cty.isActive === false && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                              Inactive
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-neutral-500">
                          {cty.cityType || 'City'}
                        </span>
                      </div>
                      {cty.nameHi && <span className="text-[11px] text-neutral-500 block">{cty.nameHi}</span>}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px]">
                        <span className="font-mono text-neutral-400 truncate max-w-[120px]">{cty.id}</span>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleToggleStatus('city', cty.id, cty.isActive !== false)}
                          className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                            cty.isActive !== false
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {cty.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DUPLICATE CANDIDATES INSPECTION */}
      {activeTab === 'duplicates' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Duplicate Location Candidates Review
              </h2>
              <p className="text-xs text-neutral-500">
                Automated detection of entities with identical normalized names or overlapping LGD codes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={duplicateType}
                onChange={(e) => setDuplicateType(e.target.value as any)}
                className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800"
              >
                <option value="cities">Cities & Towns</option>
                <option value="districts">Districts</option>
              </select>
              <button
                type="button"
                onClick={() => fetchDuplicates(duplicateType)}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Scan Now
              </button>
            </div>
          </div>

          {loadingDuplicates ? (
            <div className="py-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Scanning database for duplicates...
            </div>
          ) : duplicateCandidates.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-1 border border-dashed border-neutral-200 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-neutral-700">Zero Duplicates Detected</p>
              <p className="text-[11px]">All {duplicateType} records have unique names and parent bindings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {duplicateCandidates.map((cand, idx) => (
                <div key={idx} className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-900">
                      Duplicate Key: {cand.key} ({cand.count} records)
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold uppercase">
                      Duplicate Conflict
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {cand.items.map((it: any) => (
                      <div key={it.id} className="p-2 bg-white rounded-lg border border-neutral-200 text-neutral-800 font-mono text-[11px]">
                        <strong>{it.name}</strong> (ID: {it.id}) - LGD: {it.lgdCode || 'N/A'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AUDIT LOGS & SYNC HISTORY */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Location Ingestion Audit Logs
            </h2>
            <p className="text-xs text-neutral-500">
              Historical ledger of bulk imports, synchronization runs, and data revisions.
            </p>
          </div>

          {loadingLogs ? (
            <div className="py-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading audit history...
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {importLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900">{log.source}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          log.isDryRun
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : log.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {log.isDryRun ? 'Dry-Run' : log.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 block font-mono">
                      Triggered by: {log.triggeredBy || 'system'} &bull; File: {log.fileName || 'direct_stream'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-emerald-600 font-bold">+{log.recordsAdded} added</span>
                    <span className="text-blue-600 font-bold">{log.recordsUpdated} updated</span>
                    {log.recordsRejected > 0 && (
                      <span className="text-rose-600 font-bold">{log.recordsRejected} rejected</span>
                    )}
                    <span className="text-neutral-400 text-[11px]">
                      {new Date(log.importDate).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD CUSTOM LOCATION RECORD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-neutral-900">
                  Add Location to National Database
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLocationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Location Entity Level *
                </label>
                <select
                  value={addType}
                  onChange={(e) => setAddType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800"
                >
                  <option value="city">City / Town / Urban Local Body</option>
                  <option value="district">Administrative District</option>
                  <option value="state">State / Union Territory</option>
                  <option value="village">Village (Rural Unit)</option>
                  <option value="locality">Locality (Ward/Colony)</option>
                  <option value="pincode">PIN Code & Post Office</option>
                </select>
              </div>

              {/* State Parent if needed */}
              {['district', 'city', 'village', 'pincode'].includes(addType) && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Parent State / UT *
                  </label>
                  <select
                    value={addFormData.stateId}
                    onChange={(e) => setAddFormData({ ...addFormData, stateId: e.target.value, districtId: '' })}
                    required
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800"
                  >
                    <option value="">-- Select Parent State --</option>
                    {statesList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* District Parent if needed */}
              {['city', 'village'].includes(addType) && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Parent District *
                  </label>
                  <select
                    value={addFormData.districtId}
                    onChange={(e) => setAddFormData({ ...addFormData, districtId: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800"
                  >
                    <option value="">-- Select District in {statesList.find(s => s.id === addFormData.stateId)?.name || 'State'} --</option>
                    {districtsList.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* City Parent if locality */}
              {addType === 'locality' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Parent City *
                  </label>
                  <select
                    value={addFormData.cityId}
                    onChange={(e) => setAddFormData({ ...addFormData, cityId: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800"
                  >
                    <option value="">-- Select City --</option>
                    {citiesList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name or Pincode */}
              {addType === 'pincode' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">6-Digit PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="452010"
                      value={addFormData.pincode}
                      onChange={(e) => setAddFormData({ ...addFormData, pincode: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Post Office Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vijay Nagar S.O."
                      value={addFormData.postOfficeName || ''}
                      onChange={(e) => setAddFormData({ ...addFormData, postOfficeName: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">English Official Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ujjain"
                      value={addFormData.name}
                      onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Hindi Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. उज्जैन"
                      value={addFormData.nameHi || ''}
                      onChange={(e) => setAddFormData({ ...addFormData, nameHi: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* State Code */}
              {addType === 'state' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">ISO Code (e.g. MP, MH) *</label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      placeholder="MP"
                      value={addFormData.code || ''}
                      onChange={(e) => setAddFormData({ ...addFormData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Type</label>
                    <select
                      value={addFormData.type || 'STATE'}
                      onChange={(e) => setAddFormData({ ...addFormData, type: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                    >
                      <option value="STATE">State</option>
                      <option value="UT">Union Territory</option>
                    </select>
                  </div>
                </div>
              )}

              {/* LGD Code */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Local Government Directory (LGD) Code (Optional)
                </label>
                <input
                  type="number"
                  placeholder="Official LGD ID if available"
                  value={addFormData.lgdCode || ''}
                  onChange={(e) => setAddFormData({ ...addFormData, lgdCode: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono"
                />
              </div>

              {actionMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  actionMessage.includes('Success')
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{actionMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Location & Log Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

