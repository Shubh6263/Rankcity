import {
  StateRecord,
  DistrictRecord,
  CityRecord,
  VillageRecord,
  LocalityRecord,
  PincodeRecord,
  LocationImportLog,
} from '@/types';

export interface ImportErrorItem {
  row: number;
  field?: string;
  code?: string;
  message: string;
  data?: any;
}

export interface ImportReport {
  source: string;
  fileName?: string;
  isDryRun: boolean;
  totalProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  recordsRejected: number;
  status: 'completed' | 'failed' | 'dry_run';
  errors: ImportErrorItem[];
  sampleProcessed?: any[];
  timestamp: string;
}

export interface ImportOptions {
  source: 'LGD' | 'OGD_INDIA' | 'INDIA_POST' | 'CUSTOM_CSV' | 'CUSTOM_JSON';
  fileName?: string;
  dryRun?: boolean;
  adminId?: string;
}

/**
 * Normalizes text while preserving official uppercase abbreviations and Hindi characters.
 */
export function normalizeLocationName(name: string): string {
  if (!name) return '';
  // Normalize multiple spaces and trim
  return name.trim().replace(/\s+/g, ' ');
}

export function slugifyLocation(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Robust CSV parser handling quotes, commas inside fields, and trimming
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx] !== undefined ? values[idx].trim() : '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let insideQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      result.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}

/**
 * Ingestion and validation processor for raw records (CSV or JSON)
 */
