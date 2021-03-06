const CACHE_NAME = 'vue-count-down-2';

const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './serviceworker-cache-polyfill.js',
    './assets/img/blank-thumbnail.png',
    './assets/img/favicon.png',
    './assets/img/icon-48.png',
    './assets/img/icon-96.png',
    './assets/img/icon-128.png',
    './assets/img/icon-144.png',
    './assets/img/icon-152.png',
    './assets/img/icon-196.png',
    './assets/img/icon-384.png',
    './script.js',
    './nosleep.js',
    './styles.css'
];

// Set the callback for the install step
self.oninstall = function(e) {
    console.log('[serviceWorker]: Installing...');
    // perform install steps
    e.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                console.log('[serviceWorker]: Cache All');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                console.log(
                    '[serviceWorker]: Intalled And Skip Waiting on Install'
                );
                return self.skipWaiting();
            })
    );
};

self.onfetch = function(e) {
    console.log('[serviceWorker]: Fetching ' + e.request.url);
    var raceUrl = 'API/';
    if (e.request.url.indexOf(raceUrl) > -1) {
        e.respondWith(
            caches.open(CACHE_NAME).then(function(cache) {
                return fetch(e.request)
                    .then(function(res) {
                        cache.put(e.request.url, res.clone());
                        return res;
                    })
                    .catch(err => {
                        console.log('[serviceWorker]: Fetch Error ' + err);
                    });
            })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function(res) {
                return res || fetch(e.request);
            })
        );
    }
};

self.onactivate = function(e) {
    console.log('[serviceWorker]: Actived');

    var whiteList = [ 'vue-count-down-2' ];

    e.waitUntil(
        caches
            .keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (whiteList.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                console.log('[serviceWorker]: Clients Claims');
                return self.clients.claim();
            })
    );
};