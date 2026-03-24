// =============================================
// MEMORIPLAN — Sistema de Notificações (Toast)
// =============================================

function createToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      font-family: 'Plus Jakarta Sans', sans-serif;
    `;
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'success', duration = 3000) {
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  const bgColor = {
    success: '#22C55E',
    error: '#E8384F',
    warning: '#F59E0B',
    info: '#3B82F6'
  }[type] || '#3B82F6';
  
  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }[type] || 'ℹ';
  
  toast.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 14px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 280px;
    max-width: 400px;
  `;
  
  toast.innerHTML = `<span style="font-size: 18px;">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  
  // Auto-remove
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Adicionar animações ao documento
if (document.getElementById('toast-styles') === null) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Atalhos
const Toast = {
  success: (msg, dur) => showToast(msg, 'success', dur),
  error: (msg, dur) => showToast(msg, 'error', dur),
  warning: (msg, dur) => showToast(msg, 'warning', dur),
  info: (msg, dur) => showToast(msg, 'info', dur)
};