export class LocationImportPipeline {
  /**
   * Process States import
   */
  static processStates(
    rawItems: any[],
    existingStates: StateRecord[],
    options: ImportOptions
  ): { report: ImportReport; updatedList: StateRecord[] } {
    let added = 0;
    let updated = 0;
    let rejected = 0;
    const errors: ImportErrorItem[] = [];
    const resultMap = new Map<string, StateRecord>();
    existingStates.forEach((s) => resultMap.set(s.code.toUpperCase(), { ...s }));

    rawItems.forEach((row, idx) => {
      const rowNum = idx + 1;
      const name = normalizeLocationName(row.name || row.state_name || row['State Name'] || '');
      const code = (row.code || row.state_code || row['State Code'] || '').trim().toUpperCase();
      const lgdCode = Number(row.lgdCode || row.lgd_code || row['LGD Code'] || 0) || undefined;
      const type = (row.type || row['Type'] || 'STATE').toUpperCase() === 'UT' ? 'UT' : 'STATE';
      const nameHi = row.nameHi || row.name_hi || row['Hindi Name'] || undefined;
      const capital = row.capital || row['Capital'] || undefined;

      if (!name) {
        rejected++;
        errors.push({ row: rowNum, field: 'name', message: 'Missing state name', data: row });
        return;
      }

      if (!code && !lgdCode) {
        rejected++;
        errors.push({ row: rowNum, field: 'code', message: 'Missing state code and LGD code', data: row });
        return;
      }

      const lookupKey = code || `LGD_${lgdCode}`;
      const existing = resultMap.get(lookupKey);

      if (existing) {
        // Update
        if (!options.dryRun) {
          existing.name = name;
          if (nameHi) existing.nameHi = nameHi;
          if (lgdCode) existing.lgdCode = lgdCode;
          if (capital) existing.capital = capital;
          existing.type = type;
          existing.updatedAt = new Date().toISOString();
        }
        updated++;
      } else {
        // Insert
        const id = `st_${code ? code.toLowerCase() : lgdCode}`;
        const newRecord: StateRecord = {
          id,
          name,
          nameHi,
          code: code || `IN-${lgdCode}`,
          lgdCode,
          type,
          capital,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (!options.dryRun) {
          resultMap.set(lookupKey, newRecord);
        }
        added++;
      }
    });

    const report: ImportReport = {
      source: options.source,
      fileName: options.fileName,
      isDryRun: !!options.dryRun,
      totalProcessed: rawItems.length,
      recordsAdded: added,
      recordsUpdated: updated,
      recordsRejected: rejected,
      status: options.dryRun ? 'dry_run' : rejected > 0 && added === 0 ? 'failed' : 'completed',
      errors: errors.slice(0, 50),
      timestamp: new Date().toISOString(),
    };

    return { report, updatedList: Array.from(resultMap.values()) };
  }

  /**
   * Process Districts import
   */
  static processDistricts(
    rawItems: any[],
    existingDistricts: DistrictRecord[],
    availableStates: StateRecord[],
    options: ImportOptions
  ): { report: ImportReport; updatedList: DistrictRecord[] } {
    let added = 0;
    let updated = 0;
    let rejected = 0;
    const errors: ImportErrorItem[] = [];

    const stateByLgd = new Map<number, StateRecord>();
    const stateByCode = new Map<string, StateRecord>();
    const stateByName = new Map<string, StateRecord>();

    availableStates.forEach((st) => {
      if (st.lgdCode) stateByLgd.set(st.lgdCode, st);
      stateByCode.set(st.code.toUpperCase(), st);
      stateByName.set(st.name.toLowerCase(), st);
    });

    const resultMap = new Map<string, DistrictRecord>();
    existingDistricts.forEach((d) => {
      resultMap.set(`${d.stateId}_${d.name.toLowerCase()}`, { ...d });
      if (d.lgdCode) resultMap.set(`LGD_${d.lgdCode}`, { ...d });
    });

    rawItems.forEach((row, idx) => {
      const rowNum = idx + 1;
      const name = normalizeLocationName(row.name || row.district_name || row['District Name'] || '');
      const stateLgd = Number(row.stateLgdCode || row.state_lgd_code || row['State LGD Code'] || 0) || undefined;
      const stateCode = (row.stateCode || row.state_code || row['State Code'] || '').trim().toUpperCase();
      const stateName = (row.stateName || row.state_name || row['State Name'] || '').trim().toLowerCase();
      const lgdCode = Number(row.lgdCode || row.lgd_code || row['LGD Code'] || 0) || undefined;
      const nameHi = row.nameHi || row.name_hi || row['Hindi Name'] || undefined;
      const headquarter = row.headquarter || row['Headquarter'] || undefined;

      if (!name) {
        rejected++;
        errors.push({ row: rowNum, field: 'name', message: 'Missing district name', data: row });
        return;
      }

      // Resolve parent state
      let resolvedState: StateRecord | undefined;
      if (stateLgd && stateByLgd.has(stateLgd)) resolvedState = stateByLgd.get(stateLgd);
      else if (stateCode && stateByCode.has(stateCode)) resolvedState = stateByCode.get(stateCode);
      else if (stateName && stateByName.has(stateName)) resolvedState = stateByName.get(stateName);
      else if (row.stateId) resolvedState = availableStates.find((s) => s.id === row.stateId);

      if (!resolvedState) {
        rejected++;
        errors.push({
          row: rowNum,
          field: 'stateId',
          message: `Parent state could not be resolved for district "${name}". State ref: ${stateLgd || stateCode || stateName || row.stateId}`,
          data: row,
        });
        return;
      }

      const lookupKey = lgdCode ? `LGD_${lgdCode}` : `${resolvedState.id}_${name.toLowerCase()}`;
      const existing = resultMap.get(lookupKey);

      if (existing) {
        if (!options.dryRun) {
          existing.name = name;
          if (nameHi) existing.nameHi = nameHi;
          if (lgdCode) existing.lgdCode = lgdCode;
          if (headquarter) existing.headquarter = headquarter;
          existing.updatedAt = new Date().toISOString();
        }
        updated++;
      } else {
        const id = lgdCode ? `dst_${resolvedState.lgdCode || resolvedState.code.toLowerCase()}_${lgdCode}` : `dst_${resolvedState.id}_${slugifyLocation(name)}`;
        const newRecord: DistrictRecord = {
          id,
          stateId: resolvedState.id,
          stateLgdCode: resolvedState.lgdCode,
          name,
          nameHi,
          lgdCode,
          headquarter,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (!options.dryRun) {
          resultMap.set(lookupKey, newRecord);
        }
        added++;
      }
    });

    const report: ImportReport = {
      source: options.source,
      fileName: options.fileName,
      isDryRun: !!options.dryRun,
      totalProcessed: rawItems.length,
      recordsAdded: added,
      recordsUpdated: updated,
      recordsRejected: rejected,
      status: options.dryRun ? 'dry_run' : rejected > 0 && added === 0 ? 'failed' : 'completed',
      errors: errors.slice(0, 50),
      timestamp: new Date().toISOString(),
    };

    return { report, updatedList: Array.from(resultMap.values()) };
  }

  /**
   * Process Cities / Urban Local Bodies import
   */
  static processCities(
    rawItems: any[],
    existingCities: CityRecord[],
    availableDistricts: DistrictRecord[],
    options: ImportOptions
  ): { report: ImportReport; updatedList: CityRecord[] } {
    let added = 0;
    let updated = 0;
    let rejected = 0;
    const errors: ImportErrorItem[] = [];

    const districtByLgd = new Map<number, DistrictRecord>();
    const districtByName = new Map<string, DistrictRecord>();

    availableDistricts.forEach((d) => {
      if (d.lgdCode) districtByLgd.set(d.lgdCode, d);
      districtByName.set(d.name.toLowerCase(), d);
    });

    const resultMap = new Map<string, CityRecord>();
    existingCities.forEach((c) => {
      resultMap.set(`${c.districtId}_${c.name.toLowerCase()}`, { ...c });
      if (c.lgdCode) resultMap.set(`LGD_${c.lgdCode}`, { ...c });
    });

    rawItems.forEach((row, idx) => {
      const rowNum = idx + 1;
      const name = normalizeLocationName(row.name || row.city_name || row['City Name'] || '');
      const districtLgd = Number(row.districtLgdCode || row.district_lgd_code || row['District LGD Code'] || 0) || undefined;
      const districtName = (row.districtName || row.district_name || row['District Name'] || '').trim().toLowerCase();
      const lgdCode = Number(row.lgdCode || row.lgd_code || row['LGD Code'] || 0) || undefined;
      const cityType = row.cityType || row.city_type || row['City Type'] || 'Municipal Corporation';
      const nameHi = row.nameHi || row.name_hi || row['Hindi Name'] || undefined;
      const latitude = Number(row.latitude || row['Latitude']) || undefined;
      const longitude = Number(row.longitude || row['Longitude']) || undefined;

      if (!name) {
        rejected++;
        errors.push({ row: rowNum, field: 'name', message: 'Missing city name', data: row });
        return;
      }

      let resolvedDistrict: DistrictRecord | undefined;
      if (districtLgd && districtByLgd.has(districtLgd)) resolvedDistrict = districtByLgd.get(districtLgd);
      else if (districtName && districtByName.has(districtName)) resolvedDistrict = districtByName.get(districtName);
      else if (row.districtId) resolvedDistrict = availableDistricts.find((d) => d.id === row.districtId);

      if (!resolvedDistrict) {
        rejected++;
        errors.push({
          row: rowNum,
          field: 'districtId',
          message: `Parent district could not be resolved for city "${name}". District ref: ${districtLgd || districtName || row.districtId}`,
          data: row,
        });
        return;
      }

      const lookupKey = lgdCode ? `LGD_${lgdCode}` : `${resolvedDistrict.id}_${name.toLowerCase()}`;
      const existing = resultMap.get(lookupKey);

      if (existing) {
        if (!options.dryRun) {
          existing.name = name;
          if (nameHi) existing.nameHi = nameHi;
          if (lgdCode) existing.lgdCode = lgdCode;
          if (cityType) existing.cityType = cityType;
          if (latitude) existing.latitude = latitude;
          if (longitude) existing.longitude = longitude;
          existing.updatedAt = new Date().toISOString();
        }
        updated++;
      } else {
        const id = lgdCode ? `cty_${lgdCode}` : `cty_${slugifyLocation(name)}_${resolvedDistrict.id.replace('dst_', '')}`;
        const newRecord: CityRecord = {
          id,
          districtId: resolvedDistrict.id,
          name,
          nameHi,
          cityType,
          lgdCode,
          latitude,
          longitude,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (!options.dryRun) {
          resultMap.set(lookupKey, newRecord);
        }
        added++;
      }
    });

    const report: ImportReport = {
      source: options.source,
      fileName: options.fileName,
      isDryRun: !!options.dryRun,
      totalProcessed: rawItems.length,
      recordsAdded: added,
      recordsUpdated: updated,
      recordsRejected: rejected,
      status: options.dryRun ? 'dry_run' : rejected > 0 && added === 0 ? 'failed' : 'completed',
      errors: errors.slice(0, 50),
      timestamp: new Date().toISOString(),
    };

    return { report, updatedList: Array.from(resultMap.values()) };
  }

  /**
   * Process India Post PIN Codes import
   * Supports one PIN code mapping to multiple post offices or localities
   */
  static processPincodes(
    rawItems: any[],
    existingPincodes: PincodeRecord[],
    availableDistricts: DistrictRecord[],
    availableStates: StateRecord[],
    options: ImportOptions
  ): { report: ImportReport; updatedList: PincodeRecord[] } {
    let added = 0;
    let updated = 0;
    let rejected = 0;
    const errors: ImportErrorItem[] = [];

    const districtByName = new Map<string, DistrictRecord>();
    availableDistricts.forEach((d) => districtByName.set(d.name.toLowerCase(), d));

    const stateByName = new Map<string, StateRecord>();
    availableStates.forEach((s) => stateByName.set(s.name.toLowerCase(), s));

    const resultMap = new Map<string, PincodeRecord>();
    existingPincodes.forEach((p) => {
      resultMap.set(`${p.pincode}_${p.postOfficeName.toLowerCase()}`, { ...p });
    });

    rawItems.forEach((row, idx) => {
      const rowNum = idx + 1;
      const pincode = String(row.pincode || row['Pincode'] || row['PIN Code'] || '').trim();
      const postOfficeName = normalizeLocationName(row.postOfficeName || row.post_office_name || row['Post Office Name'] || row['Office Name'] || '');
      const districtName = (row.districtName || row.district_name || row['District'] || '').trim().toLowerCase();
      const stateName = (row.stateName || row.state_name || row['State'] || '').trim().toLowerCase();

      // PIN code validation: 6 digits
      if (!/^\d{6}$/.test(pincode)) {
        rejected++;
        errors.push({
          row: rowNum,
          field: 'pincode',
          message: `Invalid 6-digit Indian PIN code format: "${pincode}"`,
          data: row,
        });
        return;
      }

      if (!postOfficeName) {
        rejected++;
        errors.push({ row: rowNum, field: 'postOfficeName', message: 'Missing post office name', data: row });
        return;
      }

      const matchedDistrict = districtByName.get(districtName) || availableDistricts.find((d) => d.id === row.districtId);
      const matchedState = stateByName.get(stateName) || (matchedDistrict ? availableStates.find((s) => s.id === matchedDistrict.stateId) : undefined);

      const lookupKey = `${pincode}_${postOfficeName.toLowerCase()}`;
      const existing = resultMap.get(lookupKey);

      if (existing) {
        if (!options.dryRun) {
          if (matchedDistrict) existing.districtId = matchedDistrict.id;
          if (matchedState) existing.stateId = matchedState.id;
          if (row.circle) existing.circle = row.circle;
          if (row.officeType) existing.officeType = row.officeType;
          existing.updatedAt = new Date().toISOString();
        }
        updated++;
      } else {
        const id = `pin_${pincode}_${slugifyLocation(postOfficeName) || rowNum}`;
        const newRecord: PincodeRecord = {
          id,
          pincode,
          postOfficeName,
          districtId: matchedDistrict?.id,
          stateId: matchedState?.id,
          circle: row.circle || row['Circle'] || undefined,
          region: row.region || row['Region'] || undefined,
          division: row.division || row['Division'] || undefined,
          officeType: row.officeType || row['Office Type'] || 'S.O.',
          deliveryStatus: row.deliveryStatus || row['Delivery Status'] || 'Delivery',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (!options.dryRun) {
          resultMap.set(lookupKey, newRecord);
        }
        added++;
      }
    });

    const report: ImportReport = {
      source: options.source,
      fileName: options.fileName,
      isDryRun: !!options.dryRun,
      totalProcessed: rawItems.length,
      recordsAdded: added,
      recordsUpdated: updated,
      recordsRejected: rejected,
      status: options.dryRun ? 'dry_run' : rejected > 0 && added === 0 ? 'failed' : 'completed',
      errors: errors.slice(0, 50),
      timestamp: new Date().toISOString(),
    };

    return { report, updatedList: Array.from(resultMap.values()) };
  }

  /**
   * Process Villages import
   */
  static processVillages(
    rawItems: any[],
    existingVillages: VillageRecord[],
    availableDistricts: DistrictRecord[],
    options: ImportOptions
  ): { report: ImportReport; updatedList: VillageRecord[] } {
    let added = 0;
    let updated = 0;
    let rejected = 0;
    const errors: ImportErrorItem[] = [];

    const districtByName = new Map<string, DistrictRecord>();
    const districtById = new Map<string, DistrictRecord>();
    const districtByLgd = new Map<number, DistrictRecord>();

    availableDistricts.forEach((d) => {
      districtByName.set(d.name.toLowerCase(), d);
      districtById.set(d.id, d);
      if (d.lgdCode) districtByLgd.set(d.lgdCode, d);
    });

    const resultMap = new Map<string, VillageRecord>();
    existingVillages.forEach((v) => {
      resultMap.set(`${v.districtId}_${v.name.toLowerCase()}`, { ...v });
      if (v.lgdCode) resultMap.set(`LGD_${v.lgdCode}`, { ...v });
    });

    rawItems.forEach((row, idx) => {
      const rowNum = idx + 1;
      const name = normalizeLocationName(row.name || row.village_name || row['Village Name'] || '');
      const districtRef = (row.districtName || row.district_name || row.districtId || row['District'] || '').trim();
      const districtLgd = Number(row.districtLgdCode || row.district_lgd_code || row['District LGD Code'] || 0) || undefined;
      const subdistrictId = row.subdistrictId || row.subdistrict_id || row['Subdistrict'] || undefined;
      const lgdCode = Number(row.lgdCode || row.lgd_code || row['LGD Code'] || 0) || undefined;
      const nameHi = row.nameHi || row.name_hi || row['Hindi Name'] || undefined;
      const pincode = row.pincode || row['Pincode'] || undefined;

      if (!name) {
        rejected++;
        errors.push({ row: rowNum, field: 'name', message: 'Missing village name', data: row });
        return;
      }

      let matchedDistrict: DistrictRecord | undefined;
      if (districtLgd && districtByLgd.has(districtLgd)) matchedDistrict = districtByLgd.get(districtLgd);
      else if (districtRef && districtByName.has(districtRef.toLowerCase())) matchedDistrict = districtByName.get(districtRef.toLowerCase());
      else if (districtRef && districtById.has(districtRef)) matchedDistrict = districtById.get(districtRef);

      if (!matchedDistrict) {
        rejected++;
        errors.push({
          row: rowNum,
          field: 'districtId',
          message: `Parent district could not be resolved for village "${name}". Ref: ${districtRef || districtLgd}`,
          data: row,
        });
        return;
      }

      const lookupKey = lgdCode ? `LGD_${lgdCode}` : `${matchedDistrict.id}_${name.toLowerCase()}`;
      const existing = resultMap.get(lookupKey);

      if (existing) {
        if (!options.dryRun) {
          existing.name = name;
          if (nameHi) existing.nameHi = nameHi;
          if (lgdCode) existing.lgdCode = lgdCode;
          if (subdistrictId) existing.subdistrictId = subdistrictId;
          if (pincode) existing.pincode = pincode;
          existing.updatedAt = new Date().toISOString();
        }
        updated++;
      } else {
        const id = lgdCode ? `vil_${lgdCode}` : `vil_${slugifyLocation(name)}_${matchedDistrict.id.replace('dst_', '')}`;
        const newRecord: VillageRecord = {
          id,
          districtId: matchedDistrict.id,
          subdistrictId,
          name,
          nameHi,
          lgdCode,
          pincode,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (!options.dryRun) {
          resultMap.set(lookupKey, newRecord);
        }
        added++;
      }
    });

    const report: ImportReport = {
      source: options.source,
      fileName: options.fileName,
      isDryRun: !!options.dryRun,
      totalProcessed: rawItems.length,
      recordsAdded: added,
      recordsUpdated: updated,
      recordsRejected: rejected,
      status: options.dryRun ? 'dry_run' : rejected > 0 && added === 0 ? 'failed' : 'completed',
      errors: errors.slice(0, 50),
      timestamp: new Date().toISOString(),
    };

    return { report, updatedList: Array.from(resultMap.values()) };
  }

  /**
   * Process Localities import
   */
  static processLocalities(
    rawItems: any[],
    existingLocalities: LocalityRecord[],
    availableCities: CityRecord[],
    options: ImportOptions
  ): { report: ImportReport; updatedList: LocalityRecord[] } {
    let added = 0;
    let updated = 0;
    let rejected = 0;
    const errors: ImportErrorItem[] = [];

    const cityByName = new Map<string, CityRecord>();
    const cityById = new Map<string, CityRecord>();

    availableCities.forEach((c) => {
      cityByName.set(c.name.toLowerCase(), c);
      cityById.set(c.id, c);
    });

    const resultMap = new Map<string, LocalityRecord>();
    existingLocalities.forEach((l) => {
      resultMap.set(`${l.cityId}_${l.name.toLowerCase()}`, { ...l });
    });

    rawItems.forEach((row, idx) => {
      const rowNum = idx + 1;
      const name = normalizeLocationName(row.name || row.locality_name || row['Locality Name'] || '');
      const cityRef = (row.cityName || row.city_name || row.cityId || row['City'] || '').trim();
      const pincode = row.pincode || row['Pincode'] || undefined;
      const latitude = Number(row.latitude || row['Latitude']) || undefined;
      const longitude = Number(row.longitude || row['Longitude']) || undefined;

      if (!name) {
        rejected++;
        errors.push({ row: rowNum, field: 'name', message: 'Missing locality name', data: row });
        return;
      }

      let matchedCity: CityRecord | undefined;
      if (cityRef && cityByName.has(cityRef.toLowerCase())) matchedCity = cityByName.get(cityRef.toLowerCase());
      else if (cityRef && cityById.has(cityRef)) matchedCity = cityById.get(cityRef);

      if (!matchedCity) {
        rejected++;
        errors.push({
          row: rowNum,
          field: 'cityId',
          message: `Parent city could not be resolved for locality "${name}". City ref: ${cityRef}`,
          data: row,
        });
        return;
      }

      const lookupKey = `${matchedCity.id}_${name.toLowerCase()}`;
      const existing = resultMap.get(lookupKey);

      if (existing) {
        if (!options.dryRun) {
          existing.name = name;
          if (pincode) existing.pincode = pincode;
          if (latitude) existing.latitude = latitude;
          if (longitude) existing.longitude = longitude;
          existing.updatedAt = new Date().toISOString();
        }
        updated++;
      } else {
        const id = `loc_${slugifyLocation(name)}_${matchedCity.id.replace('cty_', '')}`;
        const newRecord: LocalityRecord = {
          id,
          cityId: matchedCity.id,
          name,
          pincode,
          latitude,
          longitude,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (!options.dryRun) {
          resultMap.set(lookupKey, newRecord);
        }
        added++;
      }
    });

    const report: ImportReport = {
      source: options.source,
      fileName: options.fileName,
      isDryRun: !!options.dryRun,
      totalProcessed: rawItems.length,
      recordsAdded: added,
      recordsUpdated: updated,
      recordsRejected: rejected,
      status: options.dryRun ? 'dry_run' : rejected > 0 && added === 0 ? 'failed' : 'completed',
      errors: errors.slice(0, 50),
      timestamp: new Date().toISOString(),
    };

    return { report, updatedList: Array.from(resultMap.values()) };
  }
}

