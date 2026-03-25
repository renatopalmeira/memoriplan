# 📤 FAZER PUSH — Instruções Passo a Passo

## Se o terminal não funcionar, siga estes passos:

### Option 1: Usar VS Code (Recomendado)

1. Abra seu projeto em **VS Code**
2. Clique na aba **Source Control** (à esquerda)
3. Você verá os arquivos modificados em **CHANGES**
4. Clique no **+** perto de "CHANGES" para fazer stage de tudo
5. Escreva a mensagem no campo:
   ```
   Fix: Complete Vercel deployment configuration
   ```
6. Clique no botão **Commit** (✓)
7. Clique em **Push** (ou Ctrl+Shift+P → Git: Push)

### Option 2: Terminal / Linha de Comando

Se quiser fazer na linha de comando:

```bash
# 1. Navegar até a pasta
cd ~/Downloads/"memoriplan - cópia"

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer commit
git commit -m "Fix: Complete Vercel deployment configuration"

# 4. Fazer push
git push origin main
```

### Option 3: GitHub Desktop (se tiver instalado)

1. Abra **GitHub Desktop**
2. Selecione seu repositório **memoriplan**
3. Os arquivos modificados aparecerão
4. Escreva o comentário
5. Clique **Commit to main**
6. Clique **Push origin**

---

## ✅ Após fazer Push

1. Acesse **https://vercel.com/dashboard**
2. Vercel vai detectar automaticamente o push
3. Será feito um novo deploy
4. Espere 2-3 minutos

---

## 📋 Arquivos que serão enviados

✨ **NOVOS:**
- `vercel.json`
- `VERCEL-SETUP.md`
- `QUICK-FIX.md`
- `SETUP-VERCEL.md`
- `debug.html`
- `.gitignore`
- `README.md`
- `VERSION`
- `LICENSE`
- `.github/workflows/deploy.yml`

✏️ **MODIFICADOS:**
- `netlify.toml`
- `js/config.js`

---

**Depois que fizer push, vá para a próxima etapa: ADICIONAR VARIÁVEIS DE AMBIENTE NO VERCEL** 👇

1. https://vercel.com/dashboard
2. Seu projeto → Settings → Environment Variables
3. Adicione 2 variáveis (veja SETUP-VERCEL.md)
