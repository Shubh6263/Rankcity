import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const counts = db.getDataCounts();
  return NextResponse.json({
    success: true,
    counts,
    hasData: !counts.isClean,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'clear' || action === 'remove_dummy') {
      const result = db.clearSampleData();
      return NextResponse.json(result);
    }

    if (action === 'seed' || action === 'make_dummy') {
      const result = db.seedSampleData();
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: "clear" (or "remove_dummy") and "seed" (or "make_dummy").' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
