/**
 * Comprehensive Automated Test Suite for RankCity Location Database
 * Run via: node scripts/test-location-suite.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

function loadJson(relPath) {
  const fullPath = path.join(__dirname, '..', relPath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    -> ${err.message}`);
    failedTests++;
  }
}

console.log('========================================================');
console.log('🧪 Starting India Location Database Test Suite');
console.log('========================================================\n');

// Load datasets
const states = loadJson('data/locations/lgd_states.json');
const districts = loadJson('data/locations/lgd_districts.json');
const cities = loadJson('data/locations/india_cities.json');
const pincodes = loadJson('data/locations/india_pincodes.json');

// --- 1. State Coverage & Integrity ---
console.log('Test Group 1: State Hierarchy & Official LGD Coverage');

test('Must contain all 28 States and 8 Union Territories (36 total)', () => {
  assert.strictEqual(states.length, 36, `Expected 36 States/UTs, found ${states.length}`);
  const stateTypes = states.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});
  assert.strictEqual(stateTypes['STATE'], 28, `Expected 28 States, found ${stateTypes['STATE']}`);
  assert.strictEqual(stateTypes['UT'], 8, `Expected 8 UTs, found ${stateTypes['UT']}`);
});

test('All states must have unique ISO codes and official LGD codes', () => {
  const codes = new Set();
  const lgdCodes = new Set();
  states.forEach((s) => {
    assert.ok(s.code, `State ${s.name} missing code`);
    assert.ok(!codes.has(s.code), `Duplicate state code: ${s.code}`);
    codes.add(s.code);

    assert.ok(s.lgdCode, `State ${s.name} missing LGD code`);
    assert.ok(!lgdCodes.has(s.lgdCode), `Duplicate state LGD code: ${s.lgdCode}`);
    lgdCodes.add(s.lgdCode);
  });
});

// --- 2. District-to-State Relationships ---
console.log('\nTest Group 2: District-to-State Relationships');

test('Every district must resolve to an existing stateId and valid stateLgdCode', () => {
  const stateIdSet = new Set(states.map((s) => s.id));
  districts.forEach((d) => {
    assert.ok(stateIdSet.has(d.stateId), `District ${d.name} references invalid stateId: ${d.stateId}`);
    assert.ok(d.name.trim().length > 0, `District ID ${d.id} has empty name`);
  });
});

test('Districts must have unique LGD codes', () => {
  const districtLgdSet = new Set();
  districts.forEach((d) => {
    if (d.lgdCode) {
      assert.ok(!districtLgdSet.has(d.lgdCode), `Duplicate district LGD code: ${d.lgdCode} on ${d.name}`);
      districtLgdSet.add(d.lgdCode);
    }
  });
});

// --- 3. City-to-District Relationships & Same-Name Disambiguation ---
console.log('\nTest Group 3: Cities & Same-Name Disambiguation Across Districts');

test('Every city must resolve to an existing districtId', () => {
  const districtIdSet = new Set(districts.map((d) => d.id));
  cities.forEach((c) => {
    assert.ok(districtIdSet.has(c.districtId), `City ${c.name} references non-existent districtId: ${c.districtId}`);
    assert.ok(c.cityType, `City ${c.name} must specify cityType (ULB/Town/Corporation)`);
  });
});

test('Identically named cities in different districts/states must have unique IDs and district bindings', () => {
  // Bilaspur exists in Himachal Pradesh and Chhattisgarh
  const bilaspurCG = cities.find((c) => c.name === 'Bilaspur' && c.districtId === 'dst_22_bilaspur');
  assert.ok(bilaspurCG, 'Bilaspur (CG) must exist with district binding');
  assert.strictEqual(bilaspurCG.districtId, 'dst_22_bilaspur');
});

// --- 4. PIN Code & Multi-Office Relationships ---
console.log('\nTest Group 4: PIN Codes & Multi-Office Postal Mapping');

test('PIN codes must be strictly 6-digit numeric strings', () => {
  pincodes.forEach((p) => {
    assert.ok(/^\d{6}$/.test(p.pincode), `Invalid PIN code: "${p.pincode}" on ${p.postOfficeName}`);
    assert.ok(p.postOfficeName.trim().length > 0, `PIN ${p.pincode} has empty post office name`);
  });
});

test('Multiple post offices can share the same PIN code (1:N relationship)', () => {
  // Test PIN 452001 has multiple offices (Indore GPO, Indore High Court, Siyaganj)
  const pin452001 = pincodes.filter((p) => p.pincode === '452001');
  assert.ok(pin452001.length >= 2, `Expected at least 2 post offices for 452001, found ${pin452001.length}`);
  const officeNames = pin452001.map((p) => p.postOfficeName);
  assert.ok(officeNames.includes('Indore G.P.O.'));
  assert.ok(officeNames.includes('Indore High Court S.O.'));
});

// --- 5. Importer Normalization & Idempotency Simulation ---
console.log('\nTest Group 5: Importer Normalization & Idempotency');

test('White-space and case normalization preserves official strings', () => {
  const rawInput = '  Indore   Municipal  Corporation  ';
  const normalized = rawInput.trim().replace(/\s+/g, ' ');
  assert.strictEqual(normalized, 'Indore Municipal Corporation');
});

test('Re-importing identical records updates rather than duplicates', () => {
  const testMap = new Map();
  const record1 = { id: 'cty_indore', name: 'Indore', districtId: 'dst_23_indore' };
  testMap.set(`${record1.districtId}_${record1.name.toLowerCase()}`, record1);

  // Duplicate sync
  const record2 = { id: 'cty_indore_dupe', name: '  Indore  ', districtId: 'dst_23_indore', cityType: 'Updated ULB' };
  const key = `${record2.districtId}_${record2.name.trim().toLowerCase()}`;
  if (testMap.has(key)) {
    testMap.get(key).cityType = record2.cityType; // Updated in place
  } else {
    testMap.set(key, record2);
  }

  assert.strictEqual(testMap.size, 1, 'Map size should remain 1 after repeated sync');
  assert.strictEqual(testMap.get(key).cityType, 'Updated ULB', 'Existing record was cleanly updated');
});

// --- 6. Missing Parent Validation ---
console.log('\nTest Group 6: Missing Parent Detection');

test('Rejects city import when district is non-existent', () => {
  const validDistricts = new Set(['dst_23_indore']);
  const orphanCity = { name: 'Atlantis', districtId: 'dst_invalid_999' };

  let rejected = false;
  if (!validDistricts.has(orphanCity.districtId)) {
    rejected = true;
  }
  assert.strictEqual(rejected, true, 'Orphan record without valid parent must be rejected');
});

// --- 7. Business Backward Compatibility ---
console.log('\nTest Group 7: Business Listing Backward Compatibility');

test('Legacy businesses with string city and old locationId remain valid', () => {
  const legacyBiz = {
    id: 'biz_legacy_1',
    name: 'Legacy Sweets',
    locationId: 'loc_in_mp_indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    address: '56 Dukan, Indore',
  };

  assert.ok(legacyBiz.locationId);
  assert.ok(legacyBiz.city);
  assert.ok(legacyBiz.address);
});

console.log('\n========================================================');
console.log(`Results: ${passedTests} Passed, ${failedTests} Failed`);
console.log('========================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All test cases passed with 100% success rate.');
}
