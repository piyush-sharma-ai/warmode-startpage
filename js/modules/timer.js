/**
 * Timer Module - Pomodoro, Day Progress
 *
 * Timing strategy: the Pomodoro is driven by WALL-CLOCK time, not by
 * decrementing a counter once per second. Browsers throttle background-tab
 * timers (sometimes to ~1/minute), which would make a decrement-based timer
 * run long. By recording the start instant and computing the remaining time
 * from Date.now() on every tick, the countdown stays accurate regardless of
 * throttling. The visible clock in index.html reads getPomodoroState() and
 * renders the same computed value, so it stays correct even between ticks.
 */

import { showToast, dayKey } from './core.js';
import { renderPomoChart } from './scratchpad.js';

let isPomodoroActive = false;
let pomodoroTimer = null;
let pomodoroDurationMs = 25 * 60 * 1000;
let pomodoroStartMs = 0;
let activePomodoroLabel = "POMODORO";

export function initTimer() {
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

/** Remaining whole seconds, derived from wall-clock time. */
function remainingSeconds() {
  if (!isPomodoroActive) return 0;
  const elapsed = Date.now() - pomodoroStartMs;
  return Math.max(0, Math.round((pomodoroDurationMs - elapsed) / 1000));
}

function formatClock(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `⏱ ${mins}:${secs}`;
}

function finishPomodoro() {
  clearInterval(pomodoroTimer);
  pomodoroTimer = null;
  isPomodoroActive = false;
  pomodoroStartMs = 0;
  if (activePomodoroLabel !== "BREAK") bumpPomo();
  playCompletionChime();
  resetStatus();
  showToast(activePomodoroLabel === "BREAK"
    ? "Break complete! Ready for WarMode."
    : "🍅 Focus session complete! Take a 5m break.");
}

export function startCustomPomodoro(minutes = 25, label = "POMODORO") {
  if (isPomodoroActive) clearInterval(pomodoroTimer);
  isPomodoroActive = true;
  activePomodoroLabel = label;
  pomodoroDurationMs = Math.max(1000, Math.round(minutes * 60 * 1000));
  pomodoroStartMs = Date.now();

  const sysStatus = document.getElementById('sys-status');
  if (sysStatus) {
    sysStatus.innerText = `[${label}: ${minutes}m]`;
    sysStatus.hidden = false;
    sysStatus.style.color = label === "BREAK" ? "var(--color-primary)" : "var(--color-warning)";
  }

  const tick = () => {
    const remaining = remainingSeconds();
    document.title = formatClock(remaining) + ' · WarMode';
    if (remaining <= 0) {
      finishPomodoro();
    }
  };

  tick();
  pomodoroTimer = setInterval(tick, 1000);
}

export function togglePomodoro() {
  if (!isPomodoroActive) {
    startCustomPomodoro(25, "POMODORO");
    showToast("🍅 25m Focus Session Started");
  } else {
    clearInterval(pomodoroTimer);
    pomodoroTimer = null;
    isPomodoroActive = false;
    pomodoroStartMs = 0;
    resetStatus();
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
  return { isPomodoroActive, pomodoroTimer, pomodoroSeconds: remainingSeconds() };
}
