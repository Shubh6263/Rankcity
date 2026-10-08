'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryRankingRedirect({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const router = useRouter();
  const { category } = use(params);

  useEffect(() => {
    // Default to the featured location (Indore for healthcare, Bengaluru for tech, Mumbai for business)
    if (category === 'services' || category === 'technology') {
      router.replace(`/rankings/${category}/bengaluru`);
    } else if (category === 'business') {
      router.replace(`/rankings/${category}/mumbai`);
    } else {
      router.replace(`/rankings/${category}/indore`);
    }
  }, [category, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-xs text-neutral-500">
      Loading regional auction board...
    </div>
  );
}
