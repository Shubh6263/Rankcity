import { NextRequest, NextResponse } from 'next/server';
import { locationDb } from '@/lib/location/service';
import { verifyAdminRequest } from '@/lib/auth/admin-check';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized: Admin authorization required' },
        { status: authResult.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = locationDb.getImportLogs({ limit, offset });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

