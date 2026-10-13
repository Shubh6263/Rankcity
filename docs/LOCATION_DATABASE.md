# RankCity — India Location Database System Documentation

## 1. Architectural Overview

The RankCity India Location Management System provides an authoritative, hierarchical, and scalable database of Indian geographical entities. It powers registration, discovery, ranking, and verification for businesses across all **28 States and 8 Union Territories**.

### Entity Hierarchy

```
Country (India)
   │
   ├── States & Union Territories (36 entities, ISO 3166-2:IN, LGD State Codes)
   │     │
   │     └── Administrative Districts (760+ entities, LGD District Codes)
   │           │
   │           ├── Urban Local Bodies / Cities / Towns (Corporations, Municipalities, Census Towns)
   │           │     │
   │           │     └── Localities / Neighborhoods / Wards
   │           │
   │           └── Villages / Rural Revenue Entities (Tehsil / Taluk LGD links)
   │
   └── Postal PIN Codes (6-Digit Indian Post Office Network, Circle, Region, Division)
```

Unlike simplistic systems that assume a 1:1 relationship between cities and postal codes, RankCity properly models:
- **1 PIN code mapping to multiple Post Offices or localities** (e.g. `452010` covers both Vijay Nagar S.O. and Sukhlia S.O.).
- **Same-named cities in different states/districts** (e.g. Bilaspur in Chhattisgarh vs Bilaspur in Himachal Pradesh; Rampur in UP vs Rampur in Bihar) are bound to distinct district and state IDs to prevent accidental grouping in search and auction rankings.
- **Urban Local Bodies vs Rural Revenue Villages** are handled via explicit settlement types.

---

## 2. Authoritative Data Sources

RankCity relies exclusively on legitimate, published Government of India datasets:

| Data Entity | Authoritative Source | Official URL | Licensing & Access Method |
| :--- | :--- | :--- | :--- |
| **States & UTs** | Local Government Directory (LGD), Ministry of Panchayati Raj | `https://lgdirectory.gov.in/` | Open Govt Data (OGD) India. Direct LGD codes 1 to 38. |
| **Districts** | Local Government Directory (LGD) | `https://lgdirectory.gov.in/` | Published gazette notifications. 760+ administrative units. |
| **Urban Local Bodies (ULBs)** | Ministry of Housing & Urban Affairs (MoHUA) / OGD | `https://data.gov.in/` | National Data Sharing and Accessibility Policy (NDSAP). |
| **Census Towns & Villages** | Registrar General & Census Commissioner of India / LGD | `https://lgdirectory.gov.in/` | Ministry of Panchayati Raj village directories. |
| **PIN Codes & Post Offices** | Department of Posts, Ministry of Communications | `https://data.gov.in/` / `https://www.indiapost.gov.in/` | All India PIN Code Directory. Direct CSV/API fallback. |

> **Official API Credentials Notice**: Direct API endpoints on `data.gov.in` require an API Key obtained by registering at `https://data.gov.in/user/register`. For environments without live API credentials, RankCity bundles verified seed files in `data/locations/` and provides an automated CSV/JSON bulk-import pipeline.

---

## 3. Database Schema & Migration

### Schema Migration File
The complete PostgreSQL migration script is located at:
`supabase/migrations/20261014_india_location_hierarchy.sql`

To apply the migration:
1. Open your **Supabase Dashboard** (`https://supabase.com/dashboard/project/<PROJECT_ID>`).
2. Go to **SQL Editor** -> **New Query**.
3. Paste the contents of `supabase/migrations/20261014_india_location_hierarchy.sql` and click **Run**.

### Relational Tables Summary

- `states`: Primary key `id` (e.g. `st_23`), `name`, `name_hi`, `code` (`MP`), `lgd_code` (`23`), `type` (`STATE` / `UT`), `capital`, `is_active`.
- `districts`: `id` (e.g. `dst_23_indore`), `state_id`, `name`, `name_hi`, `lgd_code` (`412`), `headquarter`, `is_active`.
- `cities`: `id` (e.g. `cty_indore`), `district_id`, `name`, `name_hi`, `city_type` (`Municipal Corporation`), `lgd_code`, `latitude`, `longitude`, `is_active`.
- `villages`: `id`, `district_id`, `subdistrict_id`, `name`, `name_hi`, `lgd_code`, `pincode`, `is_active`.
- `localities`: `id`, `city_id`, `name`, `pincode`, `latitude`, `longitude`, `is_active`.
- `pincodes`: `id`, `pincode`, `post_office_name`, `district_id`, `state_id`, `circle`, `region`, `division`, `office_type`, `delivery_status`, `is_active`.
- `location_import_logs`: `id`, `source`, `file_name`, `import_date`, `records_added`, `records_updated`, `records_rejected`, `status`, `is_dry_run`, `error_details`.
- `location_suggestions`: `id`, `location_type`, `name`, `state_name`, `district_name`, `city_name`, `pincode`, `submitted_by_user_id`, `notes`, `status` (`pending` / `approved` / `rejected`), `admin_notes`.

