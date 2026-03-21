// Minimal Service Worker to pass PWA criteria
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => new Response(
            '<html><head><title>Offline</title></head><body style="padding: 2rem; font-family: sans-serif; text-align: center; background: #020617; color: white;"><h1>LinkManager is Offline</h1><p>Please check your internet connection to save or view links.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
        ))
    );
});
