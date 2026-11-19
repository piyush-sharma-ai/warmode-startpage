/**
 * Timer Module - Clock, Pomodoro, Day Progress
 */

import { showToast, dayKey } from './core.js';
import { renderPomoChart } from './scratchpad.js';

let isPomodoroActive = false;
let pomodoroTimer = null;
let pomodoroSeconds = 25 * 60;
let clockLoopStarted = false;

export function initTimer() {
  dateTime();
  updateDay();
  setInterval(updateDay, 60000);
  resetStatus();
}

function playCompletionChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [528, 660, 792].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.18 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.18 + 1.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.18);
      osc.stop(ctx.currentTime + idx * 0.18 + 1.15);
    });
  } catch (e) {}
}

function dateTime() {
  const clockElem = document.getElementById('clock-display');
  if (clockElem && !isPomodoroActive) {
    clockElem.innerText = new Date().toLocaleTimeString();
  }
  if (!clockLoopStarted) {
    clockLoopStarted = true;
    setInterval(dateTime, 1000);
  }
}

export function resetStatus() {
  const sysStatus = document.getElementById('sys-status');
  if (sysStatus) {
    const n = getPomoCount();
    // Only surface the chip when there is something meaningful to say; an
    // idle "SYSTEM: ACTIVE" banner is pure noise.
    if (n > 0) {
      sysStatus.innerText = `🍅 ${n} today`;
      sysStatus.hidden = false;
    } else {
      sysStatus.innerText = '';
      sysStatus.hidden = true;
    }
    sysStatus.style.color = 'var(--color-success)';
  }
  document.title = 'WarMode';
  renderPomoChart();
}

function getPomoCount(dateObj = new Date()) {
  return +localStorage.getItem('warmode_pomo_' + dayKey(dateObj)) || 0;
}

function bumpPomo() {
  localStorage.setItem('warmode_pomo_' + dayKey(new Date()), getPomoCount() + 1);
}

export function startCustomPomodoro(minutes = 25, label = "POMODORO") {
  clearInterval(pomodoroTimer);
  isPomodoroActive = true;
  pomodoroSeconds = Math.max(1, Math.round(minutes * 60));

  const sysStatus = document.getElementById('sys-status');
  const clockElem = document.getElementById('clock-display');
  if (sysStatus) {
    sysStatus.innerText = `[${label}: ${minutes}m]`;
    sysStatus.hidden = false;
    sysStatus.style.color = label === "BREAK" ? "var(--color-primary)" : "var(--color-warning)";
  }

  const tick = () => {
    const mins = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
    const secs = (pomodoroSeconds % 60).toString().padStart(2, '0');
    if (clockElem) clockElem.innerText = `⏱ ${mins}:${secs}`;
    document.title = `⏱ ${mins}:${secs} · WarMode`;
  };

  tick();
  pomodoroTimer = setInterval(() => {
    pomodoroSeconds--;
    if (pomodoroSeconds <= 0) {
      pomodoroSeconds = 0;
      clearInterval(pomodoroTimer);
      pomodoroTimer = null;
      isPomodoroActive = false;
      if (label !== "BREAK") bumpPomo();
      playCompletionChime();
      resetStatus();
      dateTime();
      showToast(label === "BREAK" ? "Break complete! Ready for WarMode." : "🍅 Focus session complete! Take a 5m break.");
      return;
    }
    tick();
  }, 1000);
}

export function togglePomodoro() {
  if (!isPomodoroActive) {
    startCustomPomodoro(25, "POMODORO");
    showToast("🍅 25m Focus Session Started");
  } else {
    clearInterval(pomodoroTimer);
    pomodoroTimer = null;
    isPomodoroActive = false;
    resetStatus();
    dateTime();
    showToast("Timer Stopped");
  }
}

function updateDay() {
  const n = new Date();
  const p = Math.round((n - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5 * 100);
  const bar = document.getElementById('dp-bar'), txt = document.getElementById('dp-txt');
  if (bar) bar.style.width = p + '%';
  if (txt) txt.textContent = 'Day ' + p + '%';
}


export function getPomodoroState() {
  return { isPomodoroActive, pomodoroTimer, pomodoroSeconds };
}