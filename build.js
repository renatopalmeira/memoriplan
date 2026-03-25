// Script de build — executa no Vercel antes do deploy
// Substitui as credenciais do Supabase pelas variáveis de ambiente
const fs = require('fs');
const path = require('path');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.');
  console.error('   Configure-as no painel do Vercel em Settings > Environment Variables.');
  process.exit(1);
}

const config = `// Gerado automaticamente pelo build — não edite este arquivo
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isDebug = window.location.search.includes('debug=true');

const SUPABASE_URL = '${url}';
const SUPABASE_ANON_KEY = '${key}';

if (isDebug) {
  console.log('[MemoriPlan] DEBUG MODE ON');
  console.log('[MemoriPlan] Environment:', isDev ? 'DEV (localhost)' : 'PRODUCTION');
}

let sb;
try {
  if (!window.supabase) {
    throw new Error('Supabase SDK não carregou. Verifique sua conexão com a internet.');
  }
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('[MemoriPlan] ✅ Supabase client criado com sucesso');
} catch (e) {
  console.error('[MemoriPlan] ❌ ERRO CRÍTICO ao criar cliente Supabase:', e.message);
  document.addEventListener('DOMContentLoaded', function() {
    const msg = document.createElement('div');
    msg.style.cssText = 'position:fixed;top:10px;left:10px;background:#ff4444;color:white;padding:15px;border-radius:5px;z-index:9999;font-family:monospace;max-width:300px';
    msg.innerHTML = \`<strong>⚠️ Erro Supabase</strong><br>\${e.message}<br><a href="/debug.html" style="color:white;text-decoration:underline">Ver debug.html</a>\`;
    document.body.appendChild(msg);
  });
}
`;

const outputPath = path.join(__dirname, 'js', 'config.js');
fs.writeFileSync(outputPath, config, 'utf8');
console.log('✅ js/config.js gerado com sucesso a partir das variáveis de ambiente.');
