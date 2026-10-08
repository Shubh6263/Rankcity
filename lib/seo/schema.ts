import { Business, Category, LocationHierarchy } from '@/types';

export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://rankcity.in';

/**
 * Maps RankCity category IDs to appropriate Schema.org types
 */
export function getSchemaTypeForCategory(categoryId: string): string {
  switch (categoryId.toLowerCase()) {
    case 'hotels':
      return 'Hotel';
    case 'restaurants':
      return 'Restaurant';
    case 'healthcare':
      return 'MedicalBusiness';
    case 'services':
      return 'LocalBusiness';
    case 'shopping':
      return 'Store';
    case 'automotive':
      return 'AutoRepair';
    case 'beauty-wellness':
      return 'BeautySalon';
    default:
      return 'LocalBusiness';
  }
}

/**
 * Generates Schema.org LocalBusiness JSON-LD for rich snippets, Google Maps integration & GEO
 */
export function generateLocalBusinessSchema(business: Business) {
  const schemaType = getSchemaTypeForCategory(business.categoryId);

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `${APP_BASE_URL}/business/${business.slug}#business`,
    name: business.name,
    description: business.description,
    url: `${APP_BASE_URL}/business/${business.slug}`,
    telephone: business.phone,
    image: business.coverImage ? [business.coverImage, ...(business.photos || [])] : business.photos,
    priceRange: '₹₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city || 'Indore',
      addressRegion: 'Madhya Pradesh',
      postalCode: '452010',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.latitude || 22.7533,
      longitude: business.longitude || 75.8937,
    },
    hasMap: `https://maps.google.com/?q=${encodeURIComponent(`${business.name}, ${business.address}`)}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      reviewCount: business.reviewCount || 10,
      bestRating: '5',
      worstRating: '1',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:00',
        closes: '22:00',
      },
    ],
    amenityFeature: (business.amenities || []).map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
  };
}

/**
 * Generates Schema.org BreadcrumbList for hierarchical Google search SERP breadcrumbs
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${APP_BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Generates Schema.org FAQPage for Answer Engine Optimization (AEO - Google AI Overviews, Perplexity, ChatGPT)
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generates Schema.org ItemList for city + category listing pages
 */
export function generateCategoryItemListSchema(
  cityName: string,
  categoryName: string,
  businesses: Business[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top Rated & Sponsored ${categoryName} in ${cityName}`,
    description: `Curated directory of trusted and verified ${categoryName.toLowerCase()} in ${cityName}, India.`,
    numberOfItems: businesses.length,
    itemListElement: businesses.map((biz, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${APP_BASE_URL}/business/${biz.slug}`,
      name: biz.name,
    })),
  };
}

/**
 * Generates generic Schema.org ItemList for hub pages
 */
export function generateGenericItemListSchema(
  title: string,
  description: string,
  items: { name: string; url: string; description?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: item.url.startsWith('http') ? item.url : `${APP_BASE_URL}${item.url}`,
      name: item.name,
      description: item.description,
    })),
  };
}

/**
 * Root Organization Schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${APP_BASE_URL}#organization`,
    name: 'RankCity',
    url: APP_BASE_URL,
    logo: `${APP_BASE_URL}/logo.png`,
    description:
      'India’s local business discovery and transparent sponsored ranking marketplace.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98260-12345',
      contactType: 'customer support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://twitter.com/rankcityin',
      'https://facebook.com/rankcityin',
      'https://instagram.com/rankcityin',
      'https://linkedin.com/company/rankcity',
    ],
  };
}

/**
 * Root WebSite Schema with Sitelinks SearchBox
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${APP_BASE_URL}#website`,
    url: APP_BASE_URL,
    name: 'RankCity',
    description: 'Discover the Best Businesses in Your City',
    publisher: {
      '@id': `${APP_BASE_URL}#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${APP_BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
