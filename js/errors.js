// =============================================
// MEMORIPLAN — Error Handler Global
// Trata erros não capturados
// =============================================

// Capturar erros globais (uncaught exceptions)
window.addEventListener('error', event => {
  console.error('[Global Error Handler]', event.error);
  showToast('Algo deu errado. Tente recarregar a página.', 'error');
});

// Capturar promises rejeitadas não tratadas
window.addEventListener('unhandledrejection', event => {
  console.error('[Unhandled Promise Rejection]', event.reason);
  
  // Não mostrar toast se for erro de autenticação (já é tratado)
  if (event.reason?.message?.includes('auth')) {
    return;
  }
  
  showToast('Erro de conexão. Tente novamente.', 'error');
});

// Capturar erros de rede
window.addEventListener('offline', () => {
  console.warn('[Network] Conexão perdida');
  showToast('Você saiu do modo online. Algumas funções podem não funcionar.', 'warning');
});

window.addEventListener('online', () => {
  console.log('[Network] Conexão restaurada');
  showToast('Você está de volta ao modo online!', 'success');
});
