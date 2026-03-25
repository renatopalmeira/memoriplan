// =============================================
// MEMORIPLAN — Service Worker Registration
// Registra e gerencia o service worker
// =============================================

class ServiceWorkerManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupListeners();
  }

  init() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW] Service Workers não suportados neste navegador');
      return false;
    }

    // Registrar service worker
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[SW] ✅ Service Worker registrado com sucesso');
        
        // Checar por updates a cada 1 hora
        setInterval(() => registration.update(), 60 * 60 * 1000);
        
        // Se houver um SW waiting, notificar usuário
        if (registration.waiting) {
          this.promptUserToRefresh(registration.waiting);
        }
        
        // Quando um novo SW entrar em waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'waiting' && navigator.serviceWorker.controller) {
              this.promptUserToRefresh(newWorker);
            }
          });
        });

        return registration;
      })
      .catch(error => {
        console.error('[SW] ❌ Erro ao registrar Service Worker:', error);
      });
  }

  setupListeners() {
    // Detectar mudança de conexão
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[SW] 🟢 Voltou online');
      showToast('Você está de volta online!', 'success');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[SW] 🔴 Saiu online');
      showToast('Você está offline. Seus dados serão sincronizados quando conectar.', 'warning');
    });

    // Comunicação com service worker
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.addEventListener('message', event => {
        console.log('[SW] Mensagem recebida:', event.data);
      });
    }
  }

  /**
   * Notificar usuário sobre nova versão disponível
   */
  promptUserToRefresh(worker) {
    console.log('[SW] Nova versão disponível');
    
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: linear-gradient(135deg, #3B82F6, #1E40AF);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      z-index: 99999;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      max-width: 400px;
    `;
    
    message.innerHTML = `
      <span>🎉 Uma nova versão está disponível!</span>
      <button id="sw-update-btn" style="
        background: white;
        color: #1E40AF;
        border: none;
        padding: 6px 14px;
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
      ">Atualizar</button>
    `;
    
    document.body.appendChild(message);
    
    document.getElementById('sw-update-btn').addEventListener('click', () => {
      worker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    });
    
    // Auto-dismiss após 10 segundos
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 10000);
  }

  /**
   * Sincronizar dados offline quando voltar online
   */
  async syncOfflineData() {
    console.log('[SW] Sincronizando dados offline...');
    
    try {
      // Recuperar dados da IndexedDB (se implementado)
      const db = await openIndexedDB();
      const pendingRequests = await getAllFromStore(db, 'pending_requests');
      
      if (pendingRequests.length > 0) {
        console.log(`[SW] ${pendingRequests.length} requisições pendentes para sincronizar`);
        
        for (const pending of pendingRequests) {
          try {
            const response = await fetch(pending.url, {
              method: pending.method,
              headers: pending.headers,
              body: pending.body
            });
            
            if (response.ok) {
              await deleteFromStore(db, 'pending_requests', pending.id);
              console.log('[SW] ✅ Sincronizado:', pending.url);
            }
          } catch (error) {
            console.warn('[SW] ⚠️ Erro sincronizando:', pending.url);
          }
        }
      }
    } catch (error) {
      console.log('[SW] IndexedDB não disponível (offline sync desabilitado)');
    }
  }

  /**
   * Verificar se está online
   */
  static isOnline() {
    return navigator.onLine;
  }

  /**
   * Forçar atualização do SW
   */
  static async updateNow() {
    if (!('serviceWorker' in navigator)) return;
    
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.update();
    }
  }

  /**
   * Limpar todo o cache (útil para debug)
   */
  static async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[SW] ✅ Cache limpo');
      showToast('Cache limpo com sucesso', 'success');
    }
  }
}

// =============================================
// INDEX DB HELPERS (para sincronização offline)
// =============================================

const DB_NAME = 'MemoriPlanDB';
const DB_VERSION = 1;

async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store para requisições pendentes (offline)
      if (!db.objectStoreNames.contains('pending_requests')) {
        db.createObjectStore('pending_requests', { keyPath: 'id', autoIncrement: true });
      }
      
      // Store para cache de sessões
      if (!db.objectStoreNames.contains('sessions_cache')) {
        db.createObjectStore('sessions_cache', { keyPath: 'id' });
      }
      
      // Store para cache de progress
      if (!db.objectStoreNames.contains('progress_cache')) {
        db.createObjectStore('progress_cache', { keyPath: 'check_key' });
      }
    };
  });
}

async function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function saveToStore(db, storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function deleteFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function clearStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// =============================================
// INICIALIZAR AO CARREGAR
// =============================================

const swManager = new ServiceWorkerManager();

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    swManager.init();
  });
} else {
  swManager.init();
}
