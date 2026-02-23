// sw.js (Service Worker)
const CACHE_NAME = 'aquarelle-pwa-cache-v65';
const urlsToCache = [
   '/',
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
  '/font/style.css',
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
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching files:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        Promise.all([
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (!cacheWhitelist.includes(cacheName)) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    let requestUrl = new URL(event.request.url);
    let cacheKey = requestUrl.pathname;
    // Normalise la racine
    if (cacheKey === '/') {
       cacheKey ='/index.html';
    }
    event.respondWith(
        caches.match(cacheKey)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).catch(() => {
                    return caches.match('/index.html');
                });
            })
    );
});


