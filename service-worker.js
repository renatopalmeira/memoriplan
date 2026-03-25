// =============================================
// MEMORIPLAN — Service Worker (Offline-First)
// Cacheia arquivos estáticos e sincroniza dados
// =============================================

const CACHE_VERSION = 'v1';
const CACHE_NAME = `memoriplan-${CACHE_VERSION}`;
const SUPABASE_CACHE = 'memoriplan-data-cache';

// Arquivos críticos para cachear no install
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/sessoes.html',
  '/cronograma.html',
  '/js/config.js',
  '/js/auth.js',
  '/js/data.js',
  '/js/nav.js',
  '/js/validation.js',
  '/js/errors.js',
  '/js/toast.js'
];

// ========== INSTALL EVENT ==========
// Cachear arquivos críticos
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching critical assets');
      return cache.addAll(CRITICAL_ASSETS).catch(err => {
        console.warn('[SW] ⚠️ Alguns arquivos não puderam ser cacheados:', err);
        // Continuar mesmo se alguns falhem (assets estão disponíveis via CDN)
      });
    })
  );
  
  // Forçar o novo service worker a ativar imediatamente
  self.skipWaiting();
});

// ========== ACTIVATE EVENT ==========
// Limpar caches antigos
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== SUPABASE_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Ativar o novo service worker imediatamente
  self.clients.claim();
});

// ========== FETCH EVENT ==========
// Estratégia: Cache primeiro para assets, Network-first para Supabase
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorar schemes não suportados (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) return;

  // ✅ 1. SUPABASE REQUESTS - passa direto para a rede, sem cache
  // (cachear auth/dados do Supabase causa tokens stale e lock contention)
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // ✅ 2. GET requests de assets estáticos (HTML, CSS, JS, fonts) - Cache-first
  if (event.request.method === 'GET') {
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

// ========== ESTRATÉGIAS DE CACHE ==========

/**
 * Cache-first: tenta cache primeiro, depois network
 * Ideal para: assets estáticos (CSS, JS, HTML)
 */
function cacheFirstStrategy(request) {
  return caches
    .match(request)
    .then(response => {
      if (response) {
        console.log('[SW] Cache HIT:', request.url);
        return response;
      }
      
      // Se não tiver em cache, buscar da rede
      return fetch(request).then(response => {
        // Não cachear respostas ruins
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // Clonar resposta (pois só pode ser consumida uma vez)
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    })
    .catch(() => {
      // Se cache falhar e network falhar, mostrar página offline
      if (request.headers.get('accept')?.includes('text/html')) {
        return caches.match('/index.html');
      }
      return new Response('Offline - Asset não disponível', { status: 503 });
    });
}

/**
 * Network-first: tenta network primeiro, fallback para cache
 * Ideal para: dados dinâmicos (Supabase)
 */
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      // Se resposta OK, cacheá-la para offline
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(SUPABASE_CACHE).then(cache => {
          cache.put(request, responseToCache);
        });
        console.log('[SW] Network OK, cached:', request.url);
      }
      return response;
    })
    .catch(() => {
      // Se network falhar, tentar cache
      console.log('[SW] Network FAIL, trying cache:', request.url);
      return caches.match(request).then(response => {
        if (response) {
          return response;
        }
        
        // Se nem cache tem, retornar erro offline
        return new Response(
          JSON.stringify({ 
            error: 'Offline - Dados não disponíveis em cache',
            cached: false 
          }),
          { 
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      });
    });
}

/**
 * Auxiliar para cachear response
 */
function cacheResponse(response) {
  if (!response || response.status !== 200) {
    return response;
  }
  const responseToCache = response.clone();
  caches.open(CACHE_NAME).then(cache => {
    cache.put(new Request(response.url || ''), responseToCache);
  });
  return response;
}

// ========== BACKGROUND SYNC ==========
// Sincronizar dados pendentes quando voltar online
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'syncPendingData') {
    event.waitUntil(syncPendingRequests());
  }
});

async function syncPendingRequests() {
  try {
    // Pegar requisições pendentes do IndexedDB
    const pending = await getPendingRequests();
    console.log(`[SW] Sincronizando ${pending.length} requisições pendentes...`);
    
    for (const request of pending) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });
        
        if (response.ok) {
          await removePendingRequest(request.id);
          console.log('[SW] ✅ Sincronizado:', request.url);
        }
      } catch (error) {
        console.warn('[SW] ⚠️ Erro sincronizando:', request.url, error);
      }
    }
  } catch (error) {
    console.error('[SW] Erro em background sync:', error);
  }
}

// Placeholder para IndexedDB (implementar no lado do cliente)
async function getPendingRequests() {
  return [];
}

async function removePendingRequest(id) {
  // Será implementado via IndexedDB
}

// ========== MESSAGE HANDLER ==========
// Comunicação com cliente
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      caches.delete(SUPABASE_CACHE).then(() => {
        event.ports[0].postMessage({ success: true });
      });
    });
  }
});

console.log('[SW] Service Worker loaded');
