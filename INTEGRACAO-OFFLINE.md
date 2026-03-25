# 🔗 Integração Offline — MemoriPlan

**Como usar o IndexedDB para sincronizar dados localmente**

---

## Quick Start

### 1. Salvar Dados ao Buscar do Supabase

```javascript
// Em data.js → getSessions()
async getSessions() {
  try {
    // 1. Tentar buscar do Supabase
    const { data, error } = await sb.from('study_sessions').select('*');
    
    if (error) throw error;
    
    // 2. ✅ Sucesso → salvar em cache para offline
    await OfflineCache.saveSessions(data);
    console.log('[Data] ✅ Sessões guardadas em cache');
    
    return data;
  } catch (e) {
    // 3. ❌ Falha → tentar cache
    console.log('[Data] Supabase falhou, tentando cache...');
    const cached = await OfflineCache.getSessions();
    
    if (cached.length > 0) {
      showToast('⚠️ Usando dados offline', 'warning');
      return cached;
    }
    
    return [];
  }
}
```

### 2. Adicionar Sessão com Fallback Offline

```javascript
// Em data.js → addSession()
async addSession(session) {
  if (!sb) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    // 1. Tentar enviar para Supabase
    const { data, error } = await sb.from('study_sessions').insert({
      user_id: user.id,
      date: session.date,
      discipline: session.discipline,
      // ...outros campos
    }).select().single();

    if (error) throw error;

    // 2. ✅ Sucesso → salvar em cache também
    await OfflineCache.saveSession(data);
    showToast('✅ Sessão registrada!', 'success');
    return data;

  } catch (error) {
    console.error('[Data] Erro:', error);

    // 3. ❌ Falha → Se offline, guardar para sincronizar depois
    if (!navigator.onLine) {
      const pendingSession = {
        ...session,
        user_id: user.id,
        id: 'pending_' + Date.now() // ID temporário
      };

      // Guardar localmente
      await OfflineCache.saveSession(pendingSession);
      
      // Marcar para sincronizar depois
      await OfflineCache.addPendingSync(
        `${SUPABASE_URL}/rest/v1/study_sessions`,
        'POST',
        { 'Content-Type': 'application/json' },
        JSON.stringify(pendingSession)
      );

      showToast('💾 Salvando offline (será sincronizado)', 'info');
      return pendingSession;
    }

    showToast('❌ Erro ao salvar sessão', 'error');
    return null;
  }
}
```

### 3. Usar Cache Primeiro para Performance

```javascript
// Em qualquer página que carrega dados
async function loadData() {
  // 1. Mostrar cache primeiro (rápido)
  const cached = await OfflineCache.getSessions();
  displaySessions(cached);

  // 2. Depois buscar dados frescos
  const fresh = await Data.getSessions();
  
  // 3. Se forem diferentes, atualizar UI
  if (fresh.length !== cached.length) {
    displaySessions(fresh);
    showToast('📊 Dados atualizados', 'info');
  }
}
```

---

## 📋 API Completa do OfflineCache

### Sessions

```javascript
// Salvar uma sessão
await OfflineCache.saveSession({
  id: 'uuid',
  date: new Date().toISOString(),
  discipline: 'Matemática',
  minutes: 60
});

// Obter todas as sessões
const sessions = await OfflineCache.getSessions();

// Deletar uma sessão
await OfflineCache.deleteSession('session-id');

// Limpar todas as sessões
await OfflineCache.clearSessions();
```

### Progress (Cronograma)

```javascript
// Salvar progresso de um item
await OfflineCache.saveProgress('week-1-item-5', true);

// Obter todo o progresso (como objeto)
const progress = await OfflineCache.getProgress();
// Output: { 'week-1-item-5': true, 'week-1-item-6': false }

// Salvar múltiplos itens de progresso
await OfflineCache.saveAllProgress({
  'week-1-item-1': true,
  'week-1-item-2': true,
  'week-1-item-3': false
});
```

### Settings

```javascript
// Salvar configurações do usuário
await OfflineCache.saveSettings({
  student_name: 'João Silva',
  daily_goal_hours: 6
});

// Obter configurações
const settings = await OfflineCache.getSettings();
```

### Pending Sync (Requisições Offline)

```javascript
// Adicionar requisição para sincronizar depois
await OfflineCache.addPendingSync(
  'https://supabase.co/rest/v1/study_sessions',  // URL
  'POST',                                          // Método
  { 'Content-Type': 'application/json' },         // Headers
  JSON.stringify({ discipline: 'Física' })        // Body
);

// Obter requisições pendentes
const pending = await OfflineCache.getPendingSync();

// Remover uma requisição (após sincronizada)
await OfflineCache.removePendingSync(1);

// Limpar todas as requisições pendentes
await OfflineCache.clearPendingSync();
```

### Utilities

```javascript
// Ver stats do cache
const stats = await OfflineCache.getStats();
// Output: { sessions: 12, progress: 45, pending: 0 }

// Limpar tudo
await OfflineCache.clearAll();
```

---

## 🎯 Exemplo Prático: Registrar Sessão Offline

### Cenário
Usuário está estudando, a internet cai, ele clica em "Registrar Sessão".

### Fluxo

