const ASSETS = [
  '/start-construction/',
  '/start-construction/index.html',
  '/start-construction/manifest.json',
  '/start-construction/sw.js',
  '/start-construction/icon-192.svg',
  '/start-construction/icon-512.svg'
];

const CACHE_NAME = 'sc-cache-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (ASSETS.includes(url.pathname) || ASSETS.includes(url.pathname + '/')) {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
  }
});
