/**
 * API Route Handler Integration Test
 * Run via: node scripts/test-api-endpoints.js
 */

const assert = require('assert');

// Mock NextRequest and NextResponse
class MockNextRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
    this._body = options.body;
  }
  async json() {
    return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
  }
}

// Test service directly
const { locationDb } = require('../lib/location/service');

async function runTests() {
  console.log('========================================================');
  console.log('🌐 Testing Location Database API Service Operations');
  console.log('========================================================\n');

  // 1. States Query
  console.log('[1/8] Testing States Query...');
  const states = locationDb.getStates({ limit: 100 });
  assert.strictEqual(states.total, 36, `Expected 36 states/UTs, got ${states.total}`);
  assert.ok(states.items.some((s) => s.code === 'MP' && s.name === 'Madhya Pradesh'));
  assert.ok(states.items.some((s) => s.code === 'DL' && s.name === 'Delhi'));
  console.log('      ✓ States list returned with complete 36 States/UTs');

  // 2. State Search
  console.log('[2/8] Testing State Debounced Search...');
  const searchMP = locationDb.getStates({ search: 'Madhya' });
  assert.strictEqual(searchMP.items.length, 1);
  assert.strictEqual(searchMP.items[0].code, 'MP');
  console.log('      ✓ Search filtered accurately to "Madhya Pradesh"');

  // 3. Districts by State
  console.log('[3/8] Testing Districts by State...');
  const mpDistricts = locationDb.getDistricts({ stateId: 'st_23' });
  assert.ok(mpDistricts.total >= 30, `Expected MP districts >= 30, got ${mpDistricts.total}`);
  assert.ok(mpDistricts.items.some((d) => d.name === 'Indore'));
  assert.ok(mpDistricts.items.some((d) => d.name === 'Bhopal'));
  console.log(`      ✓ Found ${mpDistricts.total} districts mapped to Madhya Pradesh`);

  // 4. Cities by District
  console.log('[4/8] Testing Cities by District...');
  const indoreCities = locationDb.getCities({ districtId: 'dst_23_indore' });
  assert.ok(indoreCities.items.some((c) => c.name === 'Indore'));
  assert.ok(indoreCities.items.some((c) => c.name === 'Sanwer'));
  console.log(`      ✓ Found ${indoreCities.items.length} urban local bodies in Indore district`);

  // 5. PIN Code Search
  console.log('[5/8] Testing PIN Code Multi-Office Search...');
  const pinRes = locationDb.searchPincodes({ pincode: '452010' });
  assert.ok(pinRes.items.length >= 2, 'Expected multi-office results for 452010');
  assert.ok(pinRes.items.some((p) => p.postOfficeName === 'Vijay Nagar S.O.'));
  console.log(`      ✓ Verified multi-office mapping: ${pinRes.items.map((p) => p.postOfficeName).join(', ')}`);

  // 6. User Location Suggestion Flow
  console.log('[6/8] Testing User Suggestion & Admin Approval Flow...');
  const suggestion = await locationDb.createSuggestion({
    locationType: 'town',
    name: 'Sanwer Bypass Nagar',
    stateName: 'Madhya Pradesh',
    districtName: 'Indore',
    pincode: '453551',
    contactEmail: 'merchant@test.in',
    notes: 'Industrial zone near Indore',
  });
  assert.strictEqual(suggestion.status, 'pending');
  assert.strictEqual(suggestion.name, 'Sanwer Bypass Nagar');
  console.log(`      ✓ Created user suggestion ID: ${suggestion.id}`);

  const pendingList = locationDb.getSuggestions({ status: 'pending' });
  assert.ok(pendingList.items.some((s) => s.id === suggestion.id));

  // Admin approves suggestion
  const approved = await locationDb.updateSuggestionStatus(suggestion.id, 'approved', 'Verified against local master');
  assert.strictEqual(approved.status, 'approved');
  console.log('      ✓ Successfully transitioned suggestion to "approved"');

  // 7. Bulk Import Dry-Run Simulation
  console.log('[7/8] Testing Bulk Import Dry-Run Execution...');
  const sampleImport = [
    { name: 'Khandwa City', districtName: 'Indore', cityType: 'Municipality', lgdCode: 899001 },
  ];
  const importReport = await locationDb.runImport({
    datasetType: 'cities',
    source: 'CUSTOM_JSON',
    rawContent: JSON.stringify(sampleImport),
    dryRun: true,
  });
  assert.strictEqual(importReport.status, 'dry_run');
  assert.strictEqual(importReport.recordsAdded, 1);
  assert.strictEqual(importReport.isDryRun, true);
  console.log(`      ✓ Dry-run completed: Added=${importReport.recordsAdded}, Updated=${importReport.recordsUpdated}, Status=${importReport.status}`);

  // 8. Coverage Metrics
  console.log('[8/8] Testing Overall Coverage Calculation...');
  const stats = locationDb.getLocationStats();
  assert.strictEqual(stats.coverage.hasAllStatesAndUTs, true);
  assert.strictEqual(stats.coverage.stateCoveragePercent, 100);
  assert.ok(stats.districtsCount > 100);
  console.log(`      ✓ Coverage stats verified: 100% States/UTs, ${stats.districtsCount} Districts, ${stats.citiesCount} Cities`);

  console.log('\n========================================================');
  console.log('🎉 All 8 API service operation tests PASSED successfully.');
  console.log('========================================================');
}

runTests().catch((err) => {
  console.error('Fatal API test error:', err);
  process.exit(1);
});
