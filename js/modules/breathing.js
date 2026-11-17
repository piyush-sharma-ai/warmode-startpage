/**
 * Breathing Module - Box breathing pacer (4-4-4-4)
 */

import { showToast } from './core.js';

const PHASES = [
  { label: '🌬️ INHALE SLOWLY (4s)', scale: 1.1 },
  { label: '🧘 HOLD BREATH (4s)', scale: 1.1 },
  { label: '😮‍💨 EXHALE GENTLY (4s)', scale: 0.94 },
  { label: '✨ HOLD EMPTY (4s)', scale: 0.94 },
];

const PHASE_MS = 4000;
const TOTAL_PHASES = 16; // 4 rounds × 4 phases = 64s guided session

let breatheInterval = null;
let phaseIndex = 0;
let completedPhases = 0;

function setAnchor(anchor, text, scale) {
  if (!anchor) return;
  anchor.textContent = text;
  anchor.style.setProperty('--breathe-scale', String(scale));
}

function stopBreathing(anchor, announce = true) {
  if (breatheInterval) {
    clearInterval(breatheInterval);
    breatheInterval = null;
  }
  document.body.classList.remove('breathing');
  if (anchor) {
    anchor.classList.remove('active');
    anchor.textContent = '';
  }
  if (announce) showToast('Box Breathing Ended');
}

export function toggleBreathing() {
  const anchor = document.getElementById('breathe-anchor');
  if (!anchor) return;

  if (breatheInterval) {
    stopBreathing(anchor);
    return;
  }

  phaseIndex = 0;
  completedPhases = 0;
  anchor.classList.add('active');
  document.body.classList.add('breathing');
  setAnchor(anchor, PHASES[0].label, PHASES[0].scale);

  breatheInterval = setInterval(() => {
    completedPhases += 1;

    if (completedPhases >= TOTAL_PHASES) {
      stopBreathing(anchor, false);
      showToast('✨ Box Breathing complete — 4 rounds. Notice how you feel.');
      return;
    }

    phaseIndex = (phaseIndex + 1) % PHASES.length;
    const phase = PHASES[phaseIndex];
    setAnchor(anchor, phase.label, phase.scale);
  }, PHASE_MS);

  showToast('Box Breathing Started (4-4-4-4 · 60s)');
}

export function stopBreathingGuide() {
  stopBreathing(document.getElementById('breathe-anchor'), false);
}