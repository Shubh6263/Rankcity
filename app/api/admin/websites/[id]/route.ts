import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, rejectionReason, isFeatured } = body;

    const web = db.getWebsiteById(id);
    if (!web) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    if (status) {
      db.updateWebsiteStatus(id, status, rejectionReason);
    }

    if (typeof isFeatured === 'boolean') {
      web.isFeatured = isFeatured;
    }

    return NextResponse.json({ success: true, website: web });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
