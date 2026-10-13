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

    const {
      datasetType,
      source,
      rawContent,
      isCsv = false,
      fileName,
      dryRun = false,
      adminId,
    } = body;

    const allowedTypes = ['states', 'districts', 'cities', 'villages', 'localities', 'pincodes'];
    if (!datasetType || !allowedTypes.includes(datasetType)) {
      return NextResponse.json(
        { error: `Invalid datasetType. Must be one of: ${allowedTypes.join(', ')}.` },
        { status: 400 }
      );
    }

    if (!rawContent || typeof rawContent !== 'string') {
      return NextResponse.json(
        { error: 'rawContent is required as a string (CSV or JSON).' },
        { status: 400 }
      );
    }

    const report = await locationDb.runImport({
      datasetType,
      source: source || 'CUSTOM_JSON',
      rawContent,
      isCsv,
      fileName: fileName || `${datasetType}_import_${Date.now()}`,
      dryRun: !!dryRun,
      adminId: authResult.adminId || adminId || 'admin',
    });

    return NextResponse.json({
      success: report.status !== 'failed',
      report,
      message: dryRun
        ? `Dry run preview complete: ${report.recordsAdded} would be added, ${report.recordsUpdated} would be updated, ${report.recordsRejected} rejected.`
        : `Import processed: ${report.recordsAdded} added, ${report.recordsUpdated} updated, ${report.recordsRejected} rejected.`,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
