import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { rejectionReason, verifiedBy } = body;

    if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is mandatory when rejecting a payment.' },
        { status: 400 }
      );
    }

    const result = db.rejectPayment({
      paymentId: id,
      rejectionReason: rejectionReason.trim(),
      verifiedBy: verifiedBy || 'usr_admin',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment rejected successfully.',
      payment: result.payment,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
