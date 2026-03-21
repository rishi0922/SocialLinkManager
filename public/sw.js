// Minimal Service Worker to pass PWA criteria
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
    // Just pass through, no caching
    e.respondWith(fetch(e.request));
});
