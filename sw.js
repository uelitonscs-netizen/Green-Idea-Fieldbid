// FieldBid service worker. FieldBid, WorkLog and Fazenda live on the same site (uelitonscs-netizen.github.io)
// and share one cache storage, so this worker cleans ONLY FieldBid's own caches — it used to delete every
// cache that was not its own, wiping WorkLog's saved copy each time FieldBid updated.
const CACHE_NAME = 'fbm-v4';
const MINE = /^fbm-/;                 // FieldBid's caches from now on
const OLD = ['fieldbid-v3'];          // FieldBid's previous cache (the WorkLog folder has its own "fieldbid-v2": not touched)
const urlsToCache = ['./', './index.html'];
self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(c) { return c.addAll(urlsToCache); }));
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME && (MINE.test(k) || OLD.indexOf(k) >= 0); }).map(function(k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request).catch(function() { return caches.match(e.request); }));
});
