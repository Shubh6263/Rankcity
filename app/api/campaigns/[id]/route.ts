import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = db.campaigns.find((c) => c.id === id);

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  const business = db.getBusinessById(campaign.businessId || campaign.websiteId || '');
  const category = db.getCategoryById(campaign.categoryId);
  const location = db.getLocationById(campaign.locationId);

  return NextResponse.json({
    campaign: {
      ...campaign,
      businessName: business?.name || 'Local Business',
      websiteTitle: business?.name || 'Local Business',
      categoryName: category?.name || '',
      locationName: location ? `${location.city}, ${location.state}` : '',
      positionHistory: db.positionHistory[campaign.id] || [],
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, extendDays, autoBidEnabled, maxBidPaise } = body;

    const campaign = db.campaigns.find((c) => c.id === id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (status) {
      if (['active', 'paused', 'expired', 'completed'].includes(status)) {
        campaign.status = status as 'active' | 'paused' | 'expired' | 'completed';
      } else if (status === 'ended') {
        campaign.status = 'completed';
      }
    }

    if (typeof autoBidEnabled === 'boolean') {
      campaign.autoBidEnabled = autoBidEnabled;
    }

    if (extendDays && typeof extendDays === 'number' && extendDays > 0) {
      campaign.durationDays += extendDays;
      const currentEnd = new Date(campaign.endDate).getTime();
      campaign.endDate = new Date(currentEnd + extendDays * 24 * 60 * 60 * 1000).toISOString();
    }

    if (maxBidPaise && typeof maxBidPaise === 'number' && maxBidPaise > 0) {
      campaign.maxBidPaise = maxBidPaise;
    }

    campaign.updatedAt = new Date().toISOString();

    // Recalculate rankings if status changed
    db.recalculateVickreyRankings(campaign.categoryId, campaign.locationId, campaign.subcategoryId);

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idx = db.campaigns.findIndex((c) => c.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const campaign = db.campaigns[idx];
    campaign.status = 'completed';

    // Unreserve wallet hold
    const wallet = db.getWallet(campaign.publisherId);
    if (wallet && wallet.reservedPaise >= campaign.maxBidPaise) {
      wallet.reservedPaise = Math.max(0, wallet.reservedPaise - campaign.maxBidPaise);
    }

    db.recalculateVickreyRankings(campaign.categoryId, campaign.locationId, campaign.subcategoryId);

    return NextResponse.json({ success: true, message: 'Campaign ended successfully' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
