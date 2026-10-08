import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const verifications = db.getVerifications(status);
    return NextResponse.json({ success: true, verifications });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId, submittedBy, submitterName, documentType, documentNumber, documentUrl, notes } = body;

    if (!businessId || !documentType || !documentNumber) {
      return NextResponse.json(
        { success: false, error: 'businessId, documentType, and documentNumber are required' },
        { status: 400 }
      );
    }

    const res = db.submitVerification({
      businessId,
      submittedBy: submittedBy || 'user_pub_2',
      submitterName: submitterName || 'Business Owner',
      documentType,
      documentNumber,
      documentUrl,
      notes,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, verification: res.verification }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
