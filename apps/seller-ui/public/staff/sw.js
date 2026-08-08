// Minimal service worker: exists only to satisfy PWA installability criteria
// (a fetch handler is required by Chromium's install prompt heuristics).
// Deliberately does no caching — this is a live order-management surface and
// stale cached responses would show riders/cutting staff outdated order data.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
