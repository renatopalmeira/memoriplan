# 📚 Guia de Deploy — MemoriPlan

Este documento descreve os passos para fazer deploy no GitHub e Netlify.

## 1️⃣ Preparar seu repositório local

```bash
# Se ainda não inicializou git
git init
git add .
git commit -m "Initial commit: MemoriPlan v1.0.0"
```

## 2️⃣ Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Preencha:
   - **Repository name**: `memoriplan`
   - **Description**: "Study session planner with timer and curriculum tracking"
   - **Public** (para que outros usando possam encontrar)
   - ✅ **Add .gitignore** (skip - já tem)
   - ✅ **Add a README** (skip - já tem)
3. Clique **"Create repository"**

## 3️⃣ Fazer push do código

Na pasta do projeto, execute:

```bash
# Adicionar remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/memoriplan.git

# Fazer push da branch principal
git branch -M main
git push -u origin main
```

## 4️⃣ Configurar secrets no Netlify

**Opção A — Deploy automático (recomendado)**

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Clique **"Add new site"** → **"Import an existing project"**
3. Selecione GitHub, authorize, escolha seu repo
4. Configurações de build:
   - **Publish directory**: `.` (default)
   - **Build command**: (deixe vazio)
5. Clique **"Deploy site"**
6. Após deploy, vá em **Site settings** → **Build & deploy** → **Environment**
7. Adicione variáveis (opcional):
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua anon key

**Opção B — Deploy manual**

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Deploy
netlify deploy --prod
```

## 5️⃣ Configurar domínio customizado (opcional)

1. No Netlify, vá em **Site settings** → **Domain management**
2. Clique **"Add custom domain"**
3. Digite seu domínio (ex: `meuapp.com`)
4. Seguir instruções para atualizar DNS

## 6️⃣ Sincronizar configurações do Supabase

Antes de cada deploy, verifique:

✅ **No Supabase → Authentication → URL Configuration:**
- Site URL: `https://seu-site.netlify.app`
- Redirect URLs: incluir `https://seu-site.netlify.app/index.html`

✅ **CORS no Supabase** (se tiver problemas):
- Vá em Project Settings → API
- Configure CORS para incluir seu domínio Netlify

## 7️⃣ Monitorar Deploy

Após fazer push para main:

```bash
# Ver histórico de deploys
git log --oneline

# Criar tags de versão
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

---

## 🚨 Troubleshooting

### "Erro de autenticação com Supabase"
- Verificar se `config.js` tem a URL e chave corretos
- Testar localmente com Live Server antes de fazer push

### "Página em branco no deploy"
- Verificar se URLs de redirect estão configuradas no Supabase
- Limpar cache do navegador (Ctrl+Shift+Delete)

### "CORS error"
- No Supabase, adicionar o domínio Netlify em CORS settings
- Ou adicionar como variável de ambiente

---

## 📋 Checklist Final

- [ ] `.gitignore` configurado
- [ ] Credenciais Supabase testadas localmente
- [ ] README.md atualizado 
- [ ] GitHub repo criado e conectado
- [ ] Netlify site criado
- [ ] Variables de ambiente no Netlify (se necessário)
- [ ] URLs de redirect no Supabase configuradas
- [ ] Deploy testado

---

**Dúvidas?** Veja [README.md](./README.md) ou [leia-me.md](./leia-me.md)
