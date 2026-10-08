import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, reviewerId } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Status must be approved or rejected' }, { status: 400 });
    }

    const res = db.reviewVerification(id, status, notes, reviewerId || 'user_admin');
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, verification: res.verification });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
