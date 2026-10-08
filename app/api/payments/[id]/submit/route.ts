import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { utr, screenshotUrl } = body;

    if (!utr || typeof utr !== 'string' || utr.trim().length < 6) {
      return NextResponse.json(
        { error: 'Valid UTR / Transaction Reference (minimum 6 characters) is mandatory.' },
        { status: 400 }
      );
    }

    const result = db.submitPaymentUtr({
      paymentId: id,
      utr: utr.trim(),
      screenshotUrl: screenshotUrl || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment details submitted successfully. Under admin verification.',
      payment: result.payment,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
