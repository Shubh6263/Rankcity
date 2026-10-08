import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.recordWebsiteClick(id);

  const website = db.getWebsiteById(id);
  return NextResponse.json({
    success: true,
    totalClicks: website?.totalClicks || 0,
    targetUrl: website?.url || website?.website || '#',
  });
}
