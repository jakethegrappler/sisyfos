const cacheName = 'sisyphos-game-v1';
const assets = [
    '/',
    '/index.html',
    '/style.css',
    '/main.js',
    '/images/walk_256-1.png',
    '/images/walk_256-2.png',
    '/images/sis-fall-256.png',
    '/SISYPHUS.mp3',
    'https://fonts.googleapis.com/css2?family=Danfo&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap'
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('[Service Worker] Caching all: app shell and content');
            return cache.addAll(assets).catch(err => {
                console.error('Failed to cache', err);
            });
        })
    );
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate');
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== cacheName) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetch', event.request.url);
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log('[Service Worker] Found in cache', event.request.url);
                return response;
            }
            console.log('[Service Worker] Network request for', event.request.url);
            return fetch(event.request).then(response => {
                return caches.open(cacheName).then(cache => {
                    cache.put(event.request.url, response.clone());
                    return response;
                });
            });
        }).catch(error => {
            console.error('[Service Worker] Error fetching and caching new data', error);
        })
    );
});