```javascript
// Em sessoes.html
async function handleSaveSession() {
  const session = {
    date: new Date().toISOString(),
    discipline: document.getElementById('discipline').value,
    minutes: parseInt(document.getElementById('minutes').value),
    category: 'Teoria'
  };

  try {
    const result = await Data.addSession(session);
    
    if (result) {
      // ✅ Sucesso (online)
      clearForm();
      loadSessions(); // Recarregar lista
      showToast('✅ Sessão registrada!', 'success');
    }
  } catch (error) {
    // ❌ Falha
    if (!navigator.onLine) {
      // 🔌 Offline → guardar localmente
      const sessionWithId = {
        ...session,
        id: `pending_${Date.now()}`,
        user_id: (await getCurrentUser())?.id
      };

      await OfflineCache.saveSession(sessionWithId);
      
      // Adicionar à lista de pendências
      await OfflineCache.addPendingSync(
        `${SUPABASE_URL}/rest/v1/study_sessions`,
        'POST',
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        JSON.stringify(sessionWithId)
      );

      clearForm();
      loadSessions(); // Mostrar com badge "pendente"
      showToast('💾 Offline: dados será sincronizados ao conectar', 'info');
    }
  }
}
```

### O que acontece depois

**Quando volta online:**
```
1. Usuário reconecta à internet
2. Service Worker detecta: window.addEventListener('online')
3. sw-manager.js → syncOfflineData()
4. Pega dados de OfflineCache.getPendingSync()
5. Envia para Supabase novamente
6. Se sucesso → OfflineCache.removePendingSync()
7. Toast: "✅ Dados sincronizados!"
8. UI atualiza com ID real do Supabase
```

---

## 🔄 Estratégia: Hybrid Cache

### Para melhor UX, usar combinação:

```javascript
async function loadStudySessions() {
  // 1. Show cached data immediately
  const cached = await OfflineCache.getSessions();
  renderSessions(cached, 'cached');

  // 2. Fetch fresh data in background
  const fresh = await Data.getSessions().catch(() => null);
  
  // 3. Update only if different
  if (fresh && JSON.stringify(fresh) !== JSON.stringify(cached)) {
    await OfflineCache.saveSessions(fresh);
    renderSessions(fresh, 'fresh');
    showToast('📊 Dados atualizados', 'info');
  }
}
```

### HTML para indicador de status

```html
<!-- Adicionar na lista de sessões -->
<div class="session-item" data-source="cached">
  <span class="source-badge cached">📱 Offline</span>
  <!-- resto da sessionitem -->
</div>

<style>
.source-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 8px;
}

.source-badge.cached {
  background: #FEF3C7;
  color: #D97706;
}

.source-badge.fresh {
  background: #DBEAFE;
  color: #1E40AF;
}

.source-badge.pending {
  background: #FEE2E2;
  color: #991B1B;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
```

---

## ⚙️ Configuração Recomendada

### Adicionar ao `data.js` (no topo)

```javascript
const USE_CACHE = true;  // Habilitar caching
const CACHE_SYNC_INTERVAL = 5 * 60 * 1000;  // Sincronizar a cada 5 min

// Sincronizar periodicamente quando ligado
if (USE_CACHE) {
  setInterval(async () => {
    if (navigator.onLine && swManager?.isOnline) {
      await swManager.syncOfflineData();
    }
  }, CACHE_SYNC_INTERVAL);
}
```

### Limpar cache antigo (opcional)

```javascript
// Executar ao fazer login
async function setupOfflineCache() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Se logout, limpar cache
    await OfflineCache.clearAll();
    return;
  }

  // Se login, carregar dados iniciais
  const sessions = await Data.getSessions();
  await OfflineCache.saveSessions(sessions);

  const progress = await Data.getProgress();
  await OfflineCache.saveAllProgress(progress);

  const settings = await Data.getSettings();
  await OfflineCache.saveSettings(settings);
}

// Chamar após checkAuth() retornar usuário
window.addEventListener('load', async () => {
  const user = await checkAuth();
  if (user) {
    await setupOfflineCache();
  }
});
```

---

## 🧪 Teste do Offline Cache

### Script de Teste (colar no console)

```javascript
// 1. Verificar se tudo está inicializado
console.log('OfflineCache init:', OfflineCache.isInitialized);

// 2. Ver stats
await OfflineCache.getStats(); 

// 3. Testar salvar
await OfflineCache.saveSession({
  id: 'test-123',
  discipline: 'Teste',
  minutes: 30,
  date: new Date().toISOString()
});

// 4. Verificar stats novamente
await OfflineCache.getStats();

// 5. Recuperar
const test = await OfflineCache.getSessions();
console.log('Testado!', test);

// 6. Limpar teste
await OfflineCache.clearAll();
```

---

## ⚠️ Gotchas & Troubleshooting

### Problema: Dados não salvam em cache

**Causa:** OfflineCache não inicializado

**Solução:**
```javascript
// Aguardar inicialização
await OfflineCache.init();

// Depois salvar
await OfflineCache.saveSession(data);
```

### Problema: Cache sempre vazio

**Causa:** Dados não estão sendo adicionados ao salvar

**Solução:** Certificar que `Data.js` está chamando `OfflineCache.save*()` após Supabase

### Problema: Requisição pendente não sincroniza

**Causa:** Service Worker não conseguiu enviar (erro em background sync)

**Solução:** Checar console do DevTools > Service Workers

---

## 📊 Tamanho Esperado de Cache

```
Sessões (1000 items)        ~100KB
Progress (500 items)         ~25KB
Settings (1 per user)        ~1KB
Pending Sync (até 10)       ~10KB
────────────────────────────────────
Total por usuário            ~150KB
```

**Limite do browser:** Geralmente 50MB por sítio (mais que suficiente)

---

## 🚀 Mais Ideias de Integração

- [ ] Auto-sync ao terminar uma sessão
- [ ] Notificação de dados sincronizados
- [ ] Histórico local (últimas 10 sessões sempre disponível)
- [ ] Export local para PDF
- [ ] Conflict resolution se fizer mudanças localmente
- [ ] Compressão de dados antigos

---

**Guia Completo de Integração — MemoriPlan 2026**
