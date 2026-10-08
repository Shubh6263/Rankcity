import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const categories = db.getCategories();
  const locations = db.getLocations();
  return NextResponse.json(
    { categories, locations },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, minBidPaise, bidIncrementPaise, commissionPercent, subcategories } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = {
      id: `cat_${Date.now()}`,
      name,
      slug,
      description: description || '',
      iconName: 'Tag',
      minBidPaise: minBidPaise || 1000,
      bidIncrementPaise: bidIncrementPaise || 100,
      commissionPercent: commissionPercent || 15,
      isActive: true,
      subcategories: Array.isArray(subcategories)
        ? subcategories.map((s: string, idx: number) => ({
            id: `sub_${Date.now()}_${idx}`,
            categoryId: `cat_${Date.now()}`,
            name: s,
            slug: s.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          }))
        : [],
    };

    db.categories.push(newCat);
    return NextResponse.json({ success: true, category: newCat });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
