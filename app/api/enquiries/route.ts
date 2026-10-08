import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || undefined;
    const ownerId = searchParams.get('ownerId') || undefined;
    const leads = db.getLeads(businessId, ownerId);
    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessId,
      campaignId,
      customerName,
      customerPhone,
      customerEmail,
      message,
      serviceRequested,
      preferredTime,
      type = 'enquiry',
    } = body;

    if (!businessId || !customerName || !customerPhone || !message) {
      return NextResponse.json(
        { success: false, error: 'businessId, customerName, customerPhone, and message are required' },
        { status: 400 }
      );
    }

    const result = db.createLead({
      businessId,
      campaignId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim(),
      message: message.trim(),
      serviceRequested,
      preferredTime,
      type,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, lead: result.lead }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
