import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publisherId = searchParams.get('publisherId') || searchParams.get('ownerId');

  const campaigns = publisherId
    ? db.campaigns.filter((c) => c.publisherId === publisherId)
    : db.campaigns;

  const enriched = campaigns.map((camp) => {
    const business = db.getBusinessById(camp.businessId || camp.websiteId || '');
    const category = db.getCategoryById(camp.categoryId);
    const location = db.getLocationById(camp.locationId);
    const positionHistory = db.positionHistory[camp.id] || [];

    const leader = db.campaigns.find(
      (c) =>
        c.categoryId === camp.categoryId &&
        c.locationId === camp.locationId &&
        (c.status === 'active' || c.status === 'ACTIVE') &&
        c.currentRank === 1
    );
    const highestPaise = leader ? leader.maxBidPaise : camp.maxBidPaise;
    const increment = category?.bidIncrementPaise || db.settings.defaultIncrementPaise;
    const minNextPaise = Math.max(highestPaise + increment, category?.minBidPaise || 1000);

    return {
      ...camp,
      businessName: business?.name || 'Local Business',
      websiteTitle: business?.name || 'Local Business',
      websiteUrl: business?.website || '',
      businessAddress: business?.address || '',
      categoryName: category?.name || '',
      locationName: location ? `${location.city}, ${location.state}` : '',
      currentHighestBidPaise: highestPaise,
      minNextBidPaise: minNextPaise,
      bidIncrementPaise: increment,
      positionHistory,
    };
  });

  return NextResponse.json({ campaigns: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = db.createCampaign(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, campaign: result.campaign, payment: result.payment });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
