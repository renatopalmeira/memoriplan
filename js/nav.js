// =============================================
// MEMORIPLAN — Navegação Sidebar + Tema Claro/Escuro
// =============================================

// ===== ÍCONES =====
const _ICONS = {
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/></svg>`,
  timer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><line x1="9" y1="2" x2="15" y2="2"/></svg>`,
};

// ===== TEMA =====
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mp-theme', theme);
  _updateThemeButtons(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function _updateThemeButtons(theme) {
  const isDark = theme === 'dark';
  const icon = isDark ? _ICONS.sun : _ICONS.moon;
  const label = isDark ? 'Modo Claro' : 'Modo Escuro';
  document.querySelectorAll('.mp-theme-icon').forEach(el => el.innerHTML = icon);
  document.querySelectorAll('.mp-theme-label').forEach(el => el.textContent = label);
}

// ===== INJETAR CSS GLOBAL =====
function _injectStyles() {
  const style = document.createElement('style');
  style.id = 'mp-nav-styles';
  style.textContent = `
    /* ---- DARK MODE VARS ---- */
    html[data-theme="dark"] {
      --bg: #111118;
      --bg-card: #1C1C26;
      --bg-card-2: #22222E;
      --text-primary: #F0F0F5;
      --text-secondary: #9898B0;
      --text-muted: #55556A;
      --border: #2A2A3A;
      --border-light: #1F1F2C;
      --accent-soft: rgba(232,56,79,0.18);
      --accent-hover: #F04060;
      --success-soft: rgba(34,197,94,0.15);
      --warning-soft: rgba(245,158,11,0.15);
      --info-soft: rgba(59,130,246,0.15);
      --purple-soft: rgba(139,92,246,0.15);
      --cyan-soft: rgba(6,182,212,0.15);
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
      --shadow-lg: 0 10px 30px rgba(0,0,0,0.6);
      --shadow-xl: 0 20px 50px rgba(0,0,0,0.7);
    }

    /* ---- SIDEBAR ---- */
    .mp-sidebar {
      position: fixed;
      top: 0; left: 0;
      width: 232px;
      height: 100vh;
      background: var(--bg-card);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: 200;
      overflow-y: auto;
      transition: background 0.3s, border-color 0.3s;
    }

    .mp-sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 22px 20px 20px;
      border-bottom: 1px solid var(--border);
    }

    .mp-logo-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #E8384F, #FF6B6B);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(232,56,79,0.35);
    }

    .mp-logo-icon svg { width: 18px; height: 18px; color: #fff; }

    .mp-logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 17px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -.02em;
    }

    .mp-logo-text span { color: #E8384F; }

    .mp-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .mp-nav-section {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: var(--text-muted);
      padding: 12px 8px 6px;
    }

    .mp-nav-item {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 10px 12px;
      border-radius: 10px;
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 13.5px;
      font-weight: 600;
      transition: all 0.18s;
      border: none;
      background: transparent;
      cursor: pointer;
      width: 100%;
      text-align: left;
      font-family: inherit;
    }

    .mp-nav-item:hover {
      background: var(--border-light);
      color: var(--text-primary);
    }

    .mp-nav-item.active {
      background: rgba(232,56,79,0.1);
      color: #E8384F;
    }

    .mp-nav-item.active .mp-nav-icon {
      color: #E8384F;
    }

    .mp-nav-icon {
      width: 20px; height: 20px;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }

    .mp-nav-icon svg { width: 18px; height: 18px; }

    .mp-nav-label { flex: 1; }

    .mp-sidebar-footer {
      padding: 12px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    /* ---- LAYOUT PUSH ---- */
    body.mp-has-sidebar {
      padding-left: 232px;
    }

    /* Hide old top nav */
    body.mp-has-sidebar .hero-nav {
      display: none !important;
    }

    /* ---- BOTTOM NAV (mobile) ---- */
    .mp-bottom-nav {
      display: none;
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      z-index: 200;
      padding: 8px 4px env(safe-area-inset-bottom, 0px);
    }

    .mp-bn-inner {
      display: flex;
      justify-content: space-around;
    }

    .mp-bn-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 6px 10px;
      border-radius: 10px;
      text-decoration: none;
      color: var(--text-muted);
      font-size: 10px;
      font-weight: 600;
      transition: all 0.18s;
      border: none;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      min-width: 56px;
    }

    .mp-bn-item.active {
      color: #E8384F;
    }

    .mp-bn-item:hover { color: var(--text-primary); }

    .mp-bn-icon {
      width: 22px; height: 22px;
      display: flex; align-items: center; justify-content: center;
    }

    .mp-bn-icon svg { width: 20px; height: 20px; }

    @media (max-width: 768px) {
      .mp-sidebar { display: none !important; }
      .mp-bottom-nav { display: flex; flex-direction: column; }
      body.mp-has-sidebar { padding-left: 0 !important; padding-bottom: 72px; }
    }

    /* ---- TOAST ---- */
    #toast {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: var(--text-primary);
      color: var(--bg-card);
      padding: 10px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 600;
      opacity: 0;
      transition: all 0.3s;
      pointer-events: none;
      z-index: 9999;
      white-space: nowrap;
    }
    #toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);
}

// ===== INJETAR SIDEBAR =====
function injectNav() {
  _injectStyles();

  const savedTheme = localStorage.getItem('mp-theme') || 'light';
  applyTheme(savedTheme);

  const path = window.location.pathname;
  const pages = [
    {
      href: '/index.html', label: 'Painel', match: ['/', '/index.html'],
      icon: _ICONS.dashboard
    },
    {
      href: '/cronograma.html', label: 'Cronograma', match: ['/cronograma.html'],
      icon: _ICONS.calendar
    },
    {
      href: '/sessoes.html', label: 'Sessões de Estudo', match: ['/sessoes.html'],
      icon: _ICONS.timer
    },
  ];

  const isDark = savedTheme === 'dark';

  const navItems = pages.map(p => {
    const isActive = p.match.some(m => path === m || path.endsWith(m));
    return `<a href="${p.href}" class="mp-nav-item${isActive ? ' active' : ''}">
      <span class="mp-nav-icon">${p.icon}</span>
      <span class="mp-nav-label">${p.label}</span>
    </a>`;
  }).join('');

  const mobileItems = pages.map(p => {
    const isActive = p.match.some(m => path === m || path.endsWith(m));
    const shortLabel = p.label === 'Sessões de Estudo' ? 'Sessões' : p.label;
    return `<a href="${p.href}" class="mp-bn-item${isActive ? ' active' : ''}">
      <span class="mp-bn-icon">${p.icon}</span>
      <span>${shortLabel}</span>
    </a>`;
  }).join('');

  const sidebar = document.createElement('aside');
  sidebar.className = 'mp-sidebar';
  sidebar.innerHTML = `
    <div class="mp-sidebar-logo">
      <div class="mp-logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      </div>
      <div class="mp-logo-text">Memori<span>Plan</span></div>
    </div>
    <nav class="mp-nav">
      <div class="mp-nav-section">Menu</div>
      ${navItems}
    </nav>
    <div class="mp-sidebar-footer">
      <button class="mp-nav-item" onclick="toggleTheme()">
        <span class="mp-nav-icon mp-theme-icon">${isDark ? _ICONS.sun : _ICONS.moon}</span>
        <span class="mp-nav-label mp-theme-label">${isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
      </button>
      <button class="mp-nav-item mp-logout-btn" onclick="logout();return false;">
        <span class="mp-nav-icon">${_ICONS.logout}</span>
        <span class="mp-nav-label">Sair</span>
      </button>
    </div>
  `;

  const bottomNav = document.createElement('nav');
  bottomNav.className = 'mp-bottom-nav';
  bottomNav.innerHTML = `
    <div class="mp-bn-inner">
      ${mobileItems}
      <button class="mp-bn-item" onclick="toggleTheme()">
        <span class="mp-bn-icon mp-theme-icon">${isDark ? _ICONS.sun : _ICONS.moon}</span>
        <span class="mp-theme-label">${isDark ? 'Claro' : 'Escuro'}</span>
      </button>
    </div>
  `;

  // Toast element
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.innerHTML = `<span id="toastText"></span>`;

  document.body.insertBefore(sidebar, document.body.firstChild);
  document.body.appendChild(bottomNav);
  document.body.appendChild(toast);
  document.body.classList.add('mp-has-sidebar');
}

// ===== HELPERS =====
const DISC_COLORS = {
  'Matemática':'#F59E0B','Português':'#EF4444','Biologia':'#10B981','Química':'#3B82F6',
  'Física':'#EAB308','História':'#D97706','Geografia':'#8B5CF6','Filosofia':'#6B7280',
  'Sociologia':'#EC4899','Inglês':'#06B6D4','Redação':'#F97316','Atualidades':'#14B8A6'
};

const CAT_COLORS = {
  'Teoria':'#3B82F6','Questões':'#F59E0B','Revisão':'#8B5CF6','Resumo':'#10B981'
};

function fmt(mins) {
  if (!mins || mins <= 0) return '0min';
  if (mins < 60) return Math.round(mins) + 'min';
  const h = Math.floor(mins / 60), m = Math.round(mins % 60);
  return m > 0 ? `${h}h${String(m).padStart(2,'0')}` : `${h}h`;
}

function dayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function getSunStart(d) {
  const w = new Date(d);
  w.setDate(d.getDate() - d.getDay());
  w.setHours(0, 0, 0, 0);
  return w;
}

function showToast(html) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastText').innerHTML = html;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  injectNav();
});
