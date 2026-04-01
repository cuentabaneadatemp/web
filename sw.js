/**
 * sw.js — Service Worker para PWA
 * Contactos Anónimos v2.0
 *
 * Implementa:
 *   1. Caché de archivos estáticos (CSS, JS, imágenes)
 *   2. Estrategia de caché: Network-first para HTML, Cache-first para assets
 *   3. Soporte offline básico
 *   4. Limpieza automática de caché obsoleto
 *
 * @version 1.0
 */

const CACHE_NAME = 'contactos-anonimos-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/assets/css/main.css',
    '/src/assets/js/security.js',
    '/src/assets/js/geo.js',
    '/src/assets/js/permissions.js',
    '/src/assets/js/db.js',
    '/src/assets/js/api.js',
    '/src/assets/js/main.js',
    '/src/assets/img/favicon.svg',
    '/src/assets/img/pwa_icons/icon-192x192.png',
    '/src/assets/img/pwa_icons/icon-512x512.png',
    '/src/assets/img/pwa_icons/apple-touch-icon.png',
];

/* ── Instalación del Service Worker ──────────────────────────── */
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Cacheando archivos estáticos...');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[SW] Error al cachear algunos archivos:', err);
                // No fallar completamente si algunos archivos no se pueden cachear
            });
        })
    );
    self.skipWaiting();
});

/* ── Activación del Service Worker ──────────────────────────── */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Eliminando caché obsoleto:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

/* ── Interceptación de peticiones ────────────────────────────── */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // No cachear peticiones a APIs externas
    if (url.origin !== location.origin) {
        return;
    }

    // Estrategia Network-first para HTML (siempre intenta obtener la versión más reciente)
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cachear la respuesta si es exitosa
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Si falla la red, usar el caché
                    return caches.match(request).then((cachedResponse) => {
                        return cachedResponse || new Response(
                            '<html><body><h1>Offline</h1><p>No hay conexión disponible.</p></body></html>',
                            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                        );
                    });
                })
        );
        return;
    }

    // Estrategia Cache-first para assets estáticos (CSS, JS, imágenes)
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request)
                    .then((response) => {
                        // Cachear la respuesta si es exitosa
                        if (response && response.status === 200) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        console.warn('[SW] No se pudo obtener:', request.url);
                        return new Response('No disponible', { status: 404 });
                    });
            })
    );
});

/* ── Manejo de mensajes desde el cliente ──────────────────────– */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker cargado correctamente');
