// sw.js — Service worker: guarda la &quot;cáscara&quot; de la app para abrirla sin red
const CACHE = 'xelapan-v1';
const ARCHIVOS = ['/', '/index.html', '/css/estilos.css', '/js/app.js', '/img/icono.svg'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
});

self.addEventListener('fetch', e => {
    // Los datos (/api/...) siempre van a la red: deben estar actualizados
    if (e.request.url.includes('/api/')) return;
    // Archivos estáticos: primero caché, si no existe, la red
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});