// =============================================
// MEMORIPLAN — Configuração do Supabase
// Lê credenciais de variáveis de ambiente ou window
// =============================================

// Tentar ler de variáveis de ambiente (Netlify, Vite, etc)
let SUPABASE_URL = import.meta?.env?.VITE_SUPABASE_URL;
let SUPABASE_ANON_KEY = import.meta?.env?.VITE_SUPABASE_ANON_KEY;

// Fallback: procurar em window (para modo CDN)
if (!SUPABASE_URL && window.ENV?.SUPABASE_URL) {
  SUPABASE_URL = window.ENV.SUPABASE_URL;
}
if (!SUPABASE_ANON_KEY && window.ENV?.SUPABASE_ANON_KEY) {
  SUPABASE_ANON_KEY = window.ENV.SUPABASE_ANON_KEY;
}

// Criar cliente Supabase (usa o SDK carregado via CDN)
let sb;
try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Credenciais do Supabase não configuradas. ' +
      'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local ' +
      'ou no Netlify (Settings → Environment)'
    );
  }
  
  if (!window.supabase) {
    throw new Error('Supabase SDK não carregou. Verifique sua conexão com a internet.');
  }
  
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('[MemoriPlan] ✅ Supabase client criado com sucesso');
  console.log('[MemoriPlan] URL:', SUPABASE_URL.substring(0, 30) + '...');
} catch (e) {
  console.error('[MemoriPlan] ❌ ERRO CRÍTICO ao criar cliente Supabase:', e.message);
  alert('Erro ao conectar com o Supabase.\n\n' + e.message + '\n\nVeja o console (F12) para mais detalhes.');
}
