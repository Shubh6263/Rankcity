/**
 * RankCity Top 10 Sponsored Rank Floor Pricing & Multiplier Engine
 * Hybrid model: Minimum floor/reserve price per rank + auction bidding.
 */

export interface RankPricingTier {
  position: number; // 1 to 10
  tierName: 'Prime Tier' | 'Growth Tier' | 'Starter Tier';
  badge: string;
  sharePercentage: string; // Estimated visibility share
  baseFloorRupees: number; // Minimum bid floor for this rank
  description: string;
}

export const TOP_10_RANK_TIERS: RankPricingTier[] = [
  {
    position: 1,
    tierName: 'Prime Tier',
    badge: '🥇 #1 Prime',
    sharePercentage: '38%',
    baseFloorRupees: 10,
    description: 'Top-of-page hero placement. Highest phone calls, directions & leads.',
  },
  {
    position: 2,
    tierName: 'Prime Tier',
    badge: '🥈 #2 Prime',
    sharePercentage: '22%',
    baseFloorRupees: 10,
    description: 'Prominent 2nd position in search results and category landing pages.',
  },
  {
    position: 3,
    tierName: 'Prime Tier',
    badge: '🥉 #3 Prime',
    sharePercentage: '14%',
    baseFloorRupees: 10,
    description: 'High conversion slot right below top 2 listings.',
  },
  {
    position: 4,
    tierName: 'Growth Tier',
    badge: '⭐ #4 Growth',
    sharePercentage: '8%',
    baseFloorRupees: 10,
    description: 'Mid-page sponsored visibility for growing local businesses.',
  },
  {
    position: 5,
    tierName: 'Growth Tier',
    badge: '⭐ #5 Growth',
    sharePercentage: '6%',
    baseFloorRupees: 10,
    description: 'Consistent discovery visibility at competitive monthly cost.',
  },
  {
    position: 6,
    tierName: 'Growth Tier',
    badge: '⭐ #6 Growth',
    sharePercentage: '4%',
    baseFloorRupees: 10,
    description: 'Affordable mid-tier sponsored listing.',
  },
  {
    position: 7,
    tierName: 'Starter Tier',
    badge: '🚀 #7 Starter',
    sharePercentage: '3%',
    baseFloorRupees: 10,
    description: 'Budget-friendly local discovery slot.',
  },
  {
    position: 8,
    tierName: 'Starter Tier',
    badge: '🚀 #8 Starter',
    sharePercentage: '2%',
    baseFloorRupees: 10,
    description: 'Great for new local shops testing sponsored advertising.',
  },
  {
    position: 9,
    tierName: 'Starter Tier',
    badge: '🚀 #9 Starter',
    sharePercentage: '1.5%',
    baseFloorRupees: 10,
    description: 'Low-cost sponsored placement with verified badge advantage.',
  },
  {
    position: 10,
    tierName: 'Starter Tier',
    badge: '🚀 #10 Starter',
    sharePercentage: '1%',
    baseFloorRupees: 10,
    description: 'Lowest entry floor. Stay visible on page 1 of category search.',
  },
];

/**
 * Get tier definition for a specific position (1 to 10)
 */
export function getRankTier(position: number): RankPricingTier {
  const tier = TOP_10_RANK_TIERS.find((t) => t.position === position);
  return (
    tier || {
      position,
      tierName: 'Starter Tier',
      badge: `#${position}`,
      sharePercentage: '1%',
      baseFloorRupees: 10,
      description: 'Standard sponsored placement.',
    }
  );
}

/**
 * Calculates current required price for a target position given a maximum bid.
 * Guaranteed to respect the rank minimum floor price.
 */
export function calculateRequiredPriceForRank(
  position: number,
  maximumBidRupees: number
): number {
  const tier = getRankTier(position);
  const floor = tier.baseFloorRupees;

  // If user bids less than floor, clamp to floor
  if (maximumBidRupees <= floor) {
    return floor;
  }

  // Second-price simulation: runner-up dynamic discount based on rank depth
  // Rank 1 runner up factor ~85%, Rank 5 ~70%, Rank 10 ~55%
  const runnerUpRatio = Math.max(0.55, 0.90 - position * 0.035);
  const simulatedRequired = Math.round(maximumBidRupees * runnerUpRatio) + 1;

  // Required price can never be below rank floor or above maximum bid
  return Math.min(maximumBidRupees, Math.max(floor, simulatedRequired));
}