### Row Level Security (RLS)
- Public read access is granted for active records (`is_active = true`) in `states`, `districts`, `cities`, `villages`, `localities`, and `pincodes`.
- Public insert access is granted for `location_suggestions` so registering businesses can suggest missing towns.
- Full read/write access is restricted to `service_role` and administrative controllers.

---

## 4. Bulk Data Ingestion Pipeline

The import engine (`lib/location/importer.ts`) is fully idempotent and supports both JSON and CSV files.

### Key Capabilities
1. **Parent-Child Resolution by Official Codes First**: Resolves parent states and districts using official LGD codes first, falling back to normalized name matching.
2. **Whitespace and Case Normalization**: Trims duplicate whitespace, handles title casing, and preserves regional language characters (Hindi/Devanagari).
3. **Duplicate Prevention**: Re-running imports updates existing records rather than duplicating them.
4. **Dry-Run Validation**: Tests validation and reports added, updated, and rejected counts without touching production data.
5. **Preservation of Business Records**: A partial or refreshed dataset will **never** delete unmentioned locations or overwrite verified merchant addresses.

### CLI Import Commands

```bash
# 1. Run validation test suite
node scripts/test-location-suite.js

# 2. Run API integration test suite
npx tsx scripts/test-api-endpoints.js

# 3. Run dry-run import preview from CLI
node scripts/import-locations.js --dry-run

# 4. Ingest and synchronize live into Supabase
node scripts/import-locations.js --sync-supabase
```

### Web Admin Ingestion Console
Administrators can also perform imports directly through the web interface at `/admin/locations` -> **Data Ingestion & Import**:
1. Select target level (States, Districts, Cities, or PIN Codes).
2. Select data source lineage (LGD, OGD, India Post, Custom).
3. Choose format (CSV or JSON).
4. Check **Dry-Run Only** to preview validation counts before executing live ingestion.

---

## 5. Business Registration Integration

The business registration flow (`app/add-business/page.tsx`) uses `components/location/HierarchicalLocationSelector.tsx`:

- **Cascading Selectors**: State -> District -> City/Town/Village -> Locality -> PIN Code.
- **Client-Side Debouncing**: Avoids loading the full national database into memory. Child lists are loaded on demand via `/api/locations/*` endpoints.
- **Cascade Clearance**: Changing a parent (e.g. State) automatically clears invalid child selections (District, City, Locality).
- **Missing Location Suggestion**: If a user's location is not found, clicking **"Suggest Missing Location"** opens a modal to submit the details to `/api/locations/suggest`. The suggestion enters the admin queue for review without contaminating official records.
- **Stable Foreign Keys**: Businesses store `stateId`, `districtId`, `cityId`, `locationId`, and the full physical address independently.

---

## 6. Periodic Data Refresh & Maintenance Procedure

To refresh location data periodically (e.g., when new districts are bifurcated by state governments):

1. **Obtain the updated dataset** from LGD (`https://lgdirectory.gov.in/`) in CSV or JSON.
2. **Execute a Dry-Run first**:
   ```bash
   node scripts/import-locations.js --dry-run
   ```
   Or via the `/admin/locations` web panel with **Dry-Run Only** checked.
3. **Verify the Import Report**: Check that `recordsRejected` is 0 and that unexpected rows are not present.
4. **Execute Production Ingestion**:
   ```bash
   node scripts/import-locations.js --sync-supabase
   ```
5. **Audit Existing Business Listings**: Because businesses reference stable IDs and store physical addresses separately, historical business data remains intact.

---

## 7. Environment Variables

The system relies on the following environment variables (already configured in `.env.local`):

```ini
# Supabase Live Connection
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>

# Optional: Government Open Data Portal API Key (if pulling live via cron)
DATA_GOV_IN_API_KEY=<OPTIONAL_KEY>
```
