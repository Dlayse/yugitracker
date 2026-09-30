/*
 * Guarda en el navegador las imágenes de las cartas de YGOPRODeck.
 *
 * Sus condiciones piden no enlazar las imágenes de forma continuada sino
 * descargarlas una vez y servirlas en local (si no, bloquean la IP). Una web
 * estática no tiene servidor donde guardarlas, así que lo hace cada navegador:
 * la primera vez que aparece una carta se descarga y se guarda aquí; a partir
 * de entonces sale de esta caché sin volver a pedírsela a YGOPRODeck.
 */
const CACHE = 'yugi-tracker-cartas-v1';
const HOST = 'images.ygoprodeck.com';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.hostname !== HOST) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req, { ignoreVary: true });
      if (hit) return hit;
      const res = await fetch(req);
      // Las <img> sin CORS dan respuestas "opacas" (status 0): se guardan igual y
      // se pueden mostrar. Los errores de verdad (404, 5xx) no se guardan.
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    }),
  );
});
