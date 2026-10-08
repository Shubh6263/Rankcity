import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { publisherId, newMaxBidPaise, autoBidEnabled, maxBudgetPaise } = body;

    if (!publisherId || !newMaxBidPaise) {
      return NextResponse.json(
        { error: 'Missing publisherId or newMaxBidPaise' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const result = db.placeBid({
      campaignId: id,
      publisherId,
      newMaxBidPaise: Number(newMaxBidPaise),
      ipAddress,
      autoBidEnabled,
      maxBudgetPaise: maxBudgetPaise ? Number(maxBudgetPaise) : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const campaign = result.campaign!;
    const category = db.getCategoryById(campaign.categoryId);
    const location = db.getLocationById(campaign.locationId);

    return NextResponse.json({
      success: true,
      campaign,
      outbidCount: result.outbidCount || 0,
      newRankings: db.getRankings(category?.slug || '', location?.slug),
      message: `Bid successfully placed! You are currently ranked #${campaign.currentRank}.`,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
