import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const business = db.getBusinessById(id) || db.getBusinessBySlug(id);

  if (!business) {
    return NextResponse.json({ error: 'Business listing not found' }, { status: 404 });
  }

  const category = db.getCategoryById(business.categoryId);
  const location = db.getLocationById(business.locationId);
  const activeCampaign = db.campaigns.find(
    (c) => (c.businessId === business.id || c.websiteId === business.id) && c.status === 'active'
  );

  return NextResponse.json({
    business: {
      ...business,
      categoryName: category?.name,
      locationName: location ? `${location.city}, ${location.state}` : 'India',
      activeCampaign,
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
    const { status, rejectionReason, isFeatured, ...updates } = body;

    const biz = db.getBusinessById(id) || db.getBusinessBySlug(id);
    if (!biz) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (status) {
      db.updateBusinessStatus(biz.id, status, rejectionReason);
    }

    if (typeof isFeatured === 'boolean') {
      biz.isFeatured = isFeatured;
    }

    if (Object.keys(updates).length > 0) {
      db.updateBusiness(biz.id, updates);
    }

    return NextResponse.json({ success: true, business: db.getBusinessById(biz.id) });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const biz = db.getBusinessById(id) || db.getBusinessBySlug(id);
    if (!biz) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const updated = db.updateBusiness(biz.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update business' }, { status: 400 });
    }

    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
