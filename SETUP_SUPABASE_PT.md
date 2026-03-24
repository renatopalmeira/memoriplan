# 🗄️ CONFIGURAR SUPABASE - GUIA PASSO A PASSO

## ⚠️ IMPORTANTE
Seu aplicativo **NÃO FUNCIONARÁ** até você executar estes passos no Supabase!

---

## 📍 PASSO 1: Acessar o SQL Editor do Supabase

1. Entre em https://app.supabase.com
2. Clique no seu **projeto MemoriPlan**
3. No menu esquerdo, procure por **"SQL Editor"**
4. Clique em **"SQL Editor"**

```
Dashboard Supabase
├── Seu Projeto
│   ├── SQL Editor ✓ (CLIQUE AQUI)
│   ├── Tabelas
│   ├── Autenticação
│   └── ...
```

---

## 📊 PASSO 2: Criar as Tabelas do Banco de Dados

### 2a. Crie uma Nova Query

1. Clique no botão **"+ New Query"** no topo
2. Uma página em branco aparecerá

### 2b. Cole o SQL das Tabelas

**COPIE TODO O TEXTO ABAIXO:**

```sql
-- =============================================
-- MEMORIPLAN — Setup do Banco de Dados Supabase
-- =============================================

-- 1. TABELA DE SESSÕES DE ESTUDO
create table if not exists study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  date timestamptz not null,
  discipline text not null,
  category text not null default 'Teoria',
  topic text,
  minutes numeric not null default 0,
  questions integer default 0,
  material text
);

create index if not exists idx_sessions_user_date on study_sessions(user_id, date desc);

-- 2. TABELA DE PROGRESSO DO CRONOGRAMA (checklist)
create table if not exists cronograma_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  check_key text not null,
  checked boolean default true,
  updated_at timestamptz default now(),
  unique(user_id, check_key)
);

create index if not exists idx_progress_user on cronograma_progress(user_id);

-- 3. TABELA DE CONFIGURAÇÕES DO ALUNO
create table if not exists user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  daily_goal_hours integer default 6,
  student_name text,
  updated_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (cada aluno só vê seus dados)
-- =============================================

alter table study_sessions enable row level security;
alter table cronograma_progress enable row level security;
alter table user_settings enable row level security;
```

### 2c. Cole na caixa de texto

1. Na página do SQL Editor, **COLA** o texto acima na caixa de texto grande
2. Clique no botão **"Run"** (botão azul no canto inferior direito)

### 2d. Verifique o resultado

Você deve ver uma mensagem como:

```
✓ Query executada com sucesso

12 rows affected
```

**Se vir erro?** Tente novamente ou copie só até a linha que não dar erro.

---

## 🔒 PASSO 3: Ativar as Políticas de Segurança (RLS)

### 3a. Crie uma NOVA Query

1. Clique novamente em **"+ New Query"**
2. Uma nova página em branco aparecerá

### 3b. Cole o SQL de Segurança

**COPIE TODO O TEXTO ABAIXO:**

```sql
-- =============================================
-- MEMORIPLAN — RLS (Row Level Security) Policies
-- =============================================

-- ===== STUDY_SESSIONS =====
DROP POLICY IF EXISTS "Users can read their own sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON study_sessions;

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own sessions"
ON study_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
ON study_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON study_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON study_sessions FOR DELETE
USING (auth.uid() = user_id);

-- ===== CRONOGRAMA_PROGRESS =====
DROP POLICY IF EXISTS "Users can read their own progress" ON cronograma_progress;
DROP POLICY IF EXISTS "Users can upsert their own progress" ON cronograma_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON cronograma_progress;

ALTER TABLE cronograma_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own progress"
ON cronograma_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own progress"
ON cronograma_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON cronograma_progress FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ===== USER_SETTINGS =====
DROP POLICY IF EXISTS "Users can read their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can upsert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own settings"
ON user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### 3c. Cole na caixa de texto

1. **COLA** o texto acima na nova caixa de texto
2. Clique em **"Run"** novamente

### 3d. Verifique o resultado

Você deve ver:

```
✓ Query executada com sucesso

12 rows affected
```

---

## ✅ VERIFICAÇÃO FINAL

Vá à aba **"Tabelas"** (Table Editor) no menu esquerdo.

Você deve ver **3 tabelas novas:**

```
📊 Tabelas
├── study_sessions        ✓
├── cronograma_progress   ✓
└── user_settings         ✓
```

Se as 3 aparecem, **PRONTO!** 🎉

---

## 🚀 PRÓXIMO PASSO

Após completar 1, 2 e 3:

1. **Aguarde 30 segundos** para a Vercel fazer o redeploy
2. Acesse seu app: https://seu-app.vercel.app
3. **Teste o login** com um email e senha (mínimo 8 caracteres)
4. **Teste criar uma sessão de estudo**
5. **Teste os filtros** (Semana, Mês, Todo o tempo)

---

## 🆘 PROBLEMAS?

### ❌ "Table already exists"
Isso é NORMAL. Significa que você já criou uma vez. Só execute novamente.

### ❌ "Permission denied"
Verifique que está logado na **conta correta** do Supabase.

### ❌ Ainda não vê as tabelas
Atualize a página (F5 ou Cmd+R) no Supabase.

---

## 📝 TABELAS CRIADAS

| Tabela | Função |
|--------|--------|
| `study_sessions` | Armazena sessões de estudo (tempo, disciplina, questões) |
| `cronograma_progress` | Armazena o progresso checklist (semanas marcadas) |
| `user_settings` | Armazena preferências do usuário (meta diária, nome) |

Cada tabela garante que:
- ✅ Cada usuário **só vê seus próprios dados**
- ✅ Dados são **persistentes** (não apagam ao sair)
- ✅ Aplicativo **funciona offline** inicialmente, sincroniza depois

---

**Sucesso! Seu aplicativo estará 100% funcional após estes passos.** 🎓
