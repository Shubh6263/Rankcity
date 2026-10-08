import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId, userId, applicantName, phone, email, businessRole, registrationNumber, notes } = body;

    if (!businessId || !applicantName || !phone) {
      return NextResponse.json(
        { success: false, error: 'businessId, applicantName, and phone are required for business claiming' },
        { status: 400 }
      );
    }

    const res = db.claimBusiness(businessId, userId || 'user_guest', {
      applicantName,
      phone,
      email: email || '',
      businessRole: businessRole || 'Owner',
      registrationNumber,
      notes,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, business: res.business }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
