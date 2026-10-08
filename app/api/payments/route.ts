import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId') || undefined;
    const campaignId = searchParams.get('campaignId') || undefined;
    const userId = searchParams.get('userId') || undefined;

    const payments = db.getPayments({ businessId, campaignId, userId });
    return NextResponse.json({ success: true, payments });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, campaignId, userId, amountPaise, paymentMethod } = body;

    if (!businessId || !campaignId || !userId || !amountPaise) {
      return NextResponse.json(
        { error: 'businessId, campaignId, userId, and amountPaise are required.' },
        { status: 400 }
      );
    }

    const result = db.createPaymentRequest({
      businessId,
      campaignId,
      userId,
      amountPaise: Number(amountPaise),
      paymentMethod: paymentMethod || 'UPI',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, payment: result.payment });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
