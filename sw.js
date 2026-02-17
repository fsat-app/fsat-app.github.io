// sw.js (Service Worker)
const CACHE_NAME = 'aquarelle-pwa-cache-v61';

const ROOT = "/"

const urlsToCache = [
   ROOT,
   ROOT + 'index.html',
   ROOT + 'lib/dexie.min.js',
   ROOT + 'lib/sweetalert2@11.js',
   ROOT + 'lib/aos.min.js',
   ROOT + 'lib/xlsx.full.min.js',
   ROOT + 'lib/chart.min.js',
   ROOT + 'app/fsat.min.js',
   ROOT + 'manifest.json',
   ROOT + 'css/aos.min.css',
   ROOT + 'css/custom.css',
   ROOT + 'css/pico.min.css',
   ROOT + 'font/style.css',
   ROOT + 'css/font/Zain-ExtraLight.ttf',
   ROOT + 'css/font/Zain-Light.ttf',
   ROOT + 'css/font/Zain-Regular.ttf',
   ROOT + 'css/font/Zain-Bold.ttf',
   ROOT + 'css/font/Zain-ExtraBold.ttf',
   ROOT + 'css/font/Zain-Black.ttf',
   ROOT + 'css/font/Zain-LightItalic.ttf',
   ROOT + 'css/font/Zain-Italic.ttf',
   ROOT + 'img/logos/hug-white.png',
   ROOT + 'img/logos/fmed-white.png',
   ROOT + 'img/logos/cc.png',
   ROOT + 'img/logos/fsat.jpg',
   ROOT + 'img/icons/icon-gallery.png',
   ROOT + 'img/icons/icon-checkup.png',
   ROOT + 'img/graphics/body-bg-top.jpg',
   ROOT + 'img/graphics/body-fig-1.jpg',
   ROOT + 'img/graphics/body-fig-2w.png',
   ROOT + 'img/graphics/body-fig-2y.png',
   ROOT + 'img/graphics/body-fig-3.png',
   ROOT + 'img/graphics/hero.png',
   ROOT + 'img/graphics/popup-brush.png',
   ROOT + 'img/graphics/popup-fig-1.jpg',
   ROOT + 'img/graphics/popup-fig-2.jpg',
   ROOT + 'img/gallery/1A.jpg',
   ROOT + 'img/gallery/1B.jpg',
   ROOT + 'img/gallery/2A.jpg',
   ROOT + 'img/gallery/2B.jpg',
   ROOT + 'img/gallery/2C.jpg',
   ROOT + 'img/gallery/3B.jpg',
   ROOT + 'img/gallery/NM1.jpg',
   ROOT + 'img/gallery/unknown.jpg',
   ROOT + 'img/gallery-l/1A.jpg',
   ROOT + 'img/gallery-l/1B.jpg',
   ROOT + 'img/gallery-l/2A.jpg',
   ROOT + 'img/gallery-l/2B.jpg',
   ROOT + 'img/gallery-l/2C.jpg',
   ROOT + 'img/gallery-l/3B.jpg',
   ROOT + 'img/oms/I.jpg',
   ROOT + 'img/oms/II.jpg',
   ROOT + 'img/oms/III.jpg',
   ROOT + 'img/oms/NM.jpg',
   ROOT + 'asset/countries-ISO-3166.json',
   ROOT + 'fav/apple-touch-icon.png',
   ROOT + 'fav/favicon.ico',
   ROOT + 'fav/favicon.svg',
   ROOT + 'fav/favicon-96x96.png',
   ROOT + 'fav/site.webmanifest',
   ROOT + 'fav/web-app-manifest-192x192.png',
   ROOT + 'fav/web-app-manifest-512x512.png'
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
    if (cacheKey === ROOT || cacheKey === ROOT.slice(0, -1)) { 
        cacheKey = ROOT + 'index.html';
    }

    event.respondWith(
        caches.match(cacheKey)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).catch(() => {
                    return caches.match(ROOT + 'index.html');
                });
            })
    );

});


