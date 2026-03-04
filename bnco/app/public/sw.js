// Self-destructing service worker
// Unregisters itself and clears all caches on install
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clear all caches
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
      // Unregister this service worker
      self.registration.unregister(),
    ]).then(() => {
      // Force all clients to reload with fresh content
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      });
    })
  );
});

// Pass through all fetch requests to network (no caching)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
