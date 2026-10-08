import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'healthcare';
  const subcategory = searchParams.get('subcategory') || undefined;
  const location = searchParams.get('location') || undefined;

  const data = db.getRankings(category, location, subcategory);
  const recentBids = db.bids.slice(0, 10);

  return NextResponse.json({
    ...data,
    recentBids,
  });
}
