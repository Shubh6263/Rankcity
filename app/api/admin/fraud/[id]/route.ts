import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (!['resolved', 'banned'].includes(action)) {
      return NextResponse.json({ error: 'Invalid fraud resolution action' }, { status: 400 });
    }

    const success = db.resolveFraudAlert(id, action);
    if (!success) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Alert ${action} successfully` });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
