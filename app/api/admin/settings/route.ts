import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ settings: db.settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      platformCommissionPercent,
      gstPercent,
      defaultMinBidPaise,
      defaultIncrementPaise,
      instantOutbidAlerts,
      maintenanceMode,
    } = body;

    if (typeof platformCommissionPercent === 'number') {
      db.settings.platformCommissionPercent = platformCommissionPercent;
    }
    if (typeof gstPercent === 'number') {
      db.settings.gstPercent = gstPercent;
    }
    if (typeof defaultMinBidPaise === 'number') {
      db.settings.defaultMinBidPaise = defaultMinBidPaise;
    }
    if (typeof defaultIncrementPaise === 'number') {
      db.settings.defaultIncrementPaise = defaultIncrementPaise;
    }
    if (typeof instantOutbidAlerts === 'boolean') {
      db.settings.instantOutbidAlerts = instantOutbidAlerts;
    }
    if (typeof maintenanceMode === 'boolean') {
      db.settings.maintenanceMode = maintenanceMode;
    }

    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
