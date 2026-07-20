const CACHE_VERSION = "direkt-functional-shell-v1";
const STATIC_ALLOWLIST = ["/offline", "/manifest.webmanifest", "/icon.svg"];
const NETWORK_ONLY_PREFIXES = [
  "/api/auth/",
  "/api/customer/action",
  "/api/provider/action",
];
const SENSITIVE_ROUTE_PATTERN =
  /\/(auth|account|enquiries|evidence|interactions|reviews|complaints|commercial)(\/|$)/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ALLOWLIST)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Authenticated/BFF/API and private lifecycle traffic is always network-only and never cacheable.
  if (
    url.pathname.startsWith("/api/") ||
    NETWORK_ONLY_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
    SENSITIVE_ROUTE_PATTERN.test(url.pathname)
  ) {
    event.respondWith(networkOnly(event.request));
    return;
  }

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  if (STATIC_ALLOWLIST.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});

function networkOnly(request) {
  return fetch(request, { cache: "no-store" });
}
