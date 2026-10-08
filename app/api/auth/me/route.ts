import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const user = db.getUser(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const wallet = db.getWallet(user.id);
  const unreadNotifs = db.getNotifications(user.id).filter((n) => !n.read).length;

  return NextResponse.json({
    user,
    wallet,
    unreadNotifs,
    allUsers: db.getUsers(),
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, companyName, phone } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updated = db.updateUser(userId, {
      ...(name && { name }),
      ...(companyName !== undefined && { companyName }),
      ...(phone !== undefined && { phone }),
    });

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
