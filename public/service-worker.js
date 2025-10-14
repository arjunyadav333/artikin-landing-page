// Phase 10: Service Worker for aggressive caching and offline support
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Cache duration (5 minutes for API)
const API_CACHE_DURATION = 5 * 60 * 1000;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/artikin-favicon.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('static-') || name.startsWith('api-') || name.startsWith('images-');
          })
          .filter((name) => {
            return name !== STATIC_CACHE && name !== API_CACHE && name !== IMAGE_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Strategy 1: Cache-First for static assets (JS, CSS, fonts, images)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200) {
            return response;
          }

          const cacheName = request.destination === 'image' ? IMAGE_CACHE : STATIC_CACHE;
          const responseToCache = response.clone();

          caches.open(cacheName).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
    );
    return;
  }

  // Strategy 2: Stale-While-Revalidate for API requests
  if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        // Check if cache is still fresh (within 5 minutes)
        if (cachedResponse) {
          const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time') || 0).getTime();
          const now = Date.now();
          
          if (now - cacheTime < API_CACHE_DURATION) {
            // Cache is fresh, return it immediately
            return cachedResponse;
          }
        }

        // Fetch fresh data
        const fetchPromise = fetch(request)
          .then((response) => {
            // Don't cache unsuccessful responses
            if (!response || response.status !== 200) {
              return response;
            }

            const responseToCache = response.clone();
            const headers = new Headers(responseToCache.headers);
            headers.append('sw-cache-time', new Date().toISOString());
            
            const modifiedResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers,
            });

            cache.put(request, modifiedResponse);
            return response;
          })
          .catch(() => {
            // Network failed, return stale cache if available
            return cachedResponse || new Response('Offline', { status: 503 });
          });

        // Return stale cache immediately if available, fetch in background
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy 3: Network-First for navigation (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }
});