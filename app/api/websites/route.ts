import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publisherId = searchParams.get('publisherId') || searchParams.get('ownerId') || undefined;

  const businesses = db.getBusinesses(publisherId);
  const enriched = businesses.map((biz) => {
    const category = db.getCategoryById(biz.categoryId);
    const location = db.getLocationById(biz.locationId);
    const activeCampaign = db.campaigns.find(
      (c) => (c.businessId === biz.id || c.websiteId === biz.id) && c.status === 'active'
    );

    return {
      ...biz,
      title: biz.name,
      url: biz.website || `https://maps.google.com/?q=${encodeURIComponent(biz.name)}`,
      categoryName: category?.name || 'Local Service',
      locationName: location ? `${location.city}, ${location.state}` : 'India',
      activeCampaign,
    };
  });

  return NextResponse.json({ websites: enriched, businesses: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = db.createBusiness({
      ownerId: body.publisherId || body.ownerId,
      name: body.title || body.name,
      description: body.description,
      categoryId: body.categoryId,
      subcategoryId: body.subcategoryId,
      locationId: body.locationId,
      address: body.address || 'Commercial Center, Indore',
      phone: body.contactPhone || body.phone || '+91 98260 00000',
      email: body.contactEmail || body.email,
      website: body.url || body.website,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, website: result.business, business: result.business });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
