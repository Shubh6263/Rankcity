import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, moderatorId } = body;

    if (!['approved', 'flagged', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid moderation status' }, { status: 400 });
    }

    const result = db.moderateReview(id, status, moderatorId || 'user_mod');
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: result.review });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
