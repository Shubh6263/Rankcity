import { NextRequest, NextResponse } from 'next/server';
import { locationDb } from '@/lib/location/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as any) || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = locationDb.getSuggestions({ status, limit, offset });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.stateName) {
      return NextResponse.json(
        { error: 'Location name and State name are required.' },
        { status: 400 }
      );
    }

    const suggestion = await locationDb.createSuggestion({
      locationType: body.locationType || 'city',
      name: body.name.trim(),
      stateName: body.stateName.trim(),
      districtName: body.districtName ? body.districtName.trim() : undefined,
      cityName: body.cityName ? body.cityName.trim() : undefined,
      pincode: body.pincode ? body.pincode.trim() : undefined,
      submittedByUserId: body.submittedByUserId || undefined,
      contactEmail: body.contactEmail || undefined,
      notes: body.notes || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your location suggestion has been submitted for administrative verification.',
      suggestion,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
