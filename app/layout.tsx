import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { generateOrganizationSchema, generateWebSiteSchema, APP_BASE_URL } from '@/lib/seo/schema';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['500', '600', '700', '800', '900'],
});

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  title: {
    default: 'RankCity - Discover the Best Businesses in Your City | Local Search & Verified Rankings',
    template: '%s | RankCity',
  },
  description:
    'Discover top-rated, trusted, and verified local businesses, luxury hotels, authentic restaurants, hospitals, and services across Indore, Bhopal, Mumbai, and top Indian cities with real reviews.',
  applicationName: 'RankCity',
  authors: [{ name: 'RankCity Team', url: APP_BASE_URL }],
  creator: 'RankCity',
  publisher: 'RankCity',
  keywords: [
    'local business search',
    'best hotels in indore',
    'top restaurants in indore',
    'best hospitals in madhya pradesh',
    'verified local businesses',
    'rankcity',
    'local search engine india',
    'top rated businesses near me',
    'indore business directory',
    'bhopal hotels and clinics',
    'sponsored ranking marketplace',
    'local services reviews and ratings',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RankCity - Discover the Best Businesses in Your City',
    description:
      'Explore top-rated, trusted, and verified local businesses, luxury hotels, authentic restaurants, hospitals, and services across Indian cities.',
    url: APP_BASE_URL,
    siteName: 'RankCity',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${APP_BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'RankCity - Local Business Discovery and Sponsored Rankings',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RankCity - Discover the Best Businesses in Your City',
    description:
      'Top-rated, trusted and verified local businesses, hotels, restaurants, and hospitals across Indian cities — all in one place.',
    creator: '@rankcityin',
    images: [`${APP_BASE_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-rankcity-token',
  },
  category: 'business discovery',
};

import { LocationProvider } from '@/lib/location/context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" className={`h-full antialiased scroll-smooth ${plusJakarta.variable} ${outfit.variable}`}>
      <head>
        {/* Schema.org Global Organization and WebSite JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-white text-neutral-900 selection:bg-blue-600 selection:text-white">
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
          <ClerkProvider>
            <AuthProvider>
              <LocationProvider>{children}</LocationProvider>
            </AuthProvider>
          </ClerkProvider>
        ) : (
          <LocationProvider>{children}</LocationProvider>
        )}
      </body>
    </html>
  );
}
