// sw.js
const CACHE_NAME = 'fsat-pwa-cache-v70';

console.log(CACHE_NAME)

const STATIC_ASSETS = [
  '/index.html',
  '/lib/dexie.min.js',
  '/lib/sweetalert2@11.js',
  '/lib/aos.min.js',
  '/lib/xlsx.full.min.js',
  '/lib/chart.min.js',
  '/app/fsat.min.js',
  '/manifest.json',
  '/css/aos.min.css',
  '/css/custom.css',
  '/css/pico.min.css',
  '/css/font/Zain-ExtraLight.ttf',
  '/css/font/Zain-Light.ttf',
  '/css/font/Zain-Regular.ttf',
  '/css/font/Zain-Bold.ttf',
  '/css/font/Zain-ExtraBold.ttf',
  '/css/font/Zain-Black.ttf',
  '/css/font/Zain-LightItalic.ttf',
  '/css/font/Zain-Italic.ttf',
  '/img/logos/hug-white.png',
  '/img/logos/fmed-white.png',
  '/img/logos/cc.png',
  '/img/logos/fsat.jpg',
  '/img/graphics/body-bg-top.jpg',
  '/img/graphics/body-fig-1.jpg',
  '/img/graphics/body-fig-2w.png',
  '/img/graphics/body-fig-2y.png',
  '/img/graphics/body-fig-3.png',
  '/img/graphics/hero.png',
  '/img/graphics/popup-brush.png',
  '/img/graphics/popup-fig-1.jpg',
  '/img/graphics/popup-fig-2.jpg',
  '/img/gallery/1A.jpg',
  '/img/gallery/1B.jpg',
  '/img/gallery/2A.jpg',
  '/img/gallery/2B.jpg',
  '/img/gallery/2C.jpg',
  '/img/gallery/3B.jpg',
  '/img/gallery/NM1.jpg',
  '/img/gallery/unknown.jpg',
  '/img/gallery-l/1A.jpg',
  '/img/gallery-l/1B.jpg',
  '/img/gallery-l/2A.jpg',
  '/img/gallery-l/2B.jpg',
  '/img/gallery-l/2C.jpg',
  '/img/gallery-l/3B.jpg',
  '/img/oms/I.jpg',
  '/img/oms/II.jpg',
  '/img/oms/III.jpg',
  '/img/oms/NM.jpg',
  '/asset/countries-ISO-3166.json',
  '/fav/apple-touch-icon.png',
  '/fav/favicon.ico',
  '/fav/favicon.svg',
  '/fav/favicon-96x96.png',
  '/fav/site.webmanifest',
  '/fav/web-app-manifest-192x192.png',
  '/fav/web-app-manifest-512x512.png'
];


// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});


// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});


// FETCH
self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') return;

  const request = event.request;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes externes
  if (url.origin !== location.origin) return;

  // 1️⃣ Navigation HTML → network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put('/index.html', clone);
          });
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2️⃣ Assets statiques → cache-first avec fallback réseau
  event.respondWith(
    caches.match(request, { ignoreSearch: true })
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clone);
            });

            return networkResponse;
          });
      })
  );
});





