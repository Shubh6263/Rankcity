import { MetadataRoute } from 'next';
import { initialBusinesses, initialCategories, initialLocations } from '@/lib/db/initialData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rankcity.in';
  const currentDate = new Date().toISOString();

  // 1. High-priority Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-business`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/add-business`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. City Directory Landing Pages (GEO Local Search)
  const cityRoutes: MetadataRoute.Sitemap = initialLocations.map((loc) => ({
    url: `${baseUrl}/${loc.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. City + Category Discovery Pages (e.g. /indore/hotels, /mumbai/restaurants)
  const cityCategoryRoutes: MetadataRoute.Sitemap = [];
  for (const loc of initialLocations) {
    for (const cat of initialCategories) {
      cityCategoryRoutes.push({
        url: `${baseUrl}/${loc.slug}/${cat.slug}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.95,
      });
    }
  }

  // 4. Canonical Business Profile Detail Pages (LocalBusiness GEO entities)
  const businessRoutes: MetadataRoute.Sitemap = initialBusinesses.map((biz) => ({
    url: `${baseUrl}/business/${biz.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...cityCategoryRoutes,
    ...businessRoutes,
  ];
}
