-- =============================================
-- MEMORIPLAN — RLS (Row Level Security) Policies
-- Execute isso no SQL Editor do Supabase
-- =============================================

-- ===== STUDY_SESSIONS — Usuários só editam suas próprias sessões =====

-- Deletar políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can read their own sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON study_sessions;

-- Ativar RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Política de LEITURA: usuário só vê suas próprias sessões
CREATE POLICY "Users can read their own sessions"
ON study_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Política de INSERÇÃO: usuário pode criar sessões para si mesmo
CREATE POLICY "Users can create own sessions"
ON study_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE: usuário pode editar suas próprias sessões
CREATE POLICY "Users can update their own sessions"
ON study_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política de DELETE: usuário pode deletar suas próprias sessões
CREATE POLICY "Users can delete their own sessions"
ON study_sessions FOR DELETE
USING (auth.uid() = user_id);

-- ===== CRONOGRAMA_PROGRESS — Usuários só gerenciam seu próprio progresso =====

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

-- ===== USER_SETTINGS — Usuários só editam suas próprias configurações =====

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

-- ===== Verificar que RLS está habilitado =====
-- SELECT tablename, rowsecurity FROM pg_tables WHERE rowsecurity = true;
