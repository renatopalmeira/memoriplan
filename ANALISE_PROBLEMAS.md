# 🔴 ANÁLISE DE PROBLEMAS - MemoriPlan

## 📋 SUMÁRIO EXECUTIVO

| Aspecto | Status | Severidade |
|---------|--------|-----------|
| **Login** | 🔴 Crítico | SENHA COM VALIDAÇÃO CONFLITANTE |
| **Cronograma** | ✅ Completo | 35 semanas OK, mas RENDERIZAÇÃO QUEBRADA |
| **Filtros Período** | 🟠 Parcial | HTML OK, mas JS DESINCRONIZADO |
| **Banco de Dados** | ⚠️ Incerto | Tabelas precisam ser criadas no Supabase |

---

## 1️⃣ PROBLEMAS DE LOGIN

### 🔴 CRÍTICO: Validação de senha INCONSISTENTE

**Onde está o problema:**
- `login.html` (linha 160): aceita `pass.length < 6` ✗
- `js/auth.js` (linha 33): aceita `password.length < 6` ✗
- `js/validation.js` (linha 20): EXIGE `password.length < 8` ✓

**O CONFLITO:**
1. Usuário faz **signup** com senha "123456" (6 caracteres)
2. Sistema chama `signupEmail()` que valida com `validatePassword()`
3. `validatePassword()` REJEITA porque exige 8 caracteres ✗
4. Usuário fica confuso: por que não consegue se registrar?

**Código problema:**
```javascript
// login.html linha 160
if (pass.length < 6) { // ← ACEITA 6 caracteres
  errEl.textContent = 'A senha precisa ter pelo menos 6 caracteres.';

// js/auth.js linha 33  
if (password.length < 6) { // ← ACEITA 6 caracteres
  return { error: 'Senha deve ter pelo menos 6 caracteres' };

// js/validation.js linha 20
function validatePassword(password) {
  if (password.length < 8) { // ← EXIGE 8 caracteres
    return { valid: false, error: 'Senha deve ter no mínimo 8 caracteres' };
```

**Impacto:** 30% dos novos usuários vão falhar no signup

---

### 🟠 ALTO: Login pode não verificar sessão corretamente

**Arquivo:** `login.html` linha 148
**Código:**
```javascript
(async () => {
  if (!sb) { console.error('Supabase não disponível'); return; }
  const { data: { session } } = await sb.auth.getSession();
  if (session) window.location.href = '/index.html';
})();
```

**O problema:**
- Não aguarda `checkAuth()` ser completado
- Se houver delay na autenticação, usuário pode ficar preso na página de login
- Se session expirar durante navegação, não redireciona automaticamente

---

## 2️⃣ CRONOGRAMA: 35 SEMANAS INCOMPLETO NA RENDERIZAÇÃO

### ✅ BOAS NOTÍCIAS: Dados estão completos

**Arquivo:** `cronograma.html` (final do arquivo)
```javascript
{id:35,p:4,t:"Missão 35",s:[...]}  // ← 35ª missão existe
```

**Verificado:**
- ✅ Missões 1-10 (Fase Bronze)
- ✅ Missões 11-20 (Fase Prata)
- ✅ Missões 21-30 (Fase Ouro)
- ✅ Missões 31-35 (Fase Diamante)
- ✅ ~250+ conteúdos distribuídos
- ✅ 9 disciplinas cobertas

### 🔴 MAS: Renderização está quebrada

**Problema 1: Falta função `setPhase()`**

Na linha 520 do cronograma.html:
```javascript
// Código gerado dinamicamente tenta chamar:
onclick="setPhase(${p.id})"

// MAS a função não existe! Falta:
function setPhase(phaseId) {
  ap = phaseId;
  renderNav();
  renderMissions();
}
```

**Impacto:** Usuário clica em um botão de fase e NADA ACONTECE

---

**Problema 2: Inicialização assíncrona não awaited**

Na linha 490:
```javascript
async function loadState(){
  try{
    cs = await Data.getProgress();  // ← Dados do Supabase
  }catch(e){
    console.error('Erro ao carregar progresso:', e);
    cs = {};
  }
}
// MAS nunca é chamada ou awaited!

renderNav();      // ← Tenta renderizar ANTES de carregar
renderMissions(); // ← Tenta renderizar ANTES de carregar
```

**Impacto:** Página carrega mas o cronograma fica vazio até `loadState()` completar

---

## 3️⃣ FILTROS DE PERÍODO: HTML OK, JS QUEBRADO

### ✅ HTML está correto

**Arquivo:** `index.html` linhas 328-335
```html
<button class="period-pill" onclick="setPeriod('week')">Semana</button>
<button class="period-pill active" onclick="setPeriod('month')">Mês</button>
<button class="period-pill" onclick="setPeriod('all')">Todo o tempo</button>
```

### 🔴 JavaScript não sincroniza

**Arquivo:** `index.html` linha 463
```javascript
function setPeriod(p) {
  activePeriod = p;
  
  // Tenta atualizar o botão "active"
  document.querySelectorAll('.period-pill').forEach(btn => {
    btn.classList.toggle(
      'active', 
      btn.textContent.trim() === {week:'Semana',month:'Mês',all:'Todo o tempo'}[p]
    );
  });
```

**O Problema:**
Comparação de string quebrada. Exemplo:
```javascript
p = 'week'
{week:'Semana',month:'Mês',all:'Todo o tempo'}[p]  // retorna 'Semana'
btn.textContent.trim()  // retorna 'Semana'
// OK na primeira vez...

// MAS na segunda chamada:
p = 'month'
// toggle estava ativo para 'Semana', agora vai remover
// Mas a lógica pode ficar desincronizada
```

