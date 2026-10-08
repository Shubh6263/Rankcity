import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publisherId = searchParams.get('publisherId') || searchParams.get('ownerId');

  if (!publisherId) {
    return NextResponse.json({ error: 'Publisher / Owner ID is required' }, { status: 400 });
  }

  const businesses = db.getBusinesses(publisherId);
  const campaigns = db.campaigns.filter((c) => c.publisherId === publisherId);
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const wallet = db.getWallet(publisherId);
  const notifications = db.getNotifications(publisherId);

  const totalViews = businesses.reduce((acc, b) => acc + (b.totalViews || 0), 0);
  const totalCalls = businesses.reduce((acc, b) => acc + (b.totalCalls || 0), 0);
  const totalWhatsapp = businesses.reduce((acc, b) => acc + (b.totalWhatsapp || 0), 0);
  const totalDirections = businesses.reduce((acc, b) => acc + (b.totalDirections || 0), 0);
  const totalWebsiteClicks = businesses.reduce((acc, b) => acc + (b.totalWebsiteClicks || 0), 0);
  const totalLeads = totalCalls + totalWhatsapp + totalDirections + totalWebsiteClicks;

  const totalSpendPaise = campaigns.reduce((acc, c) => acc + c.spentPaise, 0);
  const bestRank = activeCampaigns.length > 0 ? Math.min(...activeCampaigns.map((c) => c.currentRank)) : null;

  const myBids = db.bids.filter((b) => b.publisherId === publisherId).slice(0, 10);

  return NextResponse.json({
    publisherId,
    stats: {
      activeCampaignsCount: activeCampaigns.length,
      totalBusinessesCount: businesses.length,
      totalWebsitesCount: businesses.length,
      bestRank,
      totalSpendPaise,
      totalViews,
      totalCalls,
      totalWhatsapp,
      totalDirections,
      totalWebsiteClicks,
      totalLeads,
      ctr: totalViews > 0 ? `${((totalLeads / totalViews) * 100).toFixed(1)}%` : '0.0%',
      walletBalancePaise: wallet.balancePaise,
      walletAvailablePaise: wallet.balancePaise - wallet.reservedPaise,
      walletReservedPaise: wallet.reservedPaise,
    },
    campaigns: activeCampaigns.map((c) => {
      const biz = db.getBusinessById(c.businessId || c.websiteId || '');
      const cat = db.getCategoryById(c.categoryId);
      const loc = db.getLocationById(c.locationId);

      const leader = db.campaigns.find(
        (cand) =>
          cand.categoryId === c.categoryId &&
          cand.locationId === c.locationId &&
          (cand.status === 'active' || cand.status === 'ACTIVE') &&
          cand.currentRank === 1
      );
      const highestPaise = leader ? leader.maxBidPaise : c.maxBidPaise;
      const increment = cat?.bidIncrementPaise || db.settings.defaultIncrementPaise;
      const minNextPaise = Math.max(highestPaise + increment, cat?.minBidPaise || 1000);

      return {
        ...c,
        businessName: biz?.name || 'Local Business',
        websiteTitle: biz?.name || 'Local Business',
        businessAddress: biz?.address || '',
        categoryName: cat?.name || 'General',
        locationName: loc ? `${loc.city}, ${loc.state}` : 'India',
        currentHighestBidPaise: highestPaise,
        minNextBidPaise: minNextPaise,
        bidIncrementPaise: increment,
        positionHistory: db.positionHistory[c.id] || [],
      };
    }),
    businesses,
    websites: businesses, // compatibility alias
    recentBids: myBids,
    notifications,
  });
}
