import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase/client';
import {
  StateRecord,
  DistrictRecord,
  CityRecord,
  VillageRecord,
  LocalityRecord,
  PincodeRecord,
  LocationImportLog,
  LocationSuggestion,
} from '@/types';
import {
  LocationImportPipeline,
  ImportReport,
  ImportOptions,
  parseCSV,
} from './importer';

// Helper to safely load JSON data files from data/locations/
function loadJsonFile<T>(filename: string, fallback: T[]): T[] {
  try {
    const fullPath = path.join(process.cwd(), 'data', 'locations', filename);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`[LocationService] Notice: Could not read file ${filename}, using fallback:`, (err as Error).message);
  }
  return fallback;
}

class LocationDatabaseService {
  private states: StateRecord[] = [];
  private districts: DistrictRecord[] = [];
  private cities: CityRecord[] = [];
  private villages: VillageRecord[] = [];
  private localities: LocalityRecord[] = [];
  private pincodes: PincodeRecord[] = [];
  private suggestions: LocationSuggestion[] = [];
  private importLogs: LocationImportLog[] = [];
  private initialized = false;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    if (this.initialized) return;

    // 1. Load authoritative datasets from disk
    this.states = loadJsonFile<StateRecord>('lgd_states.json', []);
    this.districts = loadJsonFile<DistrictRecord>('lgd_districts.json', []);
    this.cities = loadJsonFile<CityRecord>('india_cities.json', []);
    this.localities = loadJsonFile<LocalityRecord>('india_localities.json', []);
    this.pincodes = loadJsonFile<PincodeRecord>('india_pincodes.json', []);
    this.villages = loadJsonFile<VillageRecord>('sample_villages.json', []);

    // Initial mock import log to record initial authoritative baseline
    this.importLogs = [
      {
        id: 'log_init_lgd_master',
        source: 'LGD & India Post Authoritative Baseline',
        fileName: 'lgd_master_seed.json',
        importDate: new Date().toISOString(),
        recordsAdded: this.states.length + this.districts.length + this.cities.length + this.pincodes.length,
        recordsUpdated: 0,
        recordsRejected: 0,
        status: 'completed',
        isDryRun: false,
        triggeredBy: 'system_initializer',
        createdAt: new Date().toISOString(),
      },
    ];

    this.initialized = true;

