'use client';

import { use } from 'react';
import RankingBoardPage from '@/app/rankings/[category]/[location]/page';

interface LocationCategoryPageProps {
  params: Promise<{
    location: string;
    category: string;
  }>;
}

export default function LocationCategoryPage({ params }: LocationCategoryPageProps) {
  const { location, category } = use(params);

  // Adapt params to the { category, location } format expected by RankingBoardPage
  const rankingParams = Promise.resolve({
    category,
    location,
  });

  return <RankingBoardPage params={rankingParams} />;
}
