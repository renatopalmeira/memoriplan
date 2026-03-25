// =============================================
// MEMORIPLAN — Camada de Cache (IndexedDB)
// Armazena dados localmente para acesso offline
// =============================================

class OfflineDataCache {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Inicializar IndexedDB
   */
  async init() {
    if (this.isInitialized && this.db) return this.db;

    try {
      this.db = await this._openDB();
      this.isInitialized = true;
      console.log('[Cache] ✅ IndexedDB inicializado');
      return this.db;
    } catch (error) {
      console.warn('[Cache] ⚠️ IndexedDB não disponível:', error);
      return null;
    }
  }

  /**
   * Abrir/criar banco de dados
   */
  _openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MemoriPlanDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store para sessões (com índices)
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('date', 'date', { unique: false });
          sessionStore.createIndex('user_id', 'user_id', { unique: false });
        }

        // Store para progresso do cronograma
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'check_key' });
          progressStore.createIndex('user_id', 'user_id', { unique: false });
        }

        // Store para settings do usuário
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'user_id' });
        }

        // Store para requisições pendentes (sync offline)
        if (!db.objectStoreNames.contains('pending_sync')) {
          db.createObjectStore('pending_sync', { keyPath: 'id', autoIncrement: true });
        }

        console.log('[Cache] 📦 Stores criados/atualizados');
      };
    });
  }

  /**
   * ========== SESSIONS ==========
   */

  async getSessions() {
    const db = await this.init();
    if (!db) return [];

    return this._getAllFromStore(db, 'sessions');
  }

  async saveSession(session) {
    const db = await this.init();
    if (!db) return null;

    return this._saveToStore(db, 'sessions', session);
  }

  async saveSessions(sessions) {
    const db = await this.init();
    if (!db) return false;

    try {
      const transaction = db.transaction('sessions', 'readwrite');
      const store = transaction.objectStore('sessions');

      sessions.forEach(session => {
        store.put(session);
      });

      return new Promise((resolve, reject) => {
        transaction.onerror = () => reject();
        transaction.oncomplete = () => resolve(true);
      });
    } catch (error) {
      console.warn('[Cache] Erro salvando sessões:', error);
      return false;
    }
  }

  async deleteSession(id) {
    const db = await this.init();
    if (!db) return false;

    return this._deleteFromStore(db, 'sessions', id);
  }

  async clearSessions() {
    const db = await this.init();
    if (!db) return false;

    return this._clearStore(db, 'sessions');
  }

  /**
   * ========== PROGRESS (CRONOGRAMA) ==========
   */

  async getProgress() {
    const db = await this.init();
    if (!db) return {};

    const items = await this._getAllFromStore(db, 'progress');
    const map = {};
    items.forEach(item => {
      map[item.check_key] = item.checked;
    });
    return map;
  }

  async saveProgress(checkKey, checked) {
    const db = await this.init();
    if (!db) return null;

    const progress = {
      check_key: checkKey,
      checked: checked,
      updated_at: new Date().toISOString()
    };

    return this._saveToStore(db, 'progress', progress);
  }

  async saveAllProgress(progressMap) {
    const db = await this.init();
    if (!db) return false;

    try {
      const transaction = db.transaction('progress', 'readwrite');
      const store = transaction.objectStore('progress');

      Object.entries(progressMap).forEach(([key, checked]) => {
        store.put({
          check_key: key,
          checked: checked,
          updated_at: new Date().toISOString()
        });
      });

      return new Promise((resolve, reject) => {
        transaction.onerror = () => reject();
        transaction.oncomplete = () => resolve(true);
      });
    } catch (error) {
      console.warn('[Cache] Erro salvando progress:', error);
      return false;
    }
  }

  /**
   * ========== SETTINGS ==========
   */

  async getSettings() {
    const db = await this.init();
    if (!db) return null;

    const user = await getCurrentUser();
    if (!user) return null;

    return this._getFromStore(db, 'settings', user.id);
  }

  async saveSettings(settings) {
    const db = await this.init();
    if (!db) return null;

    const user = await getCurrentUser();
    if (!user) return null;

    const settingsData = {
      ...settings,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    return this._saveToStore(db, 'settings', settingsData);
  }

  /**
   * ========== PENDING SYNC (REQUISIÇÕES OFFLINE) ==========
   */

  async addPendingSync(url, method, headers, body) {
    const db = await this.init();
    if (!db) return null;

    const pending = {
      url,
      method,
      headers,
      body,
      timestamp: new Date().toISOString()
    };

    return this._saveToStore(db, 'pending_sync', pending);
  }

  async getPendingSync() {
    const db = await this.init();
    if (!db) return [];

    return this._getAllFromStore(db, 'pending_sync');
  }

  async removePendingSync(id) {
    const db = await this.init();
    if (!db) return false;

    return this._deleteFromStore(db, 'pending_sync', id);
  }

  async clearPendingSync() {
    const db = await this.init();
    if (!db) return false;

    return this._clearStore(db, 'pending_sync');
  }

  /**
   * ========== HELPERS PRIVADOS ==========
   */

  _getFromStore(db, storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => {
        console.warn(`[Cache] Erro ao ler ${storeName}:`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  _getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => {
        console.warn(`[Cache] Erro ao ler todos de ${storeName}:`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  _saveToStore(db, storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => {
        console.warn(`[Cache] Erro ao salvar em ${storeName}:`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => resolve(data);
    });
  }

  _deleteFromStore(db, storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => {
        console.warn(`[Cache] Erro ao deletar de ${storeName}:`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => resolve(true);
    });
  }

  _clearStore(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => {
        console.warn(`[Cache] Erro ao limpar ${storeName}:`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => resolve(true);
    });
  }

  /**
   * Limpar tudo
   */
  async clearAll() {
    try {
      await this.clearSessions();
      await this.clearStore(this.db, 'progress');
      await this.clearStore(this.db, 'settings');
      await this.clearPendingSync();
      console.log('[Cache] ✅ Tudo limpo');
      return true;
    } catch (error) {
      console.warn('[Cache] Erro ao limpar tudo:', error);
      return false;
    }
  }

  /**
   * Stats - útil para debug
   */
  async getStats() {
    const sessions = (await this.getSessions()).length;
    const progress = Object.keys(await this.getProgress()).length;
    const pending = (await this.getPendingSync()).length;

    return { sessions, progress, pending };
  }
}

// =============================================
// INSTÂNCIA GLOBAL
// =============================================

const OfflineCache = new OfflineDataCache();

// Inicializar ao carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    OfflineCache.init();
  });
} else {
  OfflineCache.init();
}

console.log('[Cache] Module loaded');
