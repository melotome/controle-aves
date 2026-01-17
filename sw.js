
const CACHE_NAME = 'agro-geral-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação - Armazena em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Cache aberto');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação - Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Limpando cache antigo');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se encontrar, senão busca na rede
      return response || fetch(event.request).catch(() => {
        // Se falhar rede e cache (offline), tenta retornar o index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
