const CACHE_NAME = 'recipe-app-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './icons/icon-48x48.png',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',  
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/recipe.png', 
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Menginstal...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching semua aset...');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[Service Worker] Gagal caching:', err))
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Aktif.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[Service Worker] Dari cache:', event.request.url);
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          console.log('[Service Worker] Diambil dari network & dicache:', event.request.url);
          return networkResponse;
        });
      });
    }).catch(err => {
      console.error('[Service Worker] Fetch gagal:', err);
    })
  );
});