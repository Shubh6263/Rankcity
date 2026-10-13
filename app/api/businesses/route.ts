import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { locationDb } from '@/lib/location/service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId') || searchParams.get('publisherId') || undefined;
  const locationId = searchParams.get('locationId') || undefined;
  const cityId = searchParams.get('cityId') || undefined;
  const districtId = searchParams.get('districtId') || undefined;
  const stateId = searchParams.get('stateId') || undefined;
  const city = searchParams.get('city') || undefined;
  const pincode = searchParams.get('pincode') || undefined;
  const search = searchParams.get('search') || searchParams.get('q') || undefined;

  const businesses = db.getBusinesses({
    ownerId,
    locationId,
    cityId,
    districtId,
    stateId,
    city,
    pincode,
    search,
  });

  const enriched = businesses.map((biz) => {
    const category = db.getCategoryById(biz.categoryId);
    const location = db.getLocationById(biz.locationId || biz.cityId || '');
    const activeCampaign = db.campaigns.find(
      (c) => (c.businessId === biz.id || c.websiteId === biz.id) && c.status === 'active'
    );

    return {
      ...biz,
      categoryName: category?.name || 'Local Service',
      locationName: location
        ? `${location.city}, ${location.state}`
        : biz.city
        ? `${biz.city}, ${biz.state || 'India'}`
        : 'India',
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

    // Hierarchy Consistency Validation
    if (body.stateId || body.districtId || body.cityId || body.villageId) {
      const hierarchyCheck = locationDb.validateHierarchy({
        stateId: body.stateId,
        districtId: body.districtId,
        cityId: body.cityId,
        villageId: body.villageId,
      });
      if (!hierarchyCheck.valid) {
        return NextResponse.json({ error: hierarchyCheck.error }, { status: 400 });
      }
    }
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
      stateId: body.stateId,
      districtId: body.districtId,
      cityId: body.cityId,
      localityId: body.localityId,
      pincodeId: body.pincodeId,
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
