import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const type = body.type as 'call' | 'whatsapp' | 'directions' | 'website' | 'view';

    db.recordLead(id, type || 'view');
    const biz = db.getBusinessById(id);

    return NextResponse.json({
      success: true,
      leadType: type,
      totalCalls: biz?.totalCalls || 0,
      totalWhatsapp: biz?.totalWhatsapp || 0,
      totalDirections: biz?.totalDirections || 0,
      totalWebsiteClicks: biz?.totalWebsiteClicks || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
