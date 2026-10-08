import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || undefined;
    const status = searchParams.get('status') || undefined;
    const reviews = db.getReviews(businessId, status);
    return NextResponse.json({ success: true, reviews });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId, userId, userName, rating, comment, photos } = body;

    if (!businessId || !comment || !rating) {
      return NextResponse.json({ success: false, error: 'businessId, rating, and comment are required' }, { status: 400 });
    }

    const result = db.createReview({
      businessId,
      userId: userId || 'user_guest',
      userName: userName || 'Local Consumer',
      rating: Number(rating),
      comment: String(comment).trim(),
      photos: Array.isArray(photos) ? photos : [],
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, review: result.review }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
