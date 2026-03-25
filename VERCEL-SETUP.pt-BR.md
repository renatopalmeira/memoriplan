# 🚀 Guia Completo — Vercel + Supabase

## ⚠️ PROBLEMAS ENCONTRADOS E SOLUÇÕES

### 1️⃣ O que deu errado (Netlify → Vercel)

| Problema | Causa | Solução |
|----------|-------|--------|
| Perda de dados | Credenciais do Supabase não configuradas | Adicionar env vars no Vercel |
| Index não mostra nome | JS não carregando dados do usuário | Verificar se cache está bloqueando |
| Cronograma vazio | Dados não sincronizando | CORS do Supabase precisa do domínio Vercel |
| Usuários duplicados | Sessão não persistindo corretamente | Limpar cookies/localStorage |

---

## ✅ PASSO 1: Configurar Variáveis de Ambiente no Vercel

1. Acesse seu projeto no Vercel: [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto **memoriplan**
3. Vá em **Settings** → **Environment Variables**
4. Adicione estas 2 variáveis:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOi...sua-chave
```

5. Clique **Save**

---

## ✅ PASSO 2: Configurar CORS no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com) → seu projeto
2. Vá em **Project Settings** (engrenagem) → **API**
3. Procure por **CORS**
4. Adicione sua URL do Vercel:
   ```
   https://seu-nome.vercel.app
   https://www.seu-nome.vercel.app
   https://seu-nome-git-main.vercel.app
   ```
5. Salve

---

## ✅ PASSO 3: Configurar URLs de Redirect

1. No Supabase → **Authentication** → **URL Configuration**
2. **Site URL** = `https://seu-nome.vercel.app`
3. **Redirect URLs** = adicione:
   ```
   https://seu-nome.vercel.app/
   https://seu-nome.vercel.app/index.html
   http://localhost:3000
   ```

---

## ✅ PASSO 4: Limpar Cache do Vercel

1. No Vercel, vá em **Settings** → **Build Cache**
2. Clique **Clear All** (limpa cache antigo)
3. Volte ao **Deployments** e clique **Redeploy**

---

## ✅ PASSO 5: Limpar Cache Local do Navegador

Abra seu site no Vercel e pressione:

**Windows/Linux:**
```
Ctrl + Shift + Delete
```

**macOS:**
```
Cmd + Shift + Delete
```

Selecione:
- ☑️ Cookies e outros dados de sites
- ☑️ Arquivos em cache
- Clique **Limpar dados**

---

## ✅ PASSO 6: Forçar Novo Deploy

```bash
# Na pasta do projeto, fazer commit e push
git add .
git commit -m "Fix: Vercel deployment configuration"
git push origin main
```

Vercel detecta o push e faz deploy automático!

---

## 🔍 COMO VERIFICAR SE ESTÁ FUNCIONANDO

### 1. Verificar Console do Navegador

1. Abra seu site: `https://seu-nome.vercel.app`
2. Pressione **F12** (DevTools)
3. Vá na aba **Console**
4. Procure por estas mensagens:

✅ **Bom:**
```
[MemoriPlan] ✅ Supabase client criado com sucesso
[Data] ✅ getSessions: 5 sessões carregadas
```

❌ **Ruim:**
```
[MemoriPlan] ❌ ERRO CRÍTICO ao criar cliente Supabase
CORS error
```

### 2. Testar Login

1. Vá em `https://seu-nome.vercel.app/login.html`
2. Crie uma conta nova
3. Verifique se redireciona para index.html
4. Verifique se mostra seu nome no dashboard

### 3. Testar Supabase Diretamente

No console do navegador (F12 → Console):

```javascript
// Verificar se Supabase carregou
console.log(window.supabase)

// Verificar se sb foi criado
console.log(sb)

// Teste de conexão
setTimeout(async () => {
  const { data, error } = await sb.from('cronograma_progress').select('count', { count: 'exact' });
  console.log('Conexão OK:', data, error);
}, 1000);
```

---

## 🚨 TROUBLESHOOTING

### ❌ "CORS error"

**Causa:** Domínio não está configurado no Supabase

**Solução:**
1. No Supabase → Project Settings → API
2. Certificar que sua URL do Vercel está em CORS
3. Limpar cache do navegador (Ctrl+Shift+Delete)

### ❌ "Supabase SDK não carregou"

**Causa:** CDN do Supabase não carregando (problema de rede)

**Solução:**
1. Verificar conexão de internet
2. Usar VPN/Proxy se necessário
3. Tentar em outro navegador

### ❌ "Usuários não aparecem no Dashboard"

**Causa:** JavaScript não está executando

**Solução:**
1. F12 → Console → procurar por erros
2. Verificar se `config.js` tem credenciais válidas
3. Testar em modo incógnito (sem cache)

### ❌ "Versão antiga aparecendo"

**Causa:** Cache do Vercel

**Solução:**
1. Vercel Settings → Build Cache → Clear All
2. Redeploy
3. Ctrl+Shift+Delete (navegador)

---

## 📋 CHECKLIST FINAL

- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] CORS configurado no Supabase com URL do Vercel
- [ ] URL de redirect no Supabase atualizada
- [ ] Cache do Vercel limpo
- [ ] Cache do navegador limpo
- [ ] Novo deploy feito (git push)
- [ ] Console do navegador sem erros vermelhos
- [ ] Login funciona e mostra nome do aluno
- [ ] Dados aparecem no Dashboard
- [ ] Cronograma carrega fases e missões

---

## 💡 DICAS IMPORTANTES

### URL do Vercel

Você pode encontrar em:
- Dashboard do Vercel → seu projeto → Production URL
- Exemplo: `https://memoriplan-renatopalmeira.vercel.app`
- Ou seu domínio customizado se tiver

### Se tiver Domínio Customizado

Se você tiver um domínio próprio (tipo `meuapp.com`):
1. No Supabase, adicione também esse domínio ao CORS
2. Na URL Configuration, adicione também esse domínio
3. Tudo mais continua igual

### Alternativa: Usar `.env.local`

Se não quiser usar variáveis de ambiente, pode colocar diretamente em `config.js`:
```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave';
```

Mas **não faça push disso para GitHub** — é segurança!

---

## 📞 Precisa de Ajuda?

Se ainda tiver problemas:
1. Verifique o **Console do Navegador** (F12)
2. Copie a mensagem de erro exata
3. Verifique as URLs no Supabase (CORS + Redirects)
4. Limpe cache (Vercel + Navegador)
5. Faça novo deploy

**Seu app em: https://seu-nome.vercel.app** 🚀
