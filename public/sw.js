/* Service worker do Roteiro Roma e Assis — sem dependências.
 * Objetivo: depois da primeira visita com internet, TODAS as páginas do roteiro abrem offline.
 * - install: guarda as páginas estáticas e os arquivos /_next/static que elas usam (JS, CSS, fontes);
 * - navegação: rede primeiro (conteúdo atualizado), cache se estiver offline ou a rede demorar;
 * - /_next/static: cache primeiro (arquivos com hash nunca mudam);
 * - /api/*: nunca passa pelo cache (intenções são privadas).
 * Ao mudar a lista de rotas, troque VERSION para forçar a atualização.
 */
const VERSION = 'v2';
const CACHE = `roteiro-${VERSION}`;
const DAYS = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const ROUTES = ['/', ...DAYS.map((d) => `/dia/${d}`), '/lugares', '/infos', '/intencoes'];
const EXTRA = ['/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icon.png', '/icon.svg', '/favicon.ico', '/apple-icon.png'];
const NETWORK_TIMEOUT_MS = 3500;

const ASSET_RE = /\/_next\/static\/[^"'()\s\\]+/g;

async function cacheWithAssets(cache, url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    await cache.put(url, res.clone());
    const type = res.headers.get('content-type') || '';
    if (!/text\/html|text\/css|javascript/.test(type)) return [];
    const text = await res.text();
    return [...new Set(text.match(ASSET_RE) || [])];
  } catch {
    return [];
  }
}

async function precache() {
  const cache = await caches.open(CACHE);
  const seen = new Set();
  let queue = [...ROUTES, ...EXTRA];
  // páginas → assets → CSS → fontes (até 3 níveis)
  for (let depth = 0; depth < 3 && queue.length; depth++) {
    const next = [];
    await Promise.all(
      queue
        .filter((u) => !seen.has(u) && seen.add(u))
        .map(async (u) => {
          if (depth > 0 && (await cache.match(u))) return;
          next.push(...(await cacheWithAssets(cache, u)));
        }),
    );
    queue = next;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('roteiro-') && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await Promise.race([fetch(request), timeout(NETWORK_TIMEOUT_MS)]);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const url = new URL(request.url);
    return (
      (await cache.match(request, { ignoreSearch: true })) ||
      (await cache.match(url.pathname)) ||
      (await cache.match('/')) ||
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const fresh = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit || Response.error());
  return hit || fresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') return event.respondWith(networkFirst(request));
  if (url.pathname.startsWith('/_next/static/')) return event.respondWith(cacheFirst(request));
  // payloads RSC (navegação interna do Next) e demais arquivos
  event.respondWith(staleWhileRevalidate(request));
});
