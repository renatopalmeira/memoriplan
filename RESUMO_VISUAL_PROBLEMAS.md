# 🎯 RESUMO VISUAL DOS PROBLEMAS ENCONTRADOS

## 🔴 ERROS CRÍTICOS (BLOQUEANTES)

### 1. VALIDAÇÃO DE SENHA CONFLITANTE

```
┌─────────────────────────────────────────────────────────┐
│ FLUXO DE SIGNUP - PROBLEMA ENCONTRADO                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Usuário digita: senha = "123456" (6 caracteres)      │
│           ↓                                            │
│  login.html valida: ✓ OK (aceita 6)                   │
│           ↓                                            │
│  handleSubmit() chama signupEmail()                    │
│           ↓                                            │
│  signupEmail() chama validatePassword()               │
│           ↓                                            │
│  ✗ ERRO: validatePassword() REJEITA (exige 8)        │
│           ↓                                            │
│  Usuário vê: "Senha deve ter no mínimo 8 caracteres" │
│           ↓                                            │
│  🚫 SIGNUP FALHA!                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘

CONFLITO ENCONTRADO:
┌──────────────────┬──────────────────┬─────────────────────┐
│ login.html       │ js/auth.js       │ js/validation.js   │
├──────────────────┼──────────────────┼─────────────────────┤
│ Aceita: 6 chars  │ Aceita: 6 chars  │ Exige: 8 chars ✗  │
└──────────────────┴──────────────────┴─────────────────────┘
```

**Solução:** Alterar para 8 caracteres em TODOS os 3 arquivos

---

### 2. CRONOGRAMA - RENDERIZAÇÃO QUEBRADA

```
┌─────────────────────────────────────────────────────────┐
│ FLUXO QUANDO USUÁRIO ACESSA /cronograma.html           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Página carrega ✓                                   │
│  2. Variáveis são definidas:                           │
│     - M[] = array de missões (35 itens) ✓             │
│     - PHASES[] = 4 fases ✓                             │
│  3. Função renderNav() é chamada ✓                     │
│     HTML gerado contém:                                │
│     onclick="setPhase(1)"                              │
│           ↓                                            │
│     🚫 ERRO: setPhase() NÃO EXISTE!                   │
│                                                         │
│  4. Usuário clica no botão de fase                     │
│     Browser log: "setPhase is not defined"             │
│           ↓                                            │
│  🚫 CLIQUE NÃO FUNCIONA!                              │
│                                                         │
└─────────────────────────────────────────────────────────┘

TAMBÉM HÁ PROBLEMA DE TIMING:
┌─────────────────────────────────────────┐
│ loadState() é async                     │
├─────────────────────────────────────────┤
│  Sem await:                             │
│  renderNav()      // executa SEM dados │
│  renderMissions() // executa SEM dados │
│           ↓                             │
│  1-2 segundos depois:                  │
│  cs = Data.getProgress() retorna       │
│           ↓                             │
│  CONTEÚDO APARECE DE REPENTE (flicker) │
│           ↓                             │
│  🚫 MÁ EXPERIÊNCIA DE USUÁRIO           │
└─────────────────────────────────────────┘
```

**Solução:** 
- Adicionar função `setPhase()`
- Envolver em `(async () => { await loadState(); renderAll(); })()`

---

### 3. BANCO DE DADOS - TABELAS NÃO CRIADAS

```
┌──────────────────────────────────────────────┐
│ QUANDO getUserário TENTA SALVAR A SESSÃO     │
├──────────────────────────────────────────────┤
│                                              │
│  Code em js/data.js:                         │
│  await sb.from('study_sessions').insert()   │
│           ↓                                  │
│  Supabase retorna:                           │
│  ✗ ERROR: Table 'study_sessions' not found  │
│           ↓                                  │
│  showToast("Erro ao salvar sessão", 'error')│
│           ↓                                  │
│  🚫 SESSÃO NÃO É SALVA!                    │
│                                              │
└──────────────────────────────────────────────┘

TABELAS QUE PRECISAM SER CRIADAS:
┌──────────────────────┬────────────────┬──────────────┐
│ Tabela               │ Status         │ Prioridade   │
├──────────────────────┼────────────────┼──────────────┤
│ study_sessions       │ ⚠️ não existe   │ 🔴 CRÍTICA  │
│ cronograma_progress  │ ⚠️ não existe   │ 🔴 CRÍTICA  │
│ user_settings        │ ⚠️ não existe   │ 🔴 CRÍTICA  │
│ auth.users (Supabase)│ ✅ existe       │ ✅ ok        │
└──────────────────────┴────────────────┴──────────────┘

⚠️ RISCO DE SEGURANÇA:
Se RLS não estiver ativo, ANY usuário consegue VER dados de OUTRO usuário!
```

---

## 🟠 ERROS ALTOS (FUNCIONAM PARCIALMENTE)

### 4. FILTROS DE PERÍODO - BOT

ÃO DESINCRONIZADO

