import { NextRequest, NextResponse } from 'next/server';
import { locationDb } from '@/lib/location/service';
import { verifyAdminRequest } from '@/lib/auth/admin-check';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized: Admin authorization required' },
        { status: authResult.status || 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.status || !['approved', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Valid status ("approved" or "rejected") is required.' },
        { status: 400 }
      );
    }

    const updated = await locationDb.updateSuggestionStatus(
      id,
      body.status,
      body.adminNotes,
      authResult.adminId || 'admin'
    );

    if (!updated) {
      return NextResponse.json({ error: 'Suggestion not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Suggestion marked as ${body.status}.`,
      suggestion: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
