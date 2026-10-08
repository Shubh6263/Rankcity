import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, email, avatarUrl, phone } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Determine initial role: Check if user already owns businesses in db
    const existingUser = db.getUser(userId);
    const existingBusinesses = db.getBusinesses(userId);
    const role = existingUser?.role || (existingBusinesses.length > 0 ? 'BUSINESS_OWNER' : 'CUSTOMER');

    const user = db.upsertUser({
      id: userId,
      name: name || existingUser?.name || 'User',
      email: email || existingUser?.email || '',
      role,
      phone: phone || existingUser?.phone,
      avatarUrl: avatarUrl || existingUser?.avatarUrl,
    });

    const wallet = db.getWallet(user.id);
    const businesses = db.getBusinesses(user.id);

    return NextResponse.json({
      success: true,
      user,
      wallet,
      businesses,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
