// =============================================
// MEMORIPLAN — Validação de Dados
// =============================================

// Sanitizar strings para evitar XSS
function sanitizeInput(str) {
  if (!str) return '';
  const map = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '&': '&amp;'
  };
  return str.replace(/[<>"'&]/g, m => map[m]);
}

// Validar email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validar senha (mínimo 8 caracteres)
function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, error: 'Senha deve ter no mínimo 8 caracteres' };
  }
  return { valid: true };
}

// Validar sessão de estudo
function validateSession(session) {
  const errors = [];

  if (!session.discipline || session.discipline.trim().length === 0) {
    errors.push('Disciplina é obrigatória');
  }
  
  if (session.discipline && session.discipline.length > 100) {
    errors.push('Disciplina muito longa (máx 100 caracteres)');
  }

  if (!session.minutes || session.minutes < 1 || session.minutes > 600) {
    errors.push('Duração deve estar entre 1 e 600 minutos');
  }

  if (session.topic && session.topic.length > 200) {
    errors.push('Tópico muito longo (máx 200 caracteres)');
  }

  if (session.material && session.material.length > 500) {
    errors.push('Material muito longo (máx 500 caracteres)');
  }

  if (session.questions && (session.questions < 0 || session.questions > 1000)) {
    errors.push('Número de questões deve estar entre 0 e 1000');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// Validar nome de usuário
function validateName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Nome é obrigatório' };
  }
  if (name.length < 2) {
    return { valid: false, error: 'Nome deve ter no mínimo 2 caracteres' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Nome muito longo (máx 100 caracteres)' };
  }
  return { valid: true };
}

// Validar categoria
const VALID_CATEGORIES = ['conceitos', 'exercicios', 'leitura', 'revisao', 'outro'];

function validateCategory(category) {
  if (!VALID_CATEGORIES.includes(category)) {
    return { valid: false, error: 'Categoria inválida' };
  }
  return { valid: true };
}

// Sanitizar sessão antes de enviar
function sanitizeSession(session) {
  return {
    date: session.date, // ISO string, validado pelo HTML5
    discipline: sanitizeInput(session.discipline),
    category: session.category, // enum validado
    topic: sanitizeInput(session.topic || ''),
    minutes: parseInt(session.minutes, 10),
    questions: parseInt(session.questions || 0, 10),
    material: sanitizeInput(session.material || '')
  };
}
