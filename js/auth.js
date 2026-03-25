// =============================================
// MEMORIPLAN — Autenticação
// =============================================

// Verificar se o usuário está logado (redireciona se não)
async function checkAuth() {
  if (!sb) {
    console.error('[MemoriPlan] ❌ checkAuth: cliente Supabase não disponível');
    return null;
  }
  try {
    const { data: { session }, error } = await sb.auth.getSession();
    if (error) {
      console.error('[MemoriPlan] ❌ checkAuth erro:', error.message);
      window.location.href = '/login.html';
      return null;
    }
    if (!session) {
      console.log('[MemoriPlan] ⚠️ Nenhuma sessão ativa, redirecionando para login...');
      window.location.href = '/login.html';
      return null;
    }
    console.log('[MemoriPlan] ✅ Usuário autenticado:', session.user.email);
    return session.user;
  } catch (e) {
    console.error('[MemoriPlan] ❌ checkAuth exceção:', e);
    window.location.href = '/login.html';
    return null;
  }
}

// Login com email/senha
async function loginEmail(email, password) {
  if (!sb) return { error: 'Supabase não conectado' };
  
  if (!validateEmail(email)) {
    return { error: 'E-mail inválido' };
  }
  if (password.length < 8) {
    return { error: 'Senha deve ter pelo menos 8 caracteres' };
  }
  
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'E-mail ou senha incorretos' };
      }
      if (error.message.includes('too many requests')) {
        return { error: 'Muitas tentativas. Tente novamente em alguns minutos' };
      }
      return { error: error.message };
    }
    console.log('[Auth] ✅ Login bem-sucedido:', email);
    return { user: data.user };
  } catch (e) {
    console.error('[Auth] ❌ Erro na autenticação:', e);
    return { error: 'Erro ao conectar. Verifique sua internet' };
  }
}

// Cadastro com email/senha
async function signupEmail(email, password, name) {
  if (!sb) return { error: 'Supabase não conectado' };
  
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    return { error: nameValidation.error };
  }
  if (!validateEmail(email)) {
    return { error: 'E-mail inválido' };
  }
  const passValidation = validatePassword(password);
  if (!passValidation.valid) {
    return { error: passValidation.error };
  }
  
  try {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: sanitizeInput(name) } }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'Este e-mail já está cadastrado' };
      }
      return { error: error.message };
    }

    if (data.user) {
      try {
        await sb.from('user_settings').upsert({
          user_id: data.user.id,
          student_name: sanitizeInput(name),
          daily_goal_hours: 6
        });
      } catch (e) {
        console.warn('[Auth] ⚠️ Erro ao criar settings iniciais:', e);
      }
    }
    
    console.log('[Auth] ✅ Cadastro bem-sucedido:', email);
    return { user: data.user };
  } catch (e) {
    console.error('[Auth] ❌ Erro no cadastro:', e);
    return { error: 'Erro ao cadastrar. Tente novamente' };
  }
}

// Login com Google
async function loginGoogle() {
  if (!sb) return { error: 'Supabase não conectado' };
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/index.html' }
  });
  if (error) return { error: error.message };
  return {};
}

// Logout
async function logout() {
  // Encerra cronômetro ativo e salva a sessão antes de deslogar
  try {
    const TIMER_KEY = 'memoriplan_timer_state';
    const raw = localStorage.getItem(TIMER_KEY);
    if (raw) {
      const state = JSON.parse(raw);
      let elapsed = state.timerSeconds || 0;
      if (state.timerRunning && state.startTimestamp) {
        elapsed = Math.floor((Date.now() - state.startTimestamp) / 1000);
      }
      if (elapsed >= 10) {
        const minutes = elapsed / 60;
        const discipline = state.discipline || 'Estudando';
        if (typeof Data !== 'undefined' && Data.addSession) {
          await Data.addSession({
            date: new Date().toISOString(),
            discipline,
            category: 'Geral',
            topic: 'Sessão encerrada ao sair',
            minutes: Math.round(minutes * 100) / 100,
            questions: 0,
            material: ''
          });
        }
      }
      if (typeof Data !== 'undefined' && Data.setActiveStatus) {
        await Data.setActiveStatus({
          is_active: false,
          discipline: '',
          start_timestamp: null,
          paused_secs: 0
        }).catch(() => {});
      }
      localStorage.removeItem(TIMER_KEY);
    }
  } catch (e) {
    console.warn('[MemoriPlan] logout: erro ao encerrar sessão do cronômetro:', e);
  }

  try {
    if (sb) await sb.auth.signOut();
    console.log('[Auth] ✅ Logout bem-sucedido');
  } catch (e) {
    console.error('[Auth] ❌ Erro ao fazer logout:', e);
  } finally {
    window.location.href = '/login.html';
  }
}

// Pegar usuário atual (sem redirect)
async function getCurrentUser() {
  if (!sb) return null;
  try {
    const { data: { user } } = await sb.auth.getUser();
    return user;
  } catch (e) {
    console.error('[MemoriPlan] ❌ getCurrentUser erro:', e);
    return null;
  }
}
