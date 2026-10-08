import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || undefined;
    const teamMembers = db.getTeamMembers(businessId);
    return NextResponse.json({ success: true, teamMembers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId, name, email, role, permissions } = body;

    if (!businessId || !name || !email) {
      return NextResponse.json({ success: false, error: 'businessId, name, and email are required' }, { status: 400 });
    }

    const res = db.addTeamMember({
      businessId,
      name: name.trim(),
      email: email.trim(),
      role: role || 'BUSINESS_MANAGER',
      permissions: Array.isArray(permissions) ? permissions : ['manage_profile', 'manage_leads'],
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, member: res.member }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
