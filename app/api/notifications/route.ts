import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'user_pub_1';
  const notifications = db.getNotifications(userId);
  return NextResponse.json({ notifications });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (id) {
    db.markNotificationRead(id);
  }
  return NextResponse.json({ success: true });
}
