import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rankcity.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/indore',
          '/bhopal',
          '/mumbai',
          '/bengaluru',
          '/delhi',
          '/*/*',
          '/business/*',
          '/categories',
          '/explore',
          '/how-it-works',
          '/pricing',
          '/for-business',
          '/add-business',
          '/contact',
          '/terms',
          '/privacy',
          '/refund-policy',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/publisher',
          '/publisher/*',
          '/account',
          '/account/*',
          '/saved',
          '/saved/*',
          '/claim/*',
          '/api/*',
          '/sign-in/*',
          '/sign-up/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/publisher/*',
          '/account/*',
          '/saved/*',
          '/api/*',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/*', '/publisher/*', '/account/*', '/api/*'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin/*', '/publisher/*', '/account/*', '/api/*'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin/*', '/publisher/*', '/account/*', '/api/*'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin/*', '/publisher/*', '/account/*', '/api/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
