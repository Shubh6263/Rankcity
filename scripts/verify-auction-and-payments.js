// Standalone automated test for Auction & Payment rules
const assert = require('assert');

// Test 1: Pricing tiers and minimum floors
console.log('--- Test 1: Base initial campaign floor ---');
const TOP_10_TIERS = [
  { position: 1, baseFloorRupees: 10 },
  { position: 2, baseFloorRupees: 10 },
  { position: 3, baseFloorRupees: 10 },
  { position: 4, baseFloorRupees: 10 },
  { position: 5, baseFloorRupees: 10 },
  { position: 6, baseFloorRupees: 10 },
  { position: 7, baseFloorRupees: 10 },
  { position: 8, baseFloorRupees: 10 },
  { position: 9, baseFloorRupees: 10 },
  { position: 10, baseFloorRupees: 10 },
];
TOP_10_TIERS.forEach(t => {
  assert.strictEqual(t.baseFloorRupees, 10, `Tier ${t.position} must have floor ₹10`);
});
console.log('✓ All 10 tiers have base floor ₹10');

// Test 2: Fee calculation for initial ₹10 campaign
console.log('--- Test 2: Platform Fee & GST on initial campaign ---');
const baseBidPaise = 1000; // ₹10
const commissionPercent = 15;
const gstPercent = 18;

const platformFeePaise = Math.round((baseBidPaise * commissionPercent) / 100);
const gstPaise = Math.round((platformFeePaise * gstPercent) / 100);
const totalAmountPaise = baseBidPaise + platformFeePaise + gstPaise;

assert.strictEqual(platformFeePaise, 150, 'Platform fee on ₹10 must be ₹1.50 (150 paise)');
assert.strictEqual(gstPaise, 27, 'GST (18% on platform fee) must be ₹0.27 (27 paise)');
assert.strictEqual(totalAmountPaise, 1177, 'Total amount on ₹10 campaign must be ₹11.77 (1177 paise)');
console.log('✓ Platform fee ₹1.50, GST ₹0.27, Total ₹11.77 correct');

// Test 3: Second-price auction logic simulation
console.log('--- Test 3: Second price auction test ---');
// A bids ₹500, B bids ₹400
const campaigns = [
  { id: 'camp_a', maxBidPaise: 50000, status: 'ACTIVE', currentRank: 1, effectiveBidPaise: 1000 },
  { id: 'camp_b', maxBidPaise: 40000, status: 'ACTIVE', currentRank: 2, effectiveBidPaise: 1000 },
];
const incrementPaise = 100; // ₹1
const minBidPaise = 1000; // ₹10

function recalculateRankings(camps) {
  const sorted = [...camps].sort((a, b) => b.maxBidPaise - a.maxBidPaise);
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].currentRank = i + 1;
    if (i < sorted.length - 1) {
      sorted[i].effectiveBidPaise = Math.min(sorted[i].maxBidPaise, sorted[i + 1].maxBidPaise + incrementPaise);
    } else {
      sorted[i].effectiveBidPaise = minBidPaise;
    }
  }
  return sorted;
}

let ranked = recalculateRankings(campaigns);
assert.strictEqual(ranked[0].id, 'camp_a');
assert.strictEqual(ranked[0].effectiveBidPaise, 40100, 'Rank 1 (A) effective price must be ₹401');
assert.strictEqual(ranked[1].id, 'camp_b');
assert.strictEqual(ranked[1].effectiveBidPaise, 1000, 'Rank 2 (B) effective price must be ₹10 (floor)');
console.log('✓ A is #1 at ₹401, B is #2 at ₹10');

// Now C enters with ₹600
console.log('--- Test 4: New competitor C enters with ₹600 ---');
campaigns.push({ id: 'camp_c', maxBidPaise: 60000, status: 'ACTIVE', currentRank: 3, effectiveBidPaise: 1000 });
ranked = recalculateRankings(campaigns);
assert.strictEqual(ranked[0].id, 'camp_c');
assert.strictEqual(ranked[0].effectiveBidPaise, 50100, 'Rank 1 (C) effective price must be ₹501');
assert.strictEqual(ranked[1].id, 'camp_a');
assert.strictEqual(ranked[1].effectiveBidPaise, 40100, 'Rank 2 (A) effective price must be ₹401');
assert.strictEqual(ranked[2].id, 'camp_b');
assert.strictEqual(ranked[2].effectiveBidPaise, 1000, 'Rank 3 (B) effective price must be ₹10');
console.log('✓ C is #1 at ₹501, A is #2 at ₹401, B is #3 at ₹10');

// Test 5: Initial campaign uncontested price
console.log('--- Test 5: Uncontested initial campaign price ---');
const singleCampaign = [{ id: 'camp_first', maxBidPaise: 50000, status: 'ACTIVE', currentRank: 1, effectiveBidPaise: 1000 }];
const initialRanked = recalculateRankings(singleCampaign);
assert.strictEqual(initialRanked[0].effectiveBidPaise, 1000, 'Uncontested initial campaign price must be ₹10 (1000 paise)');
console.log('✓ Uncontested initial campaign price is ₹10 floor even with max bid ₹500');

console.log('\nALL AUCTION & PAYMENT CALCULATIONS PASSED SUCCESSFULLY!');
