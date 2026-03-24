# MemoriPlan — Guia de Deploy

## 📁 Estrutura do Projeto

```
memoriplan/
├── index.html          ← Dashboard (página inicial)
├── sessoes.html        ← Sessão de Estudo (cronômetro + registro)
├── cronograma.html     ← Cronograma 35 Semanas (checklist)
├── login.html          ← Tela de Login / Cadastro
├── js/
│   ├── config.js       ← Credenciais do Supabase (EDITAR)
│   ├── auth.js         ← Funções de autenticação
│   ├── data.js         ← CRUD de dados (sessões, progresso, settings)
│   └── nav.js          ← Navegação compartilhada + helpers
├── supabase-setup.sql  ← SQL para criar tabelas (rodar no Supabase)
├── netlify.toml        ← Configuração do Netlify
└── LEIA-ME.md          ← Este arquivo
```

---

## 🚀 PASSO A PASSO COMPLETO

### ETAPA 1 — Criar projeto no Supabase (5 min)

1. Acesse https://supabase.com e crie uma conta (grátis)
2. Clique em **"New Project"**
3. Preencha:
   - Nome: `memoriplan`
   - Senha do banco: anote em lugar seguro
   - Região: escolha a mais próxima (São Paulo se disponível)
4. Aguarde o projeto ser criado (~2 minutos)

### ETAPA 2 — Criar as tabelas no banco (3 min)

1. No painel do Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"**
3. Abra o arquivo `supabase-setup.sql` deste projeto
4. Copie TODO o conteúdo e cole no editor SQL
5. Clique em **"Run"** (botão verde)
6. Deve aparecer "Success" — as 3 tabelas foram criadas

### ETAPA 3 — Pegar suas credenciais (2 min)

1. No menu lateral, clique em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Copie estes dois valores:
   - **Project URL** → algo como `https://xyzabc123.supabase.co`
   - **anon public key** → uma string longa começando com `eyJ...`

### ETAPA 4 — Configurar o projeto (1 min)

1. Abra o arquivo `js/config.js` no seu editor
2. Substitua os valores:

```javascript
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';      // ← Cole a URL aqui
const SUPABASE_ANON_KEY = 'eyJhbGciOi...sua-chave-aqui';     // ← Cole a anon key aqui
```

3. Salve o arquivo

### ETAPA 5 — Ativar autenticação por e-mail (2 min)

1. No Supabase, vá em **"Authentication"** no menu lateral
2. Clique em **"Providers"**
3. **Email** já deve estar ativo (padrão)
4. Em **"Email Auth"**, marque/desmarque conforme preferir:
   - ✅ Enable email confirmations (recomendado para produção)
   - ❌ Desmarque se quiser testar sem confirmar e-mail

### ETAPA 5b — Ativar Login com Google (opcional)

1. Em **"Providers"**, clique em **"Google"**
2. Ative o toggle
3. Você vai precisar criar credenciais no Google Cloud Console:
   - Acesse https://console.cloud.google.com
   - Crie um projeto
   - Vá em APIs & Services > Credentials > Create OAuth 2.0 Client
   - Adicione a URL de redirect que o Supabase mostra
4. Cole o Client ID e Client Secret no Supabase
5. Salve

### ETAPA 6 — Configurar URLs permitidos (1 min)

1. No Supabase, vá em **"Authentication"** > **"URL Configuration"**
2. Em **"Site URL"**, coloque: `https://seu-site.netlify.app`
3. Em **"Redirect URLs"**, adicione:
   - `https://seu-site.netlify.app/index.html`
   - `http://localhost:5500` (para testes locais)
4. Salve

### ETAPA 7 — Testar localmente (opcional, 2 min)

Se quiser testar antes de subir:

1. Instale a extensão **"Live Server"** no VS Code
2. Abra a pasta `memoriplan` no VS Code
3. Clique com botão direito em `login.html` > "Open with Live Server"
4. Crie uma conta de teste e navegue entre as telas

### ETAPA 8 — Deploy no Netlify (5 min)

**Opção A — Pelo site (mais fácil):**

1. Acesse https://app.netlify.com
2. Crie uma conta (grátis, pode usar conta do GitHub)
3. Clique em **"Add new site"** > **"Deploy manually"**
4. ARRASTE a pasta `memoriplan` inteira para a área indicada
5. Pronto! Seu site estará no ar em ~30 segundos
6. O Netlify vai gerar uma URL tipo: `https://nome-aleatorio.netlify.app`

**Opção B — Pelo GitHub (deploy automático):**

1. Crie um repositório no GitHub (ex: `memoriplan`)
2. Faça upload de todos os arquivos do projeto
3. No Netlify, clique em **"Add new site"** > **"Import an existing project"**
4. Conecte ao GitHub e selecione o repositório
5. Em "Publish directory", deixe `.` (ponto)
6. Clique em **"Deploy site"**
7. Agora toda vez que fizer push no GitHub, o Netlify atualiza automaticamente

### ETAPA 9 — Domínio customizado (opcional)

1. No Netlify, vá em **"Domain settings"**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: `app.memoriplan.com.br`)
4. Configure o DNS no seu registrador:
   - Adicione um CNAME apontando para `seu-site.netlify.app`
5. O Netlify gera o certificado HTTPS automaticamente

### ETAPA 10 — Voltar ao Supabase e atualizar URL

Depois que tiver o domínio final:

1. Vá em **Authentication** > **URL Configuration**
2. Atualize a **Site URL** com seu domínio final
3. Adicione o domínio final em **Redirect URLs**

---

## ✅ CHECKLIST FINAL

- [ ] Tabelas criadas no Supabase (SQL executado)
- [ ] URL e chave colados em `js/config.js`
- [ ] Auth por email ativado no Supabase
- [ ] URLs permitidas configuradas no Supabase
- [ ] Teste local funcionando (login + registrar sessão)
- [ ] Deploy no Netlify feito
- [ ] URL final atualizada no Supabase

---

## 🔧 SOLUÇÃO DE PROBLEMAS

**"Login não funciona"**
→ Verifique se as credenciais em `js/config.js` estão corretas
→ Verifique se o Auth por email está ativo no Supabase

**"Dados não salvam"**
→ Verifique as tabelas no Table Editor do Supabase
→ Verifique se as RLS policies foram criadas (SQL rodou completo?)

**"Tela branca após login"**
→ Abra o console do navegador (F12) e veja o erro
→ Geralmente é URL do Supabase errada no config.js

**"Google login redireciona para URL errada"**
→ Atualize o Redirect URL em Authentication > URL Configuration
