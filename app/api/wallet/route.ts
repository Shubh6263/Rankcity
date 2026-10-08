import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const wallet = db.getWallet(userId);
  const transactions = db.getTransactions(userId);

  return NextResponse.json({
    wallet,
    availableBalancePaise: wallet.balancePaise - wallet.reservedPaise,
    transactions,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amountPaise, paymentMethod, upiId } = body;

    if (!userId || !amountPaise || amountPaise < 5000) {
      return NextResponse.json({ error: 'Minimum deposit amount is ₹50 (5000 paise)' }, { status: 400 });
    }

    const result = db.depositFunds({
      userId,
      amountPaise: Number(amountPaise),
      paymentMethod: paymentMethod || 'UPI',
      upiId,
    });

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      wallet: db.getWallet(userId),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
