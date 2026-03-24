// =============================================
// MEMORIPLAN — Camada de Dados (Supabase)
// =============================================

const Data = {

  // ========== SESSÕES DE ESTUDO ==========

  async getSessions() {
    if (!sb) { console.error('[Data] getSessions: sb não disponível'); return []; }
    try {
      const { data, error } = await sb
        .from('study_sessions')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        console.error('[Data] ❌ getSessions erro:', error.message, error);
        return [];
      }
      console.log('[Data] ✅ getSessions:', (data || []).length, 'sessões carregadas');
      return data || [];
    } catch (e) {
      console.error('[Data] ❌ getSessions exceção:', e);
      return [];
    }
  },

  async addSession(session) {
    if (!sb) { console.error('[Data] addSession: sb não disponível'); return null; }
    const user = await getCurrentUser();
    if (!user) { console.error('[Data] addSession: usuário não autenticado'); return null; }
    
    // Validar sessão
    const validation = validateSession(session);
    if (!validation.valid) {
      console.error('[Data] ❌ Erro de validação:', validation.errors);
      showToast(validation.errors[0], 'error');
      return null;
    }
    
    try {
      const sessionData = sanitizeSession(session);
      const { data, error } = await sb
        .from('study_sessions')
        .insert({
          user_id: user.id,
          ...sessionData
        })
        .select()
        .single();
      if (error) { 
        console.error('[Data] ❌ addSession erro:', error.message, error);
        showToast('Erro ao salvar sessão. Tente novamente.', 'error');
        return null; 
      }
      console.log('[Data] ✅ addSession: sessão criada com sucesso');
      showToast('Sessão salva com sucesso! 🎉', 'success');
      return data;
    } catch (e) {
      console.error('[Data] ❌ addSession exceção:', e);
      showToast('Erro ao salvar. Verifique sua internet.', 'error');
      return null;
    }
  },

  async deleteSession(id) {
    if (!sb) return false;
    try {
      const { error } = await sb
        .from('study_sessions')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('[Data] ❌ deleteSession erro:', error.message, error);
        showToast('Erro ao deletar sessão.', 'error');
        return false;
      }
      console.log('[Data] ✅ deleteSession: sessão removida');
      showToast('Sessão removida.', 'success');
      return true;
    } catch (e) {
      console.error('[Data] ❌ deleteSession exceção:', e);
      showToast('Erro ao deletar. Tente novamente.', 'error');
      return false;
    }
  },

  async deleteSessionWithConfirm(id) {
    if (confirm('Tem certeza que quer deletar esta sessão?\n\nEsta ação não pode ser desfeita.')) {
      return await this.deleteSession(id);
    }
    return false;
  },

  // ========== PROGRESSO DO CRONOGRAMA ==========

  async getProgress() {
    if (!sb) { console.error('[Data] getProgress: sb não disponível'); return {}; }
    try {
      const { data, error } = await sb
        .from('cronograma_progress')
        .select('check_key, checked');
      if (error) {
        console.error('[Data] ❌ getProgress erro:', error.message, error);
        return {};
      }
      const map = {};
      (data || []).forEach(row => { map[row.check_key] = row.checked; });
      console.log('[Data] ✅ getProgress:', Object.keys(map).length, 'itens de progresso carregados');
      return map;
    } catch (e) {
      console.error('[Data] ❌ getProgress exceção:', e);
      return {};
    }
  },

  async setProgress(key, checked) {
    if (!sb) return;
    const user = await getCurrentUser();
    if (!user) { console.error('[Data] setProgress: usuário não autenticado'); return; }
    try {
      const { error } = await sb
        .from('cronograma_progress')
        .upsert({
          user_id: user.id,
          check_key: key,
          checked: checked,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,check_key' });
      if (error) console.error('[Data] ❌ setProgress erro:', error.message, error);
    } catch (e) {
      console.error('[Data] ❌ setProgress exceção:', e);
    }
  },

  // ========== CONFIGURAÇÕES DO ALUNO ==========

  async getSettings() {
    if (!sb) { console.error('[Data] getSettings: sb não disponível'); return { daily_goal_hours: 6 }; }
    const user = await getCurrentUser();
    if (!user) return { daily_goal_hours: 6, student_name: '' };
    try {
      const { data, error } = await sb
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error || !data) {
        console.warn('[Data] ⚠️ getSettings: sem configurações salvas, usando padrão');
        return { daily_goal_hours: 6, student_name: '' };
      }
      console.log('[Data] ✅ getSettings: configurações carregadas');
      return data;
    } catch (e) {
      console.error('[Data] ❌ getSettings exceção:', e);
      return { daily_goal_hours: 6, student_name: '' };
    }
  },

  async saveSettings(settings) {
    if (!sb) return;
    const user = await getCurrentUser();
    if (!user) return;
    try {
      const { error } = await sb
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });
      if (error) console.error('[Data] ❌ saveSettings erro:', error.message, error);
      else console.log('[Data] ✅ saveSettings: configurações salvas');
    } catch (e) {
      console.error('[Data] ❌ saveSettings exceção:', e);
    }
  }
};