```
┌──────────────────────────────────────────────┐
│ PROBLEMA: Quando usuário clica em SEMANA    │
├──────────────────────────────────────────────┤
│                                              │
│  HTML:  <button class="period-pill active">  │
│         Mês</button>                          │
│                                              │
│  Usuário clica: SEMANA                       │
│           ↓                                  │
│  setPeriod('week') executa                  │
│           ↓                                  │
│  Tenta comparar strings:                    │
│  "Semana" === {week:"Semana"}['week']       │
│  "Semana" === "Semana" ✓                    │
│           ↓                                  │
│  DEVERIA remover .active de MÊS             │
│  DEVERIA adicionar .active a SEMANA         │
│           ↓                                  │
│  ⚠️ PODE FUNCIONAR MAS É FRÁGIL              │
│  (Qualquer mudança no HTML quebra!)         │
│                                              │
└──────────────────────────────────────────────┘
```

**Solução:** Usar `data-period` atributo em vez de comparação de texto

---

### 5. DADOS DO CRONOGRAMA DUPLICADOS

```
CRONOGRAMA.HTML (correto):
┌─────────────────────────────────┐
│ const M = [                     │
│  {id:1, p:1,                    │
│   t:"Missão 1",                 │
│   s:[                           │
│    {d:"mat",t:"Polinômios"},   │ ← COM tópico
│    {d:"bio",t:"Células"}        │ ← COM tópico
│   ]                             │
│  }                              │
│ ]                               │
└─────────────────────────────────┘

INDEX.HTML (incompleto):
┌─────────────────────────────────┐
│ const MISSIONS = [              │
│  {id:1, p:1,                    │
│   s:[                           │
│    {d:"mat"},                   │ ← SEM tópico ✗
│    {d:"bio"}                    │ ← SEM tópico ✗
│   ]                             │
│  }                              │
│ ]                               │
└─────────────────────────────────┘

RESULTADO:
renderDiscProgress() em index.html fica confuso
porque tenta acessar propriedades inexistentes!
```

---

## 📊 MATRIZ DE PROBLEMAS

```
┌─────────────────────┬──────────┬──────────┬────────────┬──────────┐
│ Problema            │ Arquivo  │ Linha    │ Tipo       │ Severid. │
├─────────────────────┼──────────┼──────────┼────────────┼──────────┤
│ Senha conflitante   │ 3 arquiv │ var.     │ Lógica     │ 🔴 CRIT  │
│ Falta setPhase()    │ cron.htm │ 520      │ Função     │ 🔴 CRIT  │
│ Sync login session  │ login.htm│ 148      │ Async      │ 🔴 CRIT  │
│ RLS não ativo       │ Supabase │ N/A      │ Segurança  │ 🔴 CRIT  │
│ Tabelas não existem │ Supabase │ N/A      │ Banco      │ 🔴 CRIT  │
│ Filter active class │ index.htm│ 463      │ DOM        │ 🟠 ALTO  │
│ Dados MISSIONS dup. │ 2 arquiv │ var.     │ Dados      │ 🟠 ALTO  │
│ loadState() timing  │ cron.htm │ 490+     │ Async      │ 🟠 ALTO  │
│ nav.js incompleto   │ nav.js   │ ?        │ Arquivo    │ 🟡 MÉD   │
│ Dark mode listeners │ nav.js   │ ?        │ Event      │ 🟡 MÉD   │
└─────────────────────┴──────────┴──────────┴────────────┴──────────┘
```

---

## 🔍 COMO REPRODUZIR OS ERROS

### Erro 1: Validação de Senha
1. Acesse `/login.html`
2. Clique em "Criar Conta"
3. Digite senha com 6 caracteres: `123456`
4. Resultado esperado: ✔️ aceita
5. Resultado real: ✗ "Senha deve ter no mínimo 8 caracteres"

### Erro 2: Cronograma Vazio
1. Faça login
2. Acesse `/cronograma.html`
3. Clique em qualquer botão de fase (Bronze, Prata, etc)
4. Resultado esperado: ✔️ muda para a fase
5. Resultado real: ✗ browser log: "setPhase is not defined"

### Erro 3: Salvar Sessão Falha
1. Faça login
2. Acesse `/sessoes.html`
3. Preencha formulário e clique "Salvar"
4. Resultado esperado: ✔️ sessão salva
5. Resultado real: ✗ "Erro ao salvar sessão. Verifique sua internet"

---

## ✅ CHECKLIST DE CORREÇÃO

- [ ] **SENHA**: Mudar para 8 caracteres mínimo
  - [ ] login.html linha 160
  - [ ] js/auth.js linha 33
  - [ ] js/validation.js linha 20 (JÁ está correto)

- [ ] **CRONOGRAMA**: Implementar função `setPhase()`
  - [ ] Adicionar função `setPhase(phaseId)`
  - [ ] Envolver inicialização em IIFE async

- [ ] **BANCO**: Criar tabelas no Supabase
  - [ ] Executar supabase-setup.sql
  - [ ] Executar supabase-rls-policies.sql
  - [ ] Verificar RLS status

- [ ] **FILTROS**: Corrigir sincronização
  - [ ] Remover logic string comparison
  - [ ] Usar `data-period` atributo

- [ ] **DADOS**: Mesclar MISSIONS array
  - [ ] Mover dados de index.html para cronograma.html
  - [ ] Remover duplicação
  - [ ] Incluir tópicos em ambos os locais

---

## 📝 NOTAS

- Arquivo `ANALISE_PROBLEMAS.md` criado com detalhes completos
- Arquivo referência: `/memories/session/analise_completa.md`
- Total de problemas encontrados: **10 principais + 5 secundários**
- Estimativa de correção: **2-3 horas** para corrigir tudo