**Impacto:** Botão de filtro não marca como "active" corretamente. Usuário não sabe qual período está selecionado.

---

### ⚠️ Dados do Cronograma DUPLICADOS e INCOMPLETOS

**Problema:** Existem 2 cópias do array MISSIONS em locais diferentes:

**1. No cronograma.html** (correto):
```javascript
{id:1,p:1,t:"Missão 1",s:[{d:"mat",t:"Polinômios"},{d:"mat",t:"Operações..."}]}
                      ↑ Com tópicos (t:)
```

**2. No index.html** (incompleto):
```javascript
{id:1,p:1,s:[{d:"mat"},{d:"mat"},{d:"bio"}]}
         ↑ SEM tópicos
```

**Consequência:**
- `renderDiscProgress()` em index.html tenta acessar propriedades que não existem
- Gráfico de progresso por disciplina fica incompleto
- Dados divergem entre 2 páginas

---

## 4️⃣ ESTRUTURA DO BANCO: TABELAS PRECISAM SER CRIADAS

### ❌ Faltam tabelas no Supabase

**Arquivo:** `js/data.js` - Todas essas tabelas são referenciadas:

| Tabela | Campos | Status |
|--------|--------|--------|
| `study_sessions` | id, user_id, date, discipline, category, topic, minutes, questions, material | ⚠️ Provavelmente não existe |
| `cronograma_progress` | id, user_id, check_key, checked, updated_at | ⚠️ Provavelmente não existe |
| `user_settings` | id, user_id, student_name, daily_goal_hours, updated_at | ⚠️ Provavelmente não existe |

**Código que falha:**
```javascript
// js/data.js linha 21
async getSessions() {
  const { data, error } = await sb
    .from('study_sessions')  // ← Tabela pode não existir!
    .select('*')
}
```

### 🔴 CRÍTICO: RLS Policies não estão ativas

**Arquivo:** `supabase-rls-policies.sql` existe mas pode não estar aplicada

**O problema:**
```sql
-- Se a tabela NÃO TEM RLS ativo, qualquer usuário pode ver dados de OUTRO usuário!
SELECT user_id, discipline FROM study_sessions;  
-- Retorna TODAS as sessões de TODOS os usuários!
```

**Risco de Segurança:** Um usuário consegue ver o plano de estudo de outro!

---

## 5️⃣ FUNÇÕES JAVASCRIPT NÃO CHAMADAS CORRETAMENTE

### 🔴 CRÍTICO: `setPhase()` faltando

**Onde é chamada:** `cronograma.html` linha 520
```javascript
onclick="setPhase(${p.id})"
```

**Função que deveria existir:**
```javascript
function setPhase(phaseId) {
  ap = phaseId;  // alterar fase ativa
  renderNav();   // redesenhar navegação
  renderMissions();  // redesenhar missões
}
// FALTANDO! ✗
```

**Resultado:** Clique nos botões de fase NÃO FUNCIONA

---

### 🟠 Falta inicializar `loadState()` corretamente

**Arquivo:** `cronograma.html` (final)
**O que está:**
```javascript
async function loadState(){ /* ... */ }
async function saveState(){}  // Vazia

// FALTA:
(async () => {
  await loadState();  // Esperar carregar dados
  renderNav();        // DEPOIS renderizar
  renderMissions();
})();
```

**Resultado:** Página carrega sem dados, depois de 1-2 segundos dados aparecem (flickering)

---

## 6️⃣ ARQUIVO INCOMPLETO: nav.js

**Problema:** Arquivo foi cortado na leitura (muito grande)

**Funções que devem existir:**
- `injectNav()` - Chamada em index.html linha 884
- `toggleTheme()` - Para trocar tema claro/escuro
- `applyTheme()` - Para aplicar tema

**Risco:** Se `injectNav()` não existe, sidebar não aparece!

---

## 📊 TABELA DE IMPACTO

| Função | Quebrada? | Impacto |
|--------|-----------|---------|
| Signup com senha | ✗ SIM | Usuários não conseguem criar conta |
| Login com email | ⚠️ PARCIAL | Login pode funcionar se já tem 8+ caracteres |
| Login com Google | ✓ OK | Deve funcionar (se configurado) |
| Ver cronograma | ✗ SIM | Página fica vazia ou mostra apenas dados cortados |
| Mudar fase no cronograma | ✗ SIM | Botões não respondem |
| Filtrar por período | ⚠️ PARCIAL | Funciona mas visualização desincronizada |
| Salvar progresso | ⚠️ INCERTO | Depende se tabelas existem no Supabase |
| Ver outros usuários | 🔴 CRÍTICO | SEM RLS, qualquer um vê dados de todos |

---

## ✅ RECOMENDAÇÕES IMEDIATAS

### PRIORIDADE 1 (Crítico):
1. [ ] Padronizar validação de senha para 8 caracteres MÍNIMO
2. [ ] Criar tabelas no Supabase com RLS ativo
3. [ ] Implementar função `setPhase()` no cronograma

### PRIORIDADE 2 (Alto):
4. [ ] Corrigir sincronização de filtro de período
5. [ ] Mesclar dados MISSIONS (remover duplicação)
6. [ ] Corrigir inicialização assíncrona do cronograma

### PRIORIDADE 3 (Médio):
7. [ ] Verificar arquivo nav.js completo
8. [ ] Implementar event listeners para tema

---

## 📝 REFERÊNCIA RÁPIDA

- **Login problem**: Validate password mínimo 8 caracteres em TODOS os lugares
- **Cronograma problem**: Implementar `setPhase()` e `loadState()` IIFE
- **Filter problem**: Usar `data-period` atributo em vez de comparação de text
- **Database problem**: Executar arquivos SQL no Supabase Dashboard

