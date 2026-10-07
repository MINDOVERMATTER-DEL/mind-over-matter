// Service worker for Mind Over Matter. Its only job is a friendly "You're offline" page.
//
// Every request still goes to the network exactly as before (nothing else is cached, so visitors always get the
// latest site). Only when a page can't be fetched because there's no connection is the saved offline page shown.
// To change the offline page, edit offline.html and bump CACHE_NAME so visitors pick up the new copy.
const CACHE_NAME = 'mom-offline-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const response = await fetch(OFFLINE_URL, { cache: 'reload' });
    // Saved as a fresh response, so the "/offline.html" → "/offline" redirect on the live site isn't kept with it.
    const page = new Response(await response.blob(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    const cache = await caches.open(CACHE_NAME);
    await cache.put(OFFLINE_URL, page);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
    // Lets the browser start fetching a page while this worker starts up, so pages load no slower than before.
    await self.registration.navigationPreload?.enable();
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith((async () => {
    try {
      return (await event.preloadResponse) || (await fetch(event.request));
    } catch {
      return (await caches.match(OFFLINE_URL)) || Response.error();
    }
  })());
});
