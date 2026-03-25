# 🚀 AÇÃO IMEDIATA — Vercel Deploy Fix

## ⚡ 5 PASSOS PARA RESOLVER TUDO

### PASSO 1️⃣: Atualizar seu código local

```bash
# Na pasta do projeto
git add .
git commit -m "Fix: Vercel configuration and Supabase debugging"
git push origin main
```

### PASSO 2️⃣: Ir ao Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto **memoriplan**
3. Vá em **Settings** (engrenagem)

### PASSO 3️⃣: Adicionar Variáveis de Ambiente

Em **Settings → Environment Variables**, adicione:

```
Name: VITE_SUPABASE_URL
Value: https://vioiwmuxodgrdzmvzlks.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpb2l3bXV4b2RncmR6bXZ6bGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjcxNjAsImV4cCI6MjA4OTY0MzE2MH0.96exvJavgEVWxZbxC1Ca9Ml2QqYCltG2Q760rRbomSs
```

Clique **Save**

### PASSO 4️⃣: Limpar Cache

1. Em Vercel, vá em **Deployments**
2. Clique em **Settings** → **Build Cache**
3. Clique **Clear All**
4. Volte em **Deployments** e clique **Redeploy**

### PASSO 5️⃣: Aguardar Deploy

Vercel vai fazer deploy automático. Espere 1-2 minutos.

---

## ✅ VERIFICAR SE FUNCIONOU

1. Acesse seu site: `https://seu-nome.vercel.app`
2. Pressione **F12** (DevTools)
3. Vá em **Console**
4. Procure por:
   ```
   [MemoriPlan] ✅ Supabase client criado com sucesso
   ```

Se ver isso ✅, está funcionando!

Se não, acesse `/debug.html` para diagnosticar:
```
https://seu-nome.vercel.app/debug.html
```

---

## 🔧 SE AINDA NÃO FUNCIONAR

### Cenário 1: "CORS error"
- Vá em Supabase → Project Settings → API → CORS
- Adicione: `https://seu-nome.vercel.app`
- Clique Save
- Aguarde 1-2 min e tente novamente

### Cenário 2: "Dados não carregam"
- Vá em Supabase → Authentication → URL Configuration
- Site URL: `https://seu-nome.vercel.app`
- Redirect URLs:
  - `https://seu-nome.vercel.app/`
  - `https://seu-nome.vercel.app/index.html`
- Save

### Cenário 3: "Usuários duplicados / não salvam"
- Limpar localStorage: Ctrl+Shift+Delete (no navegador)
- Selecionar: "Cookies e dados de sites"
- Clicar **Limpar dados**
- Fazer login novamente

### Cenário 4: "Mostra versão antiga"
- Vercel → Deployments → Settings → Build Cache → Clear All
- Recarregar página: Ctrl+Shift+R (hold shift)

---

## 📞 ÚLTIMO RECURSO

Se nenhum cenário acima conectar, execute no console (F12):

```javascript
// Testar conexão com Supabase
if (sb) {
  sb.from('user_settings').select('count', { count: 'exact' })
    .then(r => console.log('✅ OK:', r))
    .catch(e => console.log('❌ ERRO:', e.message));
} else {
  console.log('❌ sb não inicializado - ver debug.html');
}
```

---

## 💾 ARQUIVOS ADICIONADOS

- ✨ `vercel.json` - Configuração para Vercel
- ✨ `VERCEL-SETUP.pt-BR.md` - Guia completo Vercel
- ✨ `debug.html` - Console de debug visual
- ✨ `QUICK-FIX.md` - Este arquivo

---

**Seu app em produção:** `https://seu-nome.vercel.app` 🎉
