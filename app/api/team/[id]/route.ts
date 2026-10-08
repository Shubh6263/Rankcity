import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = db.removeTeamMember(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Team member not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Team member removed' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
