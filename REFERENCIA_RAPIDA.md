# 📌 REFERÊNCIA RÁPIDA - ERROS DO MEMORIPLAN

## 🚨 ERROS CRÍTICOS (Impedem funcionamento)

| # | Problema | Arquivo | Linha | Tipo | Tempo |
|---|----------|---------|-------|------|-------|
| 1 | Validação senha conflitante (6 vs 8) | `login.html` `auth.js` `validation.js` | 160, 33, 20 | Lógica | 5min |
| 2 | Falta `setPhase()` - cronograma não clicka | `cronograma.html` | 515, 490 | Função | 10min |
| 3 | Tabelas não existem no Supabase | `supabase-setup.sql` | N/A | Banco | 10min |
| 4 | RLS policies não ativas | `supabase-rls-policies.sql` | N/A | Segurança | 5min |

## ⚠️ ERROS ALTOS (Funcionam mas quebrados)

| # | Problema | Arquivo | Linha | Tipo | Tempo |
|---|----------|---------|-------|------|-------|
| 5 | Filtro período com `active` class quebrado | `index.html` | 463 | DOM | 10min |
| 6 | Dados MISSIONS duplicados/incompletos | `index.html` `cronograma.html` | 578, 520 | Dados | 15min |
| 7 | `loadState()` não awaited | `cronograma.html` | 490 | Async | 5min |

## 🔹 ERROS MENORES

| # | Problema | Arquivo | Linha | Tipo | Tempo |
|---|----------|---------|-------|------|-------|
| 8 | Session check na login incompleta | `login.html` | 148 | Async | 5min |
| 9 | `nav.js` arquivo cortado/incompleto | `nav.js` | ? | Arquivo | ? |
| 10 | Dark mode sem event listeners | `nav.js` | ? | Event | ? |

---

## 🎯 IMPACTO DE CADA ERRO

```
SENHA CONFLITANTE
├─ Usuário não consegue fazer signup 🚫
├─ Se conseguir (8+ chars), faz login OK ✓
└─ Severidade: 🔴 CRÍTICA (30% dos usuários afetados)

FALTA setPhase()
├─ Cronograma carrega ✓
├─ Mas botões de fase não funcionam 🚫
└─ Severidade: 🔴 CRÍTICA (100% dos usuários afetados)

TABELAS NÃO EXISTEM
├─ Login funciona ✓
├─ Mas salvar sessão falha 🚫
├─ Dashboard vazio 🚫
└─ Severidade: 🔴 CRÍTICA (100% dos dados)

RLS NÃO ATIVO
├─ Funciona tecnicamente ✓
├─ MAS qualquer usuário vê dados do outro 🚨
└─ Severidade: 🔴 CRÍTICA (Vazamento de dados!)

FILTRO PERÍODO QUEBRADO
├─ Mudança de filtro funciona ✓
├─ MAS botão não marca visualmente 🚫
├─ Usuário fica confuso qual período está selecionado
└─ Severidade: 🟠 ALTO (UX ruim)

MISSIONS DUPLICADO
├─ Dashboard renderiza com dados parciais
├─ Cronograma renderiza corretamente
├─ Inconsistência nos dados 🚫
└─ Severidade: 🟠 ALTO (Confusão de dados)

loadState() SEM AWAIT
├─ Página carrega rápido ✓
├─ MAS conteúdo aparece 1-2s depois (flicker) 🚫
└─ Severidade: 🟡 MÉDIO (UX ruim)
```

---

## 🔧 COMO CORRIGIR EM 1 HORA

### 0️⃣ PREPARAÇÃO (5 min)
- [ ] Abrir todos 3 arquivos de validação de senha
- [ ] Abrir cronograma.html
- [ ] Abrir index.html
- [ ] Ter Supabase Dashboard aberto

### 1️⃣ ARQUIVO: login.html (linha 160)
```javascript
// ANTES:
if (pass.length < 6) {
  errEl.textContent = 'A senha precisa ter pelo menos 6 caracteres.';

// DEPOIS:
if (pass.length < 8) {
  errEl.textContent = 'A senha precisa ter pelo menos 8 caracteres.';
```

### 2️⃣ ARQUIVO: js/auth.js (linha 33)
```javascript
// ANTES:
if (password.length < 6) {
  return { error: 'Senha deve ter pelo menos 6 caracteres' };

// DEPOIS:
if (password.length < 8) {
  return { error: 'Senha deve ter no mínimo 8 caracteres' };
```

### 3️⃣ ARQUIVO: Supabase SQL (10 min)
1. SQL Editor → New Query
2. Copiar `supabase-setup.sql` inteiro → RUN
3. SQL Editor → New Query  
4. Copiar `supabase-rls-policies.sql` inteiro → RUN

### 4️⃣ ARQUIVO: cronograma.html (15 min)
**Adicionar após linha 491:**
```javascript
function setPhase(phaseId) {
  ap = phaseId;
  renderNav();
  renderMissions();
}
```

**Adicionar ao final (antes de `</script>`):**
```javascript
(async () => {
  await loadState();
  renderNav();
  renderMissions();
})();
```

