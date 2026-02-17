const CACHE_NAME = "smart-bookmark-v3";


self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate — clean old caches and take control
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;

  // Skip non-GET, chrome-extension, and Supabase auth requests
  if (request.method !== "GET") return;
  if (request.url.startsWith("chrome-extension://")) return;
  if (request.url.includes("supabase")) return;

  e.respondWith(
    fetch(request)
      .then((response) => {
        // Cache static assets only
        const url = new URL(request.url);
        const isStatic =
          /\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|ico)$/i.test(url.pathname) ||
          url.pathname.startsWith("/_next/static");

        if (response.status === 200 && isStatic) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(request, clone);
            } catch {}
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
