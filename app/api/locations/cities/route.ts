import { NextRequest, NextResponse } from 'next/server';
import { locationDb } from '@/lib/location/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stateId = searchParams.get('stateId') || undefined;
    const districtId = searchParams.get('districtId') || undefined;
    const search = searchParams.get('search') || undefined;
    const cityType = searchParams.get('cityType') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
    const isActive = searchParams.get('isActive') !== 'false';

    const result = locationDb.getCities({ stateId, districtId, search, cityType, limit, offset, isActive });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
