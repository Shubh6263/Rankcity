import { NextResponse } from 'next/server';
import { locationDb } from '@/lib/location/service';

export async function GET() {
  try {
    const stats = locationDb.getLocationStats();
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
