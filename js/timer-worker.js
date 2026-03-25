// Timer Worker - mantém o cronômetro funcionando mesmo com aba inativa
let timerInterval = null;
let startTime = null;
let pausedTime = 0;
let isRunning = false;
let targetTime = null; // para modo pomodoro
let completedNotified = false;

self.onmessage = function(e) {
  const { action, data } = e.data;

  switch (action) {
    case 'start':
      startTimer(data);
      break;
    case 'pause':
      pauseTimer();
      break;
    case 'reset':
      resetTimer(data);
      break;
    case 'getTime':
      sendCurrentTime();
      break;
    case 'setElapsed':
      // Configura tempo acumulado para retomar de uma sessão anterior
      pausedTime = (data.elapsed || 0) * 1000;
      startTime = null;
      break;
  }
};

function startTimer(data) {
  if (isRunning) return;

  isRunning = true;
  completedNotified = false;
  targetTime = data.targetTime || null;

  // Sempre reconstrói startTime a partir de pausedTime (que pode ser 0 em início fresh
  // ou o elapsed configurado via setElapsed ao restaurar/resumir de pausa)
  startTime = Date.now() - pausedTime;

  timerInterval = setInterval(tick, 1000);
  tick(); // tick imediato para resposta visual instantânea
}

function tick() {
  if (!isRunning || !startTime) return;
  const now = Date.now();
  const elapsed = Math.floor((now - startTime) / 1000);

  // Verificar se atingiu o tempo alvo (modo pomodoro)
  if (targetTime && elapsed >= targetTime && !completedNotified) {
    completedNotified = true;
    self.postMessage({
      type: 'timerComplete',
      elapsed: elapsed,
      targetTime: targetTime
    });
    pauseTimer();
    return;
  }

  self.postMessage({
    type: 'tick',
    elapsed: elapsed,
    targetTime: targetTime
  });
}

function pauseTimer() {
  if (!isRunning) return;

  isRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (startTime) {
    pausedTime = Date.now() - startTime;
  }

  self.postMessage({
    type: 'paused',
    elapsed: Math.floor(pausedTime / 1000)
  });
}

function resetTimer(data) {
  isRunning = false;
  startTime = null;
  pausedTime = 0;
  completedNotified = false;
  targetTime = data ? data.targetTime : null;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  self.postMessage({
    type: 'reset',
    elapsed: 0,
    targetTime: targetTime
  });
}

function sendCurrentTime() {
  let elapsed = 0;
  if (isRunning && startTime) {
    elapsed = Math.floor((Date.now() - startTime) / 1000);
  } else if (pausedTime) {
    elapsed = Math.floor(pausedTime / 1000);
  }

  self.postMessage({
    type: 'currentTime',
    elapsed: elapsed,
    isRunning: isRunning,
    targetTime: targetTime
  });
}

// Keepalive: verifica conclusão do pomodoro mesmo se o interval foi suspenso
setInterval(() => {
  if (isRunning && targetTime && startTime && !completedNotified) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (elapsed >= targetTime) {
      completedNotified = true;
      self.postMessage({
        type: 'timerComplete',
        elapsed: elapsed,
        targetTime: targetTime
      });
      pauseTimer();
    }
  }
}, 5000);