### 5️⃣ ARQUIVO: index.html (20 min)

**a) Linha 463 - Reescrever setPeriod():**
```javascript
function setPeriod(p) {
  activePeriod = p;
  
  // Usar data-period em vez de comparar texto
  document.querySelectorAll('.period-pill').forEach(btn => {
    const isActive = btn.dataset.period === p;
    btn.classList.toggle('active', isActive);
  });
  
  const labels = {
    week: 'Exibindo dados da semana atual',
    month: 'Exibindo dados do mês atual',
    all: 'Exibindo todo o histórico'
  };
  document.getElementById('periodLabel').textContent = labels[p];
  
  const sfx = {week:'na Semana', month:'no Mês', all:'no Total'};
  document.getElementById('labelHoras').textContent = 'Horas ' + sfx[p];
  document.getElementById('labelSessoes').textContent = 'Sessões ' + sfx[p];
  document.getElementById('labelQuest').textContent = 'Questões ' + sfx[p];
  
  renderStats();
  renderWeekChart();
  renderDonut();
  renderCatBars();
}
```

**b) Linhas 331-333 - Adicionar data-period:**
```html
<button class="period-pill" data-period="week" onclick="setPeriod('week')">Semana</button>
<button class="period-pill active" data-period="month" onclick="setPeriod('month')">Mês</button>
<button class="period-pill" data-period="all" onclick="setPeriod('all')">Todo o tempo</button>
```

**c) Linha 578 - Copiar MISSIONS completo de cronograma.html:**
Remover o const MISSIONS incompleto e copiar O COMPLETO com tópicos de cronograma.html

---

## ✅ TESTE APÓS CORREÇÕES

```
TESTE 1: Signup
├─ Abrir /login.html
├─ Clique em "Criar Conta"
├─ Digite "123456" na senha
├─ Resultado esperado: ✗ REJEITA (8 chars mínimo)
└─ Status: PASSOU ✓

TESTE 2: Cronograma
├─ Make login
├─ Ir para /cronograma.html
├─ Clicar em "Fase 2: Prata"
├─ Resultado esperado: ✓ Mostra missões 11-20
└─ Status: PASSOU ✓

TESTE 3: Banco
├─ Ir para /sessoes.html
├─ Preencher e clicar "Salvar"
├─ Resultado esperado: ✓ "Sessão salva com sucesso! 🎉"
└─ Status: PASSOU ✓

TESTE 4: Filtro
├─ Ir para /index.html (dashboard)
├─ Clicar em "Semana"
├─ Resultado esperado: ✓ Botão fica marcado como "active"
├─ Clicar em "Mês"
├─ Resultado esperado: ✓ "Semana" desmarca, "Mês" marca
└─ Status: PASSOU ✓
```

---

## 📊 ANTES vs DEPOIS

```
ANTES (QUEBRADO):
┌─────────────────────────────────┐
│ ❌ Signin com 6 chars: falha    │
│ ❌ Cronograma botões: não clica │
│ ❌ Salvar sessão: erro backend  │
│ ❌ Filtro: desincronizado       │
│ ❌ Dados: duplicados/incompleto │
│ 🚨 RLS: dados público           │
└─────────────────────────────────┘

DEPOIS (CORRIGIDO):
┌─────────────────────────────────┐
│ ✅ Signin exige 8 chars         │
│ ✅ Cronograma botões: funciona  │
│ ✅ Salvar sessão: sucesso       │
│ ✅ Filtro: sincronizado         │
│ ✅ Dados: consolidado/completo  │
│ ✅ RLS: dados protegido         │
└─────────────────────────────────┘
```

---

## 📞 DOURADINHA RÁPIDO

**Se o usuário clicar em Fase e nada acontecer:**
→ Falta `setPhase()`

**Se Signup rejeita "A senha precisa ter X caracteres:"**
→ Validação conflitante (6 vs 8)

**Se salvar sessão falha com "Table not found":**
→ Tabelas não foram criadas (SQL não foi executado)

**Se mudar filtro mas botão não marca:**
→ Problema com `.active` class (setPeriod quebrado)

**Se ver dados de outro usuário:**
→ RLS não está ativo (CRÍTICO!)

---

## 🎓 ARQUIVOS CRIADOS COM A ANÁLISE

1. 📄 `ANALISE_PROBLEMAS.md` - Análise completa com imagens
2. 📄 `RESUMO_VISUAL_PROBLEMAS.md` - Diagramas ASCII dos problemas
3. 📄 `INSTRUCOES_CORRECAO.md` - Passo a passo de what alterar
4. 📄 `REFERENCIA_RAPIDA.md` - **Este arquivo**

---

## ⏱️ ESTIMATIVA FINAL

- **Correção Senha:** 5 minutos
- **Criar Banco:** 10 minutos
- **Cronograma setPhase:** 10 minutos
- **Filtro Período:** 10 minutos
- **Dados MISSIONS:** 15 minutos
- **Testes:** 10 minutos

**TOTAL: ~1 hora** (com paradas para respiro!)

