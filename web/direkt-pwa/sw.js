const CACHE = 'direkt-pwa-v2';
const CORE = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './icon.svg'];
const CORE_URLS = new Set(CORE.map((path) => new URL(path, self.registration.scope).href));

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Cache only the explicit public static shell. Do not cache arbitrary same-origin GETs:
  // future authenticated/API responses must never silently enter Cache Storage.
  if (!CORE_URLS.has(url.href)) {
    if (event.request.mode === 'navigate' && url.href.startsWith(self.registration.scope)) {
      event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    }
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));

      return cached || network;
    })
  );
});
