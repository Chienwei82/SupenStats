/* Service worker de SUPEN Stats (Fase 3 — PWA).
 *
 * Estrategia:
 * - App shell (build estático) en caché: cache-first con revalidación en
 *   segundo plano (stale-while-revalidate) para servir rápido y luego actualizar.
 * - Navegación (documentos): network-first con respaldo a la caché (offline).
 * - API de SUPEN (/estadisticas/*): nunca se cachea (datos que cambian y son
 *   muy pesados); se deja pasar siempre a la red.
 *
 * Es una mejora progresiva: si algo falla, la app sigue funcionando en línea.
 */

const CACHE = 'supen-stats-v1'
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', event => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  // No cachear la API de datos.
  if (url.pathname.startsWith('/estadisticas')) return

  // Navegación: red primero, caché como respaldo offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html').then(r => r || caches.match('/'))),
    )
    return
  }

  // Resto de recursos estáticos: caché primero + revalidación en segundo plano.
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req)
        .then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone()
            caches.open(CACHE).then(cache => cache.put(req, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})