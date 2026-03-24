# 🛠️ INSTRUÇÕES TÉCNICAS DE CORREÇÃO

## ERRO 1: Validação de Senha Conflitante

### 📍 Localização
- `login.html` - linha 160
- `js/auth.js` - linha 33
- `js/validation.js` - linha 20 (DIFERENTE)

### 🔧 Correção

**Passo 1: login.html linha 160**
```diff
  if (pass.length < 6) {
-   errEl.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
+   errEl.textContent = 'A senha precisa ter pelo menos 8 caracteres.';
```

**Passo 2: js/auth.js linha 33**
```diff
  if (password.length < 6) {
-   return { error: 'Senha deve ter pelo menos 6 caracteres' };
+   return { error: 'Senha deve ter no mínimo 8 caracteres' };
```

**Passo 3: Verificar js/validation.js (JÁ correto)**
```javascript
// Linha 20 - NÃO MUDE (está correto)
if (password.length < 8) {
  return { valid: false, error: 'Senha deve ter no mínimo 8 caracteres' };
}
```

**Verificação após correção:**
Tentar signup com "123456" deve mostrar: "Senha deve ter no mínimo 8 caracteres"

---

## ERRO 2: Falta Função `setPhase()` no Cronograma

### 📍 Localização
- `cronograma.html` - linha 515 (onde o onclick é gerado)

### 🔧 Correção

**Passo 1: Localizar onde as funções estão definidas**
Procure em `cronograma.html` pela linha ~490 onde estão:
```javascript
async function loadState(){...}
async function saveState(){}
function gk(mi,si,ty){...}
// etc
```

**Passo 2: Adicionar a função `setPhase()` depois de `saveState()`**
```javascript
async function loadState(){
  try{
    cs = await Data.getProgress();
  }catch(e){
    console.error('Erro ao carregar progresso:', e);
    cs = {};
  }
}
async function saveState(){}  // Não precisa mais, é salvo por item em tc()

// ADD ISSO:
function setPhase(phaseId) {
  ap = phaseId;
  renderNav();
  renderMissions();
}
// FIM DO QUE ADD

function gk(mi,si,ty){return`${mi}-${si}-${ty}`;}
```

**Passo 3: TAMBÉM corrigir inicialização assíncrona**
Procure no final de `cronograma.html` por:
```javascript
function renderNav(){...}
function renderMissions(){...}
```

Se não houver uma IIFE, ADICIONE no final do arquivo (antes de `</script>`):
```javascript
// Inicializar após DOM estar pronto
(async () => {
  await loadState();
  renderNav();
  renderMissions();
})();
```

**Verificação após correção:**
Clicar em "Fase 2: Prata" deve mostrar as missões 11-20

---

## ERRO 3: Banco de Dados - Tabelas não Existem

### 📍 Localização
- Supabase Dashboard → SQL Editor

### 🔧 Correção

**Passo 1: Ir ao Supabase Dashboard**

**Passo 2: Executar `supabase-setup.sql`**
1. Abrir arquivo `supabase-setup.sql`
2. Copiar TODO o conteúdo
3. No Supabase → SQL Editor → New Query
4. Colar código
5. Clicar "RUN"
6. Aguardar criação das tabelas ✓

**Passo 3: Executar `supabase-rls-policies.sql`**
1. Abrir arquivo `supabase-rls-policies.sql`
2. Copiar TODO o conteúdo
3. No Supabase → SQL Editor → New Query
4. Colar código
5. Clicar "RUN"
6. Aguardar aplicação de Row Level Security ✓

**O que isso faz:**
- ✅ Cria tabela `study_sessions` com RLS
- ✅ Cria tabela `cronograma_progress` com RLS
- ✅ Cria tabela `user_settings` com RLS
- ✅ Ativa RLS para que cada usuário veja ONLY seus dados

**Verificação:**
1. Fazer login em `/login.html`
2. Ir para `/sessoes.html`
3. Salvar uma sessão
4. Deve mostra "Sessão salva com sucesso! 🎉"

---

## ERRO 4: Filtro de Período com `active` class Desincronizado

### 📍 Localização
- `index.html` - linhas 463-483 (função `setPeriod()`)

### 🔧 Correção

**Passo 1: Localizar função setPeriod()**
Procure por:
```javascript
function setPeriod(p) {
  activePeriod = p;
  // ...
}
```

**Passo 2: Primeiro, ADICIONAR data-period nos botões**
Procure por:
```html
<button class="period-pill" onclick="setPeriod('week')">Semana</button>
```

Altere para:
```html
<button class="period-pill" data-period="week" onclick="setPeriod('week')">Semana</button>
<button class="period-pill active" data-period="month" onclick="setPeriod('month')">Mês</button>
<button class="period-pill" data-period="all" onclick="setPeriod('all')">Todo o tempo</button>
```

