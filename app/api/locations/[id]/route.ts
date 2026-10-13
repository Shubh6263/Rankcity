import { NextRequest, NextResponse } from 'next/server';
import { locationDb } from '@/lib/location/service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';

    if (type === 'state' || id.startsWith('st_')) {
      const state = locationDb.getStateById(id);
      if (!state) return NextResponse.json({ error: 'State not found' }, { status: 404 });
      return NextResponse.json({ location: state, type: 'state' });
    }

    if (type === 'district' || id.startsWith('dst_')) {
      const district = locationDb.getDistrictById(id);
      if (!district) return NextResponse.json({ error: 'District not found' }, { status: 404 });
      const state = locationDb.getStateById(district.stateId);
      return NextResponse.json({ location: district, state, type: 'district' });
    }

    if (type === 'city' || id.startsWith('cty_')) {
      const city = locationDb.getCityById(id);
      if (!city) return NextResponse.json({ error: 'City not found' }, { status: 404 });
      const district = locationDb.getDistrictById(city.districtId);
      const state = district ? locationDb.getStateById(district.stateId) : undefined;
      return NextResponse.json({ location: city, district, state, type: 'city' });
    }

    // Try finding across all levels
    const city = locationDb.getCityById(id);
    if (city) {
      const district = locationDb.getDistrictById(city.districtId);
      const state = district ? locationDb.getStateById(district.stateId) : undefined;
      return NextResponse.json({ location: city, district, state, type: 'city' });
    }

    const district = locationDb.getDistrictById(id);
    if (district) {
      const state = locationDb.getStateById(district.stateId);
      return NextResponse.json({ location: district, state, type: 'district' });
    }

    const state = locationDb.getStateById(id);
    if (state) {
      return NextResponse.json({ location: state, type: 'state' });
    }

    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
