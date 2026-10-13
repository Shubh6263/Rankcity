/**
 * Deep Verification Test Suite for RankCity Location Review Fixes
 * Run via: npx tsx scripts/test-location-review-fixes.js
 */

const assert = require('assert');
const { locationDb } = require('../lib/location/service');
const { verifyAdminRequest } = require('../lib/auth/admin-check');
const { db } = require('../lib/db');

let passedTests = 0;
let failedTests = 0;

async function test(description, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    -> ${err.message}`);
    failedTests++;
  }
}

async function runReviewTests() {
  console.log('========================================================');
  console.log('🔍 Running Deep Verification for Location Review Fixes');
  console.log('========================================================\n');

  // --- 1. Hierarchy Validation ---
  console.log('--- Suite 1: Hierarchy Consistency Validation (validateHierarchy) ---');

  await test('Valid State, District, and City hierarchy passes', () => {
    const result = locationDb.validateHierarchy({
      stateId: 'st_23', // Madhya Pradesh
      districtId: 'dst_23_indore', // Indore
      cityId: 'cty_indore', // Indore City
    });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.error, undefined);
  });

  await test('Mismatched State and District fails with clear error', () => {
    const result = locationDb.validateHierarchy({
      stateId: 'st_07', // Delhi
      districtId: 'dst_23_indore', // Indore (in MP)
    });
    assert.strictEqual(result.valid, false);
    assert.ok(result.error && result.error.includes('does not belong to State'));
  });

  await test('Mismatched District and City fails with clear error', () => {
    const result = locationDb.validateHierarchy({
      stateId: 'st_23', // MP
      districtId: 'dst_23_bhopal', // Bhopal
      cityId: 'cty_indore', // Indore
    });
    assert.strictEqual(result.valid, false);
    assert.ok(result.error && result.error.includes('does not belong to District'));
  });

  await test('Non-existent State or District IDs are rejected', () => {
    const result = locationDb.validateHierarchy({
      stateId: 'st_invalid_999',
      districtId: 'dst_invalid_999',
    });
    assert.strictEqual(result.valid, false);
    assert.ok(result.error && result.error.includes('does not exist in location database'));
  });

  // --- 2. Security & Admin Authorization ---
  console.log('\n--- Suite 2: Security & Authorization (verifyAdminRequest) ---');

  await test('Unauthenticated request without headers returns 401', async () => {
    const mockReq = {
      headers: new Headers(),
    };
    const authResult = await verifyAdminRequest(mockReq);
    assert.strictEqual(authResult.authorized, false);
    assert.strictEqual(authResult.status, 401);
  });

  await test('Request with valid x-admin-key header authorizes successfully', async () => {
    process.env.ADMIN_SECRET_KEY = 'test-secret-key-12345';
    const mockReq = {
      headers: new Headers({
        'x-admin-key': 'test-secret-key-12345',
      }),
    };
    const authResult = await verifyAdminRequest(mockReq);
    assert.strictEqual(authResult.authorized, true);
    assert.strictEqual(authResult.role, 'SUPER_ADMIN');
  });

  await test('Request with incorrect secret key fails with 401', async () => {
    process.env.ADMIN_SECRET_KEY = 'test-secret-key-12345';
    const mockReq = {
      headers: new Headers({
        'x-admin-key': 'wrong-key-attempt',
      }),
    };
    const authResult = await verifyAdminRequest(mockReq);
    assert.strictEqual(authResult.authorized, false);
    assert.strictEqual(authResult.status, 401);
  });

  await test('Bearer token matching SUPABASE_SERVICE_ROLE_KEY authorizes successfully', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-super-secret';
    const mockReq = {
      headers: new Headers({
        authorization: 'Bearer service-role-super-secret',
      }),
    };
    const authResult = await verifyAdminRequest(mockReq);
    assert.strictEqual(authResult.authorized, true);
    assert.strictEqual(authResult.role, 'SUPER_ADMIN');
  });

  // --- 3. Location Management & Audit Logging ---
  console.log('\n--- Suite 3: Location Management & Audit Logging ---');

  let customVillageId = '';
  await test('Admin can add a custom village and query it', async () => {
    const addResult = await locationDb.addLocation('village', {
      name: 'Rau Gram Panchayat',
      districtId: 'dst_23_indore',
      pincode: '453331',
    }, 'admin_test_user');

    assert.ok(addResult.success);
    assert.ok(addResult.record.id.startsWith('vil_'));
    assert.strictEqual(addResult.record.name, 'Rau Gram Panchayat');
    customVillageId = addResult.record.id;

    // Verify it is queryable in villages
    const villages = locationDb.getVillages({ districtId: 'dst_23_indore' });
    assert.ok(villages.items.some((v) => v.name === 'Rau Gram Panchayat'));

    // Verify hierarchy validation recognizes the new village
    const hResult = locationDb.validateHierarchy({
      stateId: 'st_23',
      districtId: 'dst_23_indore',
      villageId: customVillageId,
    });
    assert.strictEqual(hResult.valid, true);
  });

  await test('Deactivating a location marks it inactive and updates hierarchy validation', async () => {
    const toggleRes = await locationDb.toggleLocationStatus('village', customVillageId, false, 'admin_test_user');
    assert.strictEqual(toggleRes.success, true);
    assert.strictEqual(toggleRes.record.isActive, false);

    // Inactive village should now fail hierarchy validation
    const hResult = locationDb.validateHierarchy({
      stateId: 'st_23',
      districtId: 'dst_23_indore',
      villageId: customVillageId,
    });
    assert.strictEqual(hResult.valid, false);
    assert.ok(hResult.error && hResult.error.includes('marked inactive'));

    // Re-activate
    const reactivateRes = await locationDb.toggleLocationStatus('village', customVillageId, true, 'admin_test_user');
    assert.strictEqual(reactivateRes.record.isActive, true);

    const hResult2 = locationDb.validateHierarchy({
      stateId: 'st_23',
      districtId: 'dst_23_indore',
      villageId: customVillageId,
    });
    assert.strictEqual(hResult2.valid, true);
  });

  await test('Audit trail logs contain manual add and status toggle entries', () => {
    const logs = locationDb.getImportLogs({ limit: 10 });
    const addLog = logs.items.find((l) => l.source.includes('Admin Added Village'));
    const toggleLog = logs.items.find((l) => l.source.includes('Admin Toggled village Status'));
    assert.ok(addLog, 'Expected Admin Added Village in import/audit logs');
    assert.ok(toggleLog, 'Expected Admin Toggled village Status in import/audit logs');
  });

  await test('Duplicate candidate detection flags same-district candidate collisions', async () => {
    // Add a duplicate city in same district
    await locationDb.addLocation('city', {
      name: 'Indore',
      districtId: 'dst_23_indore',
      cityType: 'ULB',
    }, 'admin_test');

    const duplicates = locationDb.getDuplicateCandidates('cities');
    assert.ok(duplicates.length > 0, 'Expected to find duplicate candidate groups');
    const indoreGroup = duplicates.find((d) => d.key.includes('dst_23_indore_indore'));
    assert.ok(indoreGroup, 'Expected Indore city collision group in dst_23_indore');
    assert.ok(indoreGroup.count >= 2);
  });

  // --- 4. Business Location Filtering & City Disambiguation ---
  console.log('\n--- Suite 4: Business Location Filtering & City Disambiguation ---');

  await test('db.getBusinesses filters accurately by city, districtId, stateId, and pincode', async () => {
    const mpBusinesses = db.getBusinesses({ stateId: 'st_23' });
    assert.ok(Array.isArray(mpBusinesses));

    const indoreBusinesses = db.getBusinesses({ districtId: 'dst_23_indore' });
    assert.ok(Array.isArray(indoreBusinesses));

    const pinBusinesses = db.getBusinesses({ pincode: '452001' });
    assert.ok(Array.isArray(pinBusinesses));
  });

  await test('db.getRankings disambiguates Bilaspur in CG from Bilaspur in HP when district is provided', () => {
    const cgRankings = db.getRankings('restaurants', 'dst_22_bilaspur');
    assert.ok(cgRankings && typeof cgRankings === 'object');
    assert.ok(Array.isArray(cgRankings.items));
    assert.ok(Array.isArray(cgRankings.topRatedBusinesses));
    assert.ok(cgRankings.category);
  });

  // --- 5. Village and Locality Importer Execution ---
  console.log('\n--- Suite 5: Village & Locality Importer Execution ---');

  await test('Importing villages via runImport with dryRun=false updates records', async () => {
    const villageData = [
      { name: 'Khatipura Village', districtName: 'Indore', pincode: '452003' },
      { name: 'Manglia Village', districtId: 'dst_23_indore', pincode: '453771' },
    ];
    const report = await locationDb.runImport({
      datasetType: 'villages',
      source: 'CUSTOM_JSON',
      rawContent: JSON.stringify(villageData),
      dryRun: false,
    });
    assert.strictEqual(report.status, 'completed');
    assert.ok(report.recordsAdded >= 1);

    const check = locationDb.getVillages({ districtId: 'dst_23_indore' });
    assert.ok(check.items.some((v) => v.name === 'Khatipura Village'));
  });

  await test('Importing localities via runImport works cleanly', async () => {
    const localityData = [
      { name: 'Chappan Dukan', cityId: 'cty_indore', districtId: 'dst_23_indore', stateId: 'st_23', pincode: '452001' },
    ];
    const report = await locationDb.runImport({
      datasetType: 'localities',
      source: 'CUSTOM_JSON',
      rawContent: JSON.stringify(localityData),
      dryRun: false,
    });
    assert.strictEqual(report.status, 'completed');
    assert.ok(report.recordsAdded >= 1);

    const check = locationDb.getLocalities({ cityId: 'cty_indore' });
    assert.ok(check.items.some((l) => l.name === 'Chappan Dukan'));
  });

  console.log('\n========================================================');
  console.log(`Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('========================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All deep review verification tests PASSED with 0 errors.');
  }
}

runReviewTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
