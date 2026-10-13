/**
 * RankCity Progressive Web App Service Worker
 * Version: 1.1.0
 */

const VERSION = 'rankcity-v1.2';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const IMAGE_CACHE = `${VERSION}-images`;

// Core static assets required for offline shell
const PRECACHE_URLS = [
  '/',
  '/?source=pwa',
  '/offline',
  '/explore',
  '/manifest.json',
  '/manifest.webmanifest',
  '/rankcity-logo.png',
  '/favicon.svg',
  '/favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/icon.svg',
];

// Sensitive or private API endpoints that must NEVER be stored in service worker cache
function isSensitiveApi(pathname) {
  return (
    pathname.startsWith('/api/wallet') ||
    pathname.startsWith('/api/payments') ||
    pathname.startsWith('/api/invoices') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/verification') ||
    pathname.startsWith('/api/claim') ||
    pathname.startsWith('/api/team')
  );
}

// Install: pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            fetch(url, { cache: 'no-cache' })
              .then((res) => {
                if (res.ok) {
                  return cache.put(url, res);
                }
              })
              .catch((err) => {
                console.warn(`[PWA SW] Precache skipped for ${url}:`, err.message);
              })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[PWA SW] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event listener
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests (mutations: POST, PUT, DELETE, PATCH)
  if (request.method !== 'GET') {
    return;
  }

  // Ignore non-http/https (e.g. chrome-extension:, data:, blob:)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignore Clerk authentication, analytics, and external auth endpoints
  if (
    url.pathname.startsWith('/__clerk') ||
    url.hostname.includes('clerk') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('supabase')
  ) {
    return;
  }

  // In development, ignore dev-specific versioned chunks and HMR requests
  if (
    url.searchParams.has('v') ||
    url.pathname.includes('/_next/webpack-hmr') ||
    url.pathname.includes('/__nextjs_original-stack-frame')
  ) {
    return;
  }

  // 1. Navigation requests (HTML pages)
  // Strategy: Network-First with Cache Fallback and Offline Page Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Check runtime/static cache for this exact page
          let cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Check runtime/static cache ignoring query string (e.g. /?source=pwa -> /)
          cachedResponse = await caches.match(request, { ignoreSearch: true });
          if (cachedResponse) {
            return cachedResponse;
          }

          // If root path, check precached root
          if (url.pathname === '/' || url.pathname === '') {
            const rootPage = await caches.match('/');
            if (rootPage) return rootPage;
          }

          // Dedicated offline fallback page
          const offlinePage = await caches.match('/offline');
          if (offlinePage) {
            return offlinePage;
          }

          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline | RankCity</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;text-align:center;padding:40px"><h1>RankCity - Offline</h1><p>Please check your internet connection and try again.</p><button onclick="location.reload()" style="padding:10px 20px;border-radius:8px;background:#2563EB;color:#fff;border:none;cursor:pointer">Retry</button></body></html>',
            {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // 2. Next.js App Router Client-Side Navigation (RSC Payloads)
  // Soft navigations via <Link> send RSC requests. Handle with Network-First and cached fallback.
  const isRscRequest =
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1' ||
    url.searchParams.has('_rsc') ||
    request.headers.get('Accept')?.includes('text/x-component');

  if (isRscRequest) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse =
            (await caches.match(request)) ||
            (await caches.match(request, { ignoreSearch: true }));
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and RSC missing, return empty 200 with text/x-component or 503
          return new Response('', {
            status: 503,
            statusText: 'Offline RSC payload unavailable',
            headers: { 'Content-Type': 'text/x-component' },
          });
        })
    );
    return;
  }

  // 3. Static Next.js assets (_next/static/*) and CSS/JS/Fonts
  // Strategy: Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Images (destination === 'image' or image file extensions)
  // Strategy: Cache-First with Network Fallback
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // If icon requested while offline, return fallback icon
            if (url.pathname.includes('/icons/')) {
              return caches.match('/icons/icon-192x192.png');
            }
            return new Response('', { status: 408, statusText: 'Request timed out' });
          });
      })
    );
    return;
  }

  // 5. Read-only API requests (GET /api/...)
  // Exclude sensitive/financial endpoints from caching.
  if (url.pathname.startsWith('/api/')) {
    if (isSensitiveApi(url.pathname)) {
      // Sensitive endpoint: Network only, NEVER cache in service worker
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(
            JSON.stringify({ error: 'You are currently offline', offline: true }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
      );
      return;
    }

    // Public read-only API: Network-First with Cache Fallback
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const cacheControl = networkResponse.headers.get('cache-control') || '';
          const isNoStore = cacheControl.includes('no-store') || cacheControl.includes('private');

          if (networkResponse && networkResponse.status === 200 && !isNoStore) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            JSON.stringify({ error: 'You are currently offline', offline: true }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // Default: Network fetch
  event.respondWith(fetch(request));
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    });
  }
});
