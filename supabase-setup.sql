-- =============================================
-- MEMORIPLAN — Setup do Banco de Dados Supabase
-- Cole e execute este SQL no SQL Editor do Supabase
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

-- Index para buscar sessões do usuário por data
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

-- Sessões: CRUD apenas para o próprio usuário
create policy "sessions_select" on study_sessions
  for select using (auth.uid() = user_id);
create policy "sessions_insert" on study_sessions
  for insert with check (auth.uid() = user_id);
create policy "sessions_delete" on study_sessions
  for delete using (auth.uid() = user_id);
create policy "sessions_update" on study_sessions
  for update using (auth.uid() = user_id);

-- Progresso: CRUD apenas para o próprio usuário
create policy "progress_select" on cronograma_progress
  for select using (auth.uid() = user_id);
create policy "progress_insert" on cronograma_progress
  for insert with check (auth.uid() = user_id);
create policy "progress_delete" on cronograma_progress
  for delete using (auth.uid() = user_id);
create policy "progress_update" on cronograma_progress
  for update using (auth.uid() = user_id);

-- Settings: CRUD apenas para o próprio usuário
create policy "settings_select" on user_settings
  for select using (auth.uid() = user_id);
create policy "settings_insert" on user_settings
  for insert with check (auth.uid() = user_id);
create policy "settings_update" on user_settings
  for update using (auth.uid() = user_id);
