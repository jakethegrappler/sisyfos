// Název cache a seznam URL k cachování
const CACHE_NAME = 'sisyphos-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './images/walk_256-1.png',
    './images/walk_256-2.png',
    './images/sis-fall-256.png',
    './SISYPHUS.mp3'
];

// Instalace Service Workeru
self.addEventListener('install', event => {
    // Čeká na dokončení instalace a otevření cache
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // Přidání všech URL do cache
                return cache.addAll(urlsToCache);
            })
    );
});

// Aktivace Service Workeru
self.addEventListener('activate', event => {
    // Čeká na dokončení aktivace a mazání starých verzí cache
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Pokud název cache není aktuální, smaže ji
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - obsluhuje požadavky na síť
self.addEventListener('fetch', event => {
    event.respondWith(
        // Pokusí se najít odpověď v cache
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // Pokud je odpověď nalezena v cache, vrátí ji
                    return response;
                }
                // Pokud odpověď není nalezena v cache, pokračuje požadavek na síť
                return fetch(event.request).then(response => {
                    // Kontrola, zda je odpověď platná
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // Klonuje odpověď, protože streamy mohou být použity pouze jednou
                    let responseToCache = response.clone();
                    // Otevře cache a uloží odpověď
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                });
            })
    );
});