**Passo 3: REESCREVER a função setPeriod() corrigida**
```javascript
function setPeriod(p) {
  activePeriod = p;
  
  // Usar data-period em vez de comparar texto
  document.querySelectorAll('.period-pill').forEach(btn => {
    const isActive = btn.dataset.period === p;
    btn.classList.toggle('active', isActive);
  });
  
  // atualizar label
  const labels = {
    week: 'Exibindo dados da semana atual',
    month: 'Exibindo dados do mês atual',
    all: 'Exibindo todo o histórico'
  };
  document.getElementById('periodLabel').textContent = labels[p];
  
  // atualizar rótulos dos cards
  const sfx = {week:'na Semana', month:'no Mês', all:'no Total'};
  document.getElementById('labelHoras').textContent = 'Horas ' + sfx[p];
  document.getElementById('labelSessoes').textContent = 'Sessões ' + sfx[p];
  document.getElementById('labelQuest').textContent = 'Questões ' + sfx[p];
  
  // re-renderizar
  renderStats();
  renderWeekChart();
  renderDonut();
  renderCatBars();
}
```

**Verificação após correção:**
1. Clicar em "Semana" → botão fica marcado
2. Clicar em "Mês" → botão anterior desmarca, novo fica marcado
3. Clicar em "Todo o tempo" → botão anterior desmarca, novo fica marcado

---

## ERRO 5: Dados do Cronograma Duplicados

### 📍 Localização
- `cronograma.html` - final do arquivo (dados corretos)
- `index.html` - linhas 578-612 (dados incompletos)

### 🔧 Correção (SIMPLES)

**SOLUÇÃO: Usar os dados de cronograma.html**

Em `index.html`, procure por:
```javascript
const MISSIONS = [
{id:1,p:1,s:[{d:"mat"},{d:"mat"},{d:"mat"},{d:"mat"},{d:"bio"},{d:"bio"},{d:"bio"},{d:"qui"},{d:"qui"},{d:"fis"}]},
// ... mais 34 missões
];
```

TROQUE POR:
```javascript
// Copiar do cronograma.html - dados completos com tópicos
const MISSIONS = [
{id:1,p:1,t:"Missão 1",s:[{d:"mat",t:"Polinômios"},{d:"mat",t:"Operações entre soluções"},{d:"mat",t:"Raízes complexas"},{d:"mat",t:"Equações"},{d:"bio",t:"Conceitos iniciais"},{d:"bio",t:"Origem da vida"},{d:"bio",t:"Teoria da evolução"},{d:"qui",t:"Estrutura da matéria"},{d:"qui",t:"Ligações químicas"},{d:"fis",t:"Cinemática"}]},
// ... copiar TODAS as 35 missões do cronograma.html
];
```

**OU MELHOR AINDA:** Importar de um arquivo separado `js/cronograma-data.js`

---

## ERRO 6: Login Session Check

### 📍 Localização
- `login.html` - linhas 148-152

### 🔧 Correção (SIMPLES)

**Antes:**
```javascript
(async () => {
  if (!sb) { console.error('Supabase não disponível'); return; }
  const { data: { session } } = await sb.auth.getSession();
  if (session) window.location.href = '/index.html';
})();
```

**Depois:**
```javascript
(async () => {
  if (!sb) { 
    console.error('Supabase não disponível'); 
    return; 
  }
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      // Aguardar um pouco antes de redirecionar
      await new Promise(resolve => setTimeout(resolve, 100));
      window.location.href = '/index.html';
    }
  } catch (e) {
    console.error('Erro ao verificar sessão:', e);
  }
})();
```

---

## 📋 ORDEM RECOMENDADA DE CORREÇÃO

1️⃣ **PRIMEIRO** - Corrigir senha (15 minutos)
   - Alterações simples em 3 locais

2️⃣ **SEGUNDO** - Criar tabelas no Banco (10 minutos)
   - Executar 2 arquivos SQL

3️⃣ **TERCEIRO** - Cronograma - função setPhase() (15 minutos)
   - Adicionar 1 função, 1 IIFE

4️⃣ **QUARTO** - Dados MISSIONS (20 minutos)
   - Copiar dados de cronograma.html para index.html

5️⃣ **QUINTO** - Filtro período (15 minutos)
   - Reescrever função, adicionar data-period

6️⃣ **SEXTO** - Outros ajustes menores (10 minutos)
   - Login session check, nav.js verificação

**TEMPO TOTAL: ~1h30m**

---

## ✅ CHECKLIST FINAL

Após fazer TODAS as correções:

- [ ] Senha com 8 caracteres mínimo em TODOS os 3 locais
- [ ] Função `setPhase()` adicionada
- [ ] Tabelas criadas no Supabase com RLS ativo
- [ ] Dados MISSIONS mesclados (sem duplicação)
- [ ] Filtro de período com `data-period` atributo
- [ ] IIFE de init no cronograma

**Teste cada funcionalidade:**
- [ ] Signup com senha < 8 caracteres → REJEITA ✓
- [ ] Signup com senha ≥ 8 caracteres → ACEITA ✓
- [ ] Click em botão de fase → muda conteúdo ✓
- [ ] Salvar sessão → aparece em dashboard ✓
- [ ] Mudar filtro → dados atualizam + botão marca ✓

---

## 🆘 SE ALGO NÃO FUNCIONAR

1. **Abrir Developer Tools** (F12)
2. **Ver aba Console** para erros
3. **Procurar por:**
   - `setPhase is not defined` → falta função
   - `study_sessions table not found` → tabelas não criadas
   - `Cannot read property 'trim' of null` → HTML mudou

4. **Se conseguir registrar no console os erros, pode me enviar que corrijo!**