    // 2. Asynchronously attempt sync with Supabase tables if populated
    this.syncWithSupabase();
  }

  private async syncWithSupabase() {
    try {
      const [stRes, dstRes, ctyRes, pinRes, sugRes] = await Promise.allSettled([
        supabaseAdmin.from('states').select('*'),
        supabaseAdmin.from('districts').select('*'),
        supabaseAdmin.from('cities').select('*'),
        supabaseAdmin.from('pincodes').select('*'),
        supabaseAdmin.from('location_suggestions').select('*'),
      ]);

      if (stRes.status === 'fulfilled' && !stRes.value.error && stRes.value.data?.length > 0) {
        this.states = stRes.value.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          nameHi: s.name_hi,
          code: s.code,
          lgdCode: s.lgd_code,
          type: s.type,
          capital: s.capital,
          isActive: s.is_active ?? true,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        }));
      }

      if (dstRes.status === 'fulfilled' && !dstRes.value.error && dstRes.value.data?.length > 0) {
        this.districts = dstRes.value.data.map((d: any) => ({
          id: d.id,
          stateId: d.state_id,
          name: d.name,
          nameHi: d.name_hi,
          lgdCode: d.lgd_code,
          headquarter: d.headquarter,
          isActive: d.is_active ?? true,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }

      if (ctyRes.status === 'fulfilled' && !ctyRes.value.error && ctyRes.value.data?.length > 0) {
        this.cities = ctyRes.value.data.map((c: any) => ({
          id: c.id,
          districtId: c.district_id,
          name: c.name,
          nameHi: c.name_hi,
          cityType: c.city_type,
          lgdCode: c.lgd_code,
          latitude: c.latitude,
          longitude: c.longitude,
          isActive: c.is_active ?? true,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
      }

      if (pinRes.status === 'fulfilled' && !pinRes.value.error && pinRes.value.data?.length > 0) {
        this.pincodes = pinRes.value.data.map((p: any) => ({
          id: p.id,
          pincode: p.pincode,
          postOfficeName: p.post_office_name,
          districtId: p.district_id,
          stateId: p.state_id,
          circle: p.circle,
          region: p.region,
          division: p.division,
          officeType: p.office_type,
          deliveryStatus: p.delivery_status,
          isActive: p.is_active ?? true,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));
      }

      if (sugRes.status === 'fulfilled' && !sugRes.value.error && sugRes.value.data?.length > 0) {
        this.suggestions = sugRes.value.data.map((s: any) => ({
          id: s.id,
          locationType: s.location_type,
          name: s.name,
          stateName: s.state_name,
          districtName: s.district_name,
          cityName: s.city_name,
          pincode: s.pincode,
          submittedByUserId: s.submitted_by_user_id,
          contactEmail: s.contact_email,
          notes: s.notes,
          status: s.status,
          adminNotes: s.admin_notes,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        }));
      }
    } catch {
      // In-memory fallback is always maintained
    }
  }

  // =========================================================================
  // QUERY METHODS (With debounced search & pagination)
  // =========================================================================

  getStates(params: { search?: string; isActive?: boolean; limit?: number; offset?: number } = {}) {
    let result = this.states.filter((s) => (params.isActive !== undefined ? s.isActive === params.isActive : true));

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          (s.nameHi && s.nameHi.includes(q))
      );
    }

    // Sort alphabetically by name
    result.sort((a, b) => a.name.localeCompare(b.name));

    const total = result.length;
    const offset = params.offset || 0;
    const limit = params.limit || 100;
    const items = result.slice(offset, offset + limit);

    return { total, offset, limit, items };
  }

  getStateById(id: string): StateRecord | undefined {
    return this.states.find((s) => s.id === id || s.code.toLowerCase() === id.toLowerCase());
  }

  getDistricts(params: { stateId?: string; search?: string; isActive?: boolean; limit?: number; offset?: number } = {}) {
    let result = this.districts.filter((d) => (params.isActive !== undefined ? d.isActive === params.isActive : true));

    if (params.stateId) {
      result = result.filter((d) => d.stateId === params.stateId);
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.nameHi && d.nameHi.includes(q)) ||
          (d.headquarter && d.headquarter.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => a.name.localeCompare(b.name));

    const total = result.length;
    const offset = params.offset || 0;
    const limit = params.limit || 100;
    const items = result.slice(offset, offset + limit);

    return { total, offset, limit, items };
  }

  getDistrictById(id: string): DistrictRecord | undefined {
    return this.districts.find((d) => d.id === id);
  }

  getCities(params: { districtId?: string; search?: string; cityType?: string; isActive?: boolean; limit?: number; offset?: number } = {}) {
    let result = this.cities.filter((c) => (params.isActive !== undefined ? c.isActive === params.isActive : true));

    if (params.districtId) {
      result = result.filter((c) => c.districtId === params.districtId);
    }

    if (params.cityType) {
      result = result.filter((c) => c.cityType.toLowerCase() === params.cityType?.toLowerCase());
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || (c.nameHi && c.nameHi.includes(q)));
    }

    result.sort((a, b) => a.name.localeCompare(b.name));

    const total = result.length;
    const offset = params.offset || 0;
    const limit = params.limit || 100;
    const items = result.slice(offset, offset + limit);

    return { total, offset, limit, items };
  }

  getCityById(id: string): CityRecord | undefined {
    return this.cities.find((c) => c.id === id);
  }

  getVillages(params: { districtId?: string; subdistrictId?: string; search?: string; limit?: number; offset?: number } = {}) {
    let result = this.villages.filter((v) => v.isActive);

    if (params.districtId) {
      result = result.filter((v) => v.districtId === params.districtId);
    }

    if (params.subdistrictId) {
      result = result.filter((v) => v.subdistrictId === params.subdistrictId);
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter((v) => v.name.toLowerCase().includes(q) || (v.nameHi && v.nameHi.includes(q)));
    }

    result.sort((a, b) => a.name.localeCompare(b.name));

    const total = result.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const items = result.slice(offset, offset + limit);

    return { total, offset, limit, items };
  }

  getLocalities(params: { cityId?: string; search?: string; limit?: number; offset?: number } = {}) {
    let result = this.localities.filter((l) => l.isActive);

    if (params.cityId) {
      result = result.filter((l) => l.cityId === params.cityId);
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter((l) => l.name.toLowerCase().includes(q) || (l.pincode && l.pincode.includes(q)));
    }

    result.sort((a, b) => a.name.localeCompare(b.name));

    const total = result.length;
    const offset = params.offset || 0;
    const limit = params.limit || 100;
    const items = result.slice(offset, offset + limit);

    return { total, offset, limit, items };
  }

  searchPincodes(params: { pincode?: string; districtId?: string; stateId?: string; search?: string; limit?: number; offset?: number } = {}) {
    let result = this.pincodes.filter((p) => p.isActive);

    if (params.pincode) {
      const pinPrefix = params.pincode.trim();
      result = result.filter((p) => p.pincode.startsWith(pinPrefix));
    }

    if (params.districtId) {
      result = result.filter((p) => p.districtId === params.districtId);
    }

    if (params.stateId) {
      result = result.filter((p) => p.stateId === params.stateId);
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter((p) => p.pincode.includes(q) || p.postOfficeName.toLowerCase().includes(q));
    }

    const total = result.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const items = result.slice(offset, offset + limit);

    return { total, offset, limit, items };
  }

  // =========================================================================
  // LOCATION SUGGESTIONS & USER FEEDBACK
  // =========================================================================

  async createSuggestion(data: Omit<LocationSuggestion, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<LocationSuggestion> {
    const id = `sug_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSug: LocationSuggestion = {
      id,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.suggestions.unshift(newSug);

    // Persist to Supabase if available
    try {
      await supabaseAdmin.from('location_suggestions').insert({
        id: newSug.id,
        location_type: newSug.locationType,
        name: newSug.name,
        state_name: newSug.stateName,
        district_name: newSug.districtName,
        city_name: newSug.cityName,
        pincode: newSug.pincode,
        submitted_by_user_id: newSug.submittedByUserId,
        contact_email: newSug.contactEmail,
        notes: newSug.notes,
        status: newSug.status,
      });
    } catch {
      // ignore
    }

    return newSug;
  }

  getSuggestions(params: { status?: 'pending' | 'approved' | 'rejected'; limit?: number; offset?: number } = {}) {
    let result = this.suggestions;
    if (params.status) {
      result = result.filter((s) => s.status === params.status);
    }

    const total = result.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const items = result.slice(offset, offset + limit);

    return { total, offset, limit, items };
  }

  /**
   * Validates that parent-child location selections form a valid, unbroken hierarchy.
   */
  validateHierarchy(hierarchy: {
    stateId?: string;
    districtId?: string;
    cityId?: string;
    villageId?: string;
  }): { valid: boolean; error?: string } {
    const { stateId, districtId, cityId, villageId } = hierarchy;

    let matchedState: StateRecord | undefined;
    if (stateId) {
      matchedState = this.states.find((s) => s.id === stateId);
      if (!matchedState) {
        return { valid: false, error: `Invalid State ID: "${stateId}" does not exist in location database.` };
      }
      if (!matchedState.isActive) {
        return { valid: false, error: `State "${matchedState.name}" is currently marked inactive.` };
      }
    }

    let matchedDistrict: DistrictRecord | undefined;
    if (districtId) {
      matchedDistrict = this.districts.find((d) => d.id === districtId);
      if (!matchedDistrict) {
        return { valid: false, error: `Invalid District ID: "${districtId}" does not exist in location database.` };
      }
      if (!matchedDistrict.isActive) {
        return { valid: false, error: `District "${matchedDistrict.name}" is currently marked inactive.` };
      }
      if (stateId && matchedDistrict.stateId !== stateId) {
        return {
          valid: false,
          error: `Hierarchy Mismatch: District "${matchedDistrict.name}" does not belong to State "${matchedState?.name || stateId}".`,
        };
      }
    }

    if (cityId) {
      const matchedCity = this.cities.find((c) => c.id === cityId);
      if (!matchedCity) {
        return { valid: false, error: `Invalid City ID: "${cityId}" does not exist in location database.` };
      }
      if (!matchedCity.isActive) {
        return { valid: false, error: `City "${matchedCity.name}" is currently marked inactive.` };
      }
      if (districtId && matchedCity.districtId !== districtId) {
        return {
          valid: false,
          error: `Hierarchy Mismatch: City "${matchedCity.name}" does not belong to District "${matchedDistrict?.name || districtId}".`,
        };
      }
    }

    if (villageId) {
      const matchedVillage = this.villages.find((v) => v.id === villageId);
      if (!matchedVillage) {
        return { valid: false, error: `Invalid Village ID: "${villageId}" does not exist in location database.` };
      }
      if (!matchedVillage.isActive) {
        return { valid: false, error: `Village "${matchedVillage.name}" is currently marked inactive.` };
      }
      if (districtId && matchedVillage.districtId !== districtId) {
        return {
          valid: false,
          error: `Hierarchy Mismatch: Village "${matchedVillage.name}" does not belong to District "${matchedDistrict?.name || districtId}".`,
        };
      }
    }

    return { valid: true };
  }

  // =========================================================================
  // LOCATION MANAGEMENT & AUDIT TRAIL
  // =========================================================================

  async addLocation(
    type: 'state' | 'district' | 'city' | 'village' | 'locality' | 'pincode',
    data: any,
    adminId: string = 'admin'
  ): Promise<{ success: boolean; record?: any; error?: string }> {
    const timestamp = new Date().toISOString();

    if (type === 'state') {
      if (!data.name || !data.code) return { success: false, error: 'State name and code are required.' };
      const id = data.id || `st_${data.code.toLowerCase()}`;
      if (this.states.some((s) => s.id === id || s.code.toLowerCase() === data.code.toLowerCase())) {
        return { success: false, error: `State with code ${data.code} already exists.` };
      }
      const record: StateRecord = {
        id,
        name: data.name.trim(),
        nameHi: data.nameHi,
        code: data.code.trim().toUpperCase(),
        lgdCode: data.lgdCode ? Number(data.lgdCode) : undefined,
        type: data.type === 'UT' ? 'UT' : 'STATE',
        capital: data.capital,
        isActive: data.isActive ?? true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.states.push(record);
      this.recordAuditAction(`Admin Added State: ${record.name} (${record.code})`, adminId, 1, 0);
      try {
        await supabaseAdmin.from('states').insert({
          id: record.id,
          name: record.name,
          name_hi: record.nameHi,
          code: record.code,
          lgd_code: record.lgdCode,
          type: record.type,
          capital: record.capital,
          is_active: record.isActive,
        });
      } catch {}
      return { success: true, record };
    }

    if (type === 'district') {
      if (!data.name || !data.stateId) return { success: false, error: 'District name and stateId are required.' };
      const state = this.states.find((s) => s.id === data.stateId);
      if (!state) return { success: false, error: `Parent state "${data.stateId}" not found.` };
      const id = data.id || `dst_${state.id}_${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const record: DistrictRecord = {
        id,
        stateId: state.id,
        stateLgdCode: state.lgdCode,
        name: data.name.trim(),
        nameHi: data.nameHi,
        lgdCode: data.lgdCode ? Number(data.lgdCode) : undefined,
        headquarter: data.headquarter,
        isActive: data.isActive ?? true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.districts.push(record);
      this.recordAuditAction(`Admin Added District: ${record.name} in ${state.name}`, adminId, 1, 0);
      try {
        await supabaseAdmin.from('districts').insert({
          id: record.id,
          state_id: record.stateId,
          name: record.name,
          name_hi: record.nameHi,
          lgd_code: record.lgdCode,
          headquarter: record.headquarter,
          is_active: record.isActive,
        });
      } catch {}
      return { success: true, record };
    }

    if (type === 'city') {
      if (!data.name || !data.districtId) return { success: false, error: 'City name and districtId are required.' };
      const district = this.districts.find((d) => d.id === data.districtId);
      if (!district) return { success: false, error: `Parent district "${data.districtId}" not found.` };
      const id = data.id || `cty_${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${district.id.replace('dst_', '')}`;
      const record: CityRecord = {
        id,
        districtId: district.id,
        name: data.name.trim(),
        nameHi: data.nameHi,
        cityType: data.cityType || 'Municipal Corporation',
        lgdCode: data.lgdCode ? Number(data.lgdCode) : undefined,
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
        isActive: data.isActive ?? true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.cities.push(record);
      this.recordAuditAction(`Admin Added City: ${record.name} in ${district.name}`, adminId, 1, 0);
      try {
        await supabaseAdmin.from('cities').insert({
          id: record.id,
          district_id: record.districtId,
          name: record.name,
          name_hi: record.nameHi,
          city_type: record.cityType,
          lgd_code: record.lgdCode,
          is_active: record.isActive,
        });
      } catch {}
      return { success: true, record };
    }

    if (type === 'village') {
      if (!data.name || !data.districtId) return { success: false, error: 'Village name and districtId are required.' };
      const district = this.districts.find((d) => d.id === data.districtId);
      if (!district) return { success: false, error: `Parent district "${data.districtId}" not found.` };
      const id = data.id || `vil_${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${district.id.replace('dst_', '')}`;
      const record: VillageRecord = {
        id,
        districtId: district.id,
        subdistrictId: data.subdistrictId,
        name: data.name.trim(),
        nameHi: data.nameHi,
        lgdCode: data.lgdCode ? Number(data.lgdCode) : undefined,
        pincode: data.pincode,
        isActive: data.isActive ?? true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.villages.push(record);
      this.recordAuditAction(`Admin Added Village: ${record.name} in ${district.name}`, adminId, 1, 0);
      try {
        await supabaseAdmin.from('villages').insert({
          id: record.id,
          district_id: record.districtId,
          subdistrict_id: record.subdistrictId,
          name: record.name,
          name_hi: record.nameHi,
          is_active: record.isActive,
        });
      } catch {}
      return { success: true, record };
    }

    if (type === 'locality') {
      if (!data.name || !data.cityId) return { success: false, error: 'Locality name and cityId are required.' };
      const city = this.cities.find((c) => c.id === data.cityId);
      if (!city) return { success: false, error: `Parent city "${data.cityId}" not found.` };
      const id = data.id || `loc_${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${city.id.replace('cty_', '')}`;
      const record: LocalityRecord = {
        id,
        cityId: city.id,
        name: data.name.trim(),
        pincode: data.pincode,
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
        isActive: data.isActive ?? true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.localities.push(record);
      this.recordAuditAction(`Admin Added Locality: ${record.name} in ${city.name}`, adminId, 1, 0);
      try {
        await supabaseAdmin.from('localities').insert({
          id: record.id,
          city_id: record.cityId,
          name: record.name,
          pincode: record.pincode,
          is_active: record.isActive,
        });
      } catch {}
      return { success: true, record };
    }

    if (type === 'pincode') {
      if (!data.pincode || !data.postOfficeName) return { success: false, error: 'PIN code and postOfficeName are required.' };
      if (!/^\d{6}$/.test(data.pincode)) return { success: false, error: 'PIN code must be exactly 6 digits.' };
      const id = data.id || `pin_${data.pincode}_${data.postOfficeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const record: PincodeRecord = {
        id,
        pincode: data.pincode,
        postOfficeName: data.postOfficeName.trim(),
        districtId: data.districtId,
        stateId: data.stateId,
        circle: data.circle,
        region: data.region,
        division: data.division,
        officeType: data.officeType || 'S.O.',
        deliveryStatus: data.deliveryStatus || 'Delivery',
        isActive: data.isActive ?? true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.pincodes.push(record);
      this.recordAuditAction(`Admin Added PIN Code: ${record.pincode} (${record.postOfficeName})`, adminId, 1, 0);
      try {
        await supabaseAdmin.from('pincodes').insert({
          id: record.id,
          pincode: record.pincode,
          post_office_name: record.postOfficeName,
          district_id: record.districtId,
          state_id: record.stateId,
          is_active: record.isActive,
        });
      } catch {}
      return { success: true, record };
    }

    return { success: false, error: `Unsupported location type: ${type}` };
  }

  async toggleLocationStatus(
    type: 'state' | 'district' | 'city' | 'village' | 'locality' | 'pincode',
    id: string,
    isActive: boolean,
    adminId: string = 'admin'
  ): Promise<{ success: boolean; record?: any; error?: string }> {
    let targetRecord: any;
    let tableName = '';

    if (type === 'state') {
      targetRecord = this.states.find((s) => s.id === id);
      tableName = 'states';
    } else if (type === 'district') {
      targetRecord = this.districts.find((d) => d.id === id);
      tableName = 'districts';
    } else if (type === 'city') {
      targetRecord = this.cities.find((c) => c.id === id);
      tableName = 'cities';
    } else if (type === 'village') {
      targetRecord = this.villages.find((v) => v.id === id);
      tableName = 'villages';
    } else if (type === 'locality') {
      targetRecord = this.localities.find((l) => l.id === id);
      tableName = 'localities';
    } else if (type === 'pincode') {
      targetRecord = this.pincodes.find((p) => p.id === id);
      tableName = 'pincodes';
    }

    if (!targetRecord) {
      return { success: false, error: `${type} with ID "${id}" not found.` };
    }

    targetRecord.isActive = isActive;
    targetRecord.updatedAt = new Date().toISOString();

    const actionDesc = `Admin Toggled ${type} Status: "${targetRecord.name || targetRecord.pincode}" (${id}) -> ${isActive ? 'ACTIVE' : 'INACTIVE'}`;
    this.recordAuditAction(actionDesc, adminId, 0, 1);

    if (tableName) {
      try {
        await supabaseAdmin.from(tableName).update({ is_active: isActive, updated_at: targetRecord.updatedAt }).eq('id', id);
      } catch {}
    }

    return { success: true, record: targetRecord };
  }

  private recordAuditAction(desc: string, adminId: string, added: number, updated: number) {
    const logItem: LocationImportLog = {
      id: `log_audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      source: desc,
      fileName: 'admin_action',
      importDate: new Date().toISOString(),
      recordsAdded: added,
      recordsUpdated: updated,
      recordsRejected: 0,
      status: 'completed',
      isDryRun: false,
      triggeredBy: adminId,
      createdAt: new Date().toISOString(),
    };
    this.importLogs.unshift(logItem);
  }

  getDuplicateCandidates(datasetType: 'states' | 'districts' | 'cities' | 'pincodes' = 'cities') {
    const candidates: Array<{ key: string; count: number; items: any[] }> = [];

    if (datasetType === 'cities') {
      const grouped = new Map<string, CityRecord[]>();
      this.cities.forEach((c) => {
        const k = `${c.districtId}_${c.name.toLowerCase().trim()}`;
        const arr = grouped.get(k) || [];
        arr.push(c);
        grouped.set(k, arr);
      });
      grouped.forEach((items, key) => {
        if (items.length > 1) candidates.push({ key, count: items.length, items });
      });
    } else if (datasetType === 'districts') {
      const grouped = new Map<string, DistrictRecord[]>();
      this.districts.forEach((d) => {
        const k = `${d.stateId}_${d.name.toLowerCase().trim()}`;
        const arr = grouped.get(k) || [];
        arr.push(d);
        grouped.set(k, arr);
      });
      grouped.forEach((items, key) => {
        if (items.length > 1) candidates.push({ key, count: items.length, items });
      });
    }

    return candidates;
  }

  async updateSuggestionStatus(
    id: string,
    status: 'approved' | 'rejected',
    adminNotes?: string,
    adminId: string = 'admin'
  ): Promise<LocationSuggestion | null> {
    const sug = this.suggestions.find((s) => s.id === id);
    if (!sug) return null;

    sug.status = status;
    if (adminNotes) sug.adminNotes = adminNotes;
    sug.updatedAt = new Date().toISOString();

    // If approved, automatically create the missing record based on locationType
    if (status === 'approved') {
      const matchedState = this.states.find(
        (s) => s.name.toLowerCase() === sug.stateName.toLowerCase() || s.id === sug.stateName
      );
      const matchedDistrict = matchedState
        ? this.districts.find(
            (d) =>
              d.stateId === matchedState.id &&
              (sug.districtName ? d.name.toLowerCase() === sug.districtName.toLowerCase() : true)
          )
        : undefined;

      if (sug.locationType === 'city' || sug.locationType === 'town') {
        if (matchedDistrict) {
          const newCity: CityRecord = {
            id: `cty_${Date.now()}`,
            districtId: matchedDistrict.id,
            name: sug.name,
            cityType: sug.locationType === 'town' ? 'Census Town' : 'Municipality',
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          this.cities.push(newCity);
          this.recordAuditAction(`Approved Suggestion: Added City ${newCity.name}`, adminId, 1, 0);
          try {
            await supabaseAdmin.from('cities').insert({
              id: newCity.id,
              district_id: newCity.districtId,
              name: newCity.name,
              city_type: newCity.cityType,
              is_active: true,
            });
          } catch {}
        }
      } else if (sug.locationType === 'village') {
        if (matchedDistrict) {
          const newVillage: VillageRecord = {
            id: `vil_${Date.now()}`,
            districtId: matchedDistrict.id,
            name: sug.name,
            pincode: sug.pincode,
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          this.villages.push(newVillage);
          this.recordAuditAction(`Approved Suggestion: Added Village ${newVillage.name}`, adminId, 1, 0);
        }
      } else if (sug.locationType === 'locality') {
        const matchedCity = matchedDistrict
          ? this.cities.find((c) => c.districtId === matchedDistrict.id && sug.cityName && c.name.toLowerCase() === sug.cityName.toLowerCase())
          : undefined;
        if (matchedCity) {
          const newLocality: LocalityRecord = {
            id: `loc_${Date.now()}`,
            cityId: matchedCity.id,
            name: sug.name,
            pincode: sug.pincode,
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          this.localities.push(newLocality);
          this.recordAuditAction(`Approved Suggestion: Added Locality ${newLocality.name} in ${matchedCity.name}`, adminId, 1, 0);
        }
      } else if (sug.locationType === 'district' && matchedState) {
        const newDistrict: DistrictRecord = {
          id: `dst_${matchedState.id}_${sug.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          stateId: matchedState.id,
          name: sug.name,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        this.districts.push(newDistrict);
        this.recordAuditAction(`Approved Suggestion: Added District ${newDistrict.name} in ${matchedState.name}`, adminId, 1, 0);
      }
    }

    try {
      await supabaseAdmin
        .from('location_suggestions')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch {}

    return sug;
  }

  // =========================================================================
  // IMPORT PIPELINE EXECUTION
  // =========================================================================

  async runImport(params: {
    datasetType: 'states' | 'districts' | 'cities' | 'villages' | 'localities' | 'pincodes';
    source: 'LGD' | 'OGD_INDIA' | 'INDIA_POST' | 'CUSTOM_CSV' | 'CUSTOM_JSON';
    rawContent: string;
    isCsv?: boolean;
    fileName?: string;
    dryRun?: boolean;
    adminId?: string;
  }): Promise<ImportReport> {
    const options: ImportOptions = {
      source: params.source,
      fileName: params.fileName,
      dryRun: params.dryRun,
      adminId: params.adminId,
    };

    let items: any[] = [];
    if (params.isCsv) {
      items = parseCSV(params.rawContent);
    } else {
      try {
        const parsed = JSON.parse(params.rawContent);
        items = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return {
          source: params.source,
          fileName: params.fileName,
          isDryRun: !!params.dryRun,
          totalProcessed: 0,
          recordsAdded: 0,
          recordsUpdated: 0,
          recordsRejected: 0,
          status: 'failed',
          errors: [{ row: 1, message: `JSON syntax error: ${(e as Error).message}` }],
          timestamp: new Date().toISOString(),
        };
      }
    }

    let report: ImportReport;

    if (params.datasetType === 'states') {
      const res = LocationImportPipeline.processStates(items, this.states, options);
      report = res.report;
      if (!options.dryRun) this.states = res.updatedList;
    } else if (params.datasetType === 'districts') {
      const res = LocationImportPipeline.processDistricts(items, this.districts, this.states, options);
      report = res.report;
      if (!options.dryRun) this.districts = res.updatedList;
    } else if (params.datasetType === 'cities') {
      const res = LocationImportPipeline.processCities(items, this.cities, this.districts, options);
      report = res.report;
      if (!options.dryRun) this.cities = res.updatedList;
    } else if (params.datasetType === 'villages') {
      const res = LocationImportPipeline.processVillages(items, this.villages, this.districts, options);
      report = res.report;
      if (!options.dryRun) this.villages = res.updatedList;
    } else if (params.datasetType === 'localities') {
      const res = LocationImportPipeline.processLocalities(items, this.localities, this.cities, options);
      report = res.report;
      if (!options.dryRun) this.localities = res.updatedList;
    } else if (params.datasetType === 'pincodes') {
      const res = LocationImportPipeline.processPincodes(items, this.pincodes, this.districts, this.states, options);
      report = res.report;
      if (!options.dryRun) this.pincodes = res.updatedList;
    } else {
      throw new Error(`Unsupported dataset type: ${params.datasetType}`);
    }

    // Record import log
    const logItem: LocationImportLog = {
      id: `log_${Date.now()}`,
      source: `${params.source} (${params.datasetType})`,
      fileName: params.fileName,
      importDate: new Date().toISOString(),
      recordsAdded: report.recordsAdded,
      recordsUpdated: report.recordsUpdated,
      recordsRejected: report.recordsRejected,
      status: report.status,
      isDryRun: report.isDryRun,
      errorDetails: report.errors,
      triggeredBy: params.adminId || 'admin_console',
      createdAt: new Date().toISOString(),
    };

    this.importLogs.unshift(logItem);

    // Save log to Supabase
    try {
      await supabaseAdmin.from('location_import_logs').insert({
        id: logItem.id,
        source: logItem.source,
        file_name: logItem.fileName,
        records_added: logItem.recordsAdded,
        records_updated: logItem.recordsUpdated,
        records_rejected: logItem.recordsRejected,
        status: logItem.status,
        is_dry_run: logItem.isDryRun,
        error_details: logItem.errorDetails,
        triggered_by: logItem.triggeredBy,
      });
    } catch {}

    return report;
  }

  getImportLogs(params: { limit?: number; offset?: number } = {}) {
    const offset = params.offset || 0;
    const limit = params.limit || 20;
    return {
      total: this.importLogs.length,
      items: this.importLogs.slice(offset, offset + limit),
    };
  }

  // =========================================================================
  // COVERAGE STATS
  // =========================================================================

  getLocationStats() {
    const statesCount = this.states.length;
    const districtsCount = this.districts.length;
    const citiesCount = this.cities.length;
    const villagesCount = this.villages.length;
    const pincodesCount = this.pincodes.length;
    const localitiesCount = this.localities.length;
    const pendingSuggestions = this.suggestions.filter((s) => s.status === 'pending').length;

    // Calculate coverage metrics: 36 States/UTs expected, 760+ districts expected
    const stateCoveragePercent = Math.min(100, Math.round((statesCount / 36) * 100));
    const districtCoveragePercent = Math.min(100, Math.round((districtsCount / 765) * 100));

    return {
      statesCount,
      districtsCount,
      citiesCount,
      villagesCount,
      pincodesCount,
      localitiesCount,
      pendingSuggestions,
      coverage: {
        stateCoveragePercent,
        districtCoveragePercent,
        hasAllStatesAndUTs: statesCount >= 36,
      },
      lastSync: this.importLogs[0]?.importDate || new Date().toISOString(),
    };
  }
}

// Global Singleton
export const locationDb = new LocationDatabaseService();
