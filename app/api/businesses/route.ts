import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId') || searchParams.get('publisherId') || undefined;

  const businesses = db.getBusinesses(ownerId);
  const enriched = businesses.map((biz) => {
    const category = db.getCategoryById(biz.categoryId);
    const location = db.getLocationById(biz.locationId);
    const activeCampaign = db.campaigns.find(
      (c) => (c.businessId === biz.id || c.websiteId === biz.id) && c.status === 'active'
    );

    return {
      ...biz,
      categoryName: category?.name || 'Local Service',
      locationName: location ? `${location.city}, ${location.state}` : 'India',
      activeCampaign,
    };
  });

  return NextResponse.json(
    { businesses: enriched },
    {
      headers: {
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = db.createBusiness({
      ownerId: body.ownerId || body.publisherId,
      name: body.name || body.title,
      description: body.description,
      fullDescription: body.fullDescription,
      businessType: body.businessType,
      yearEstablished: body.yearEstablished,
      categoryId: body.categoryId,
      subcategoryId: body.subcategoryId,
      locationId: body.locationId,
      address: body.address,
      locality: body.locality,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      landmark: body.landmark,
      buildingInfo: body.buildingInfo,
      serviceAreas: body.serviceAreas,
      phone: body.phone || body.contactPhone,
      alternatePhone: body.alternatePhone,
      whatsapp: body.whatsapp,
      whatsappEnabled: body.whatsappEnabled,
      email: body.email || body.contactEmail,
      website: body.website || body.url,
      directionsUrl: body.directionsUrl || body.mapLink || body.googleMapsUrl,
      logo: body.logo,
      coverImage: body.coverImage,
      photos: body.photos,
      openingHours: body.openingHours,
      weeklyHours: body.weeklyHours,
      priceRange: body.priceRange,
      startingPrice: body.startingPrice,
      services: body.services,
      amenities: body.amenities,
      businessAttributes: body.businessAttributes,
      socialLinks: body.socialLinks,
      googleBusinessUrl: body.googleBusinessUrl,
      ownerName: body.ownerName,
      ownerDesignation: body.ownerDesignation,
      ownerPhone: body.ownerPhone,
      ownerEmail: body.ownerEmail,
      verificationDocType: body.verificationDocType,
      verificationDocNumber: body.verificationDocNumber,
      verificationDocUrl: body.verificationDocUrl,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, business: result.business });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || body.businessId;

    if (!id) {
      return NextResponse.json({ error: 'Business ID is required for updating.' }, { status: 400 });
    }

    const updated = db.updateBusiness(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Business listing not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
