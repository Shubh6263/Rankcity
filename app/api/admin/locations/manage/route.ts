import { NextRequest, NextResponse } from 'next/server';
import { locationDb } from '@/lib/location/service';
import { verifyAdminRequest } from '@/lib/auth/admin-check';

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized: Admin authorization required' },
        { status: authResult.status || 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (!action || !['add', 'toggle_status', 'duplicate_candidates'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action ("add", "toggle_status", "duplicate_candidates") is required.' },
        { status: 400 }
      );
    }

    const adminId = authResult.adminId || 'admin';

    if (action === 'add') {
      const { type, data } = body;
      if (!type || !data) {
        return NextResponse.json({ error: 'type and data are required for adding a location.' }, { status: 400 });
      }

      const res = await locationDb.addLocation(type, data, adminId);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully added ${type} "${res.record?.name || res.record?.pincode}".`,
        record: res.record,
      });
    }

    if (action === 'toggle_status') {
      const { type, id, isActive } = body;
      if (!type || !id || typeof isActive !== 'boolean') {
        return NextResponse.json({ error: 'type, id, and boolean isActive are required.' }, { status: 400 });
      }

      const res = await locationDb.toggleLocationStatus(type, id, isActive, adminId);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully set ${type} (${id}) status to ${isActive ? 'active' : 'inactive'}.`,
        record: res.record,
      });
    }

    if (action === 'duplicate_candidates') {
      const { datasetType = 'cities' } = body;
      const candidates = locationDb.getDuplicateCandidates(datasetType);
      return NextResponse.json({ success: true, datasetType, candidates });
    }

    return NextResponse.json({ error: 'Unhandled action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
