var CACHE_NAME = 'greenidea-v3';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(['./index.html', './manifest.json']).then(function() {
        return cache.add('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap').catch(function() {});
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  if (event.request.method !== 'GET') return;
  if (url.startsWith('chrome-extension://')) return;
  if (url.includes('firebaseio.com') || url.includes('googleapis.com/v1')) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) {
        fetch(event.request).then(function(r) {
          if (r && r.status === 200) {
            var c = r.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, c); });
          }
        }).catch(function() {});
        return cached;
      }
      return fetch(event.request).then(function(r) {
        if (!r || r.status !== 200 || r.type === 'opaque') return r;
        var c = r.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, c); });
        return r;
      }).catch(function() {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
