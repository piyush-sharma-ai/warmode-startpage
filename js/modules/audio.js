/**
 * Audio Module - Focus soundscapes synthesised with the Web Audio API.
 *
 * Browsers block AudioContext playback until a user gesture, so the saved
 * mode is restored to the *badge* only; audio actually starts on the first
 * explicit user action (cycleAudio / clicking the badge).
 */

import { showToast } from './core.js';

const STORAGE_KEY = 'warmode_audio_mode';
const AUDIO_MODES = ['Off', 'Brown Noise', 'Pink Rain', '40Hz Gamma'];

let audioCtx = null;
let activeAudioNodes = [];
let audioModeIndex = 0;

function getAudioContext() {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctor();
    } catch (e) {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function initAudio() {
  const saved = parseInt(localStorage.getItem(STORAGE_KEY), 10);
  audioModeIndex = Number.isFinite(saved) && saved >= 0 && saved < AUDIO_MODES.length ? saved : 0;
  updateAudioBadge();
}

function stopFocusAudio() {
  activeAudioNodes.forEach(n => {
    try { if (typeof n.stop === 'function') n.stop(); } catch (e) {}
    try { if (typeof n.disconnect === 'function') n.disconnect(); } catch (e) {}
  });
  activeAudioNodes = [];
}

function buildNoiseBuffer(ctx, modeIdx) {
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  if (modeIdx === 1) {
    // Brown noise: integrated white noise, normalised.
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.2;
    }
  } else {
    // Pink noise (Paul Kellet's refined method).
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
  }
  return noiseBuffer;
}

export function startFocusAudio(modeIdx) {
  stopFocusAudio();
  if (modeIdx === 0) return;

  const ctx = getAudioContext();
  if (!ctx) {
    showToast('Web Audio unavailable in this browser');
    return;
  }

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.14;
  masterGain.connect(ctx.destination);
  activeAudioNodes.push(masterGain);

  if (modeIdx === 1 || modeIdx === 2) {
    const src = ctx.createBufferSource();
    src.buffer = buildNoiseBuffer(ctx, modeIdx);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = modeIdx === 1 ? 420 : 1200;

    src.connect(filter);
    filter.connect(masterGain);
    src.start(0);
    activeAudioNodes.push(src, filter);
  } else if (modeIdx === 3) {
    // 40Hz gamma binaural: 200Hz left, 240Hz right → 40Hz beat.
    const merger = ctx.createChannelMerger(2);
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    oscL.type = 'sine';
    oscR.type = 'sine';
    oscL.frequency.value = 200;
    oscR.frequency.value = 240;

    const gainL = ctx.createGain();
    const gainR = ctx.createGain();
    gainL.gain.value = 0.5;
    gainR.gain.value = 0.5;

    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);
    merger.connect(masterGain);
    oscL.start();
    oscR.start();
    activeAudioNodes.push(oscL, oscR, gainL, gainR, merger);
  }
}

export function cycleAudio() {
  audioModeIndex = (audioModeIndex + 1) % AUDIO_MODES.length;
  localStorage.setItem(STORAGE_KEY, String(audioModeIndex));
  startFocusAudio(audioModeIndex);
  updateAudioBadge();
  showToast(`Focus Audio: ${AUDIO_MODES[audioModeIndex]}`);
}

function updateAudioBadge() {
  const badge = document.getElementById('audio-status');
  if (!badge) return;
  badge.innerHTML = `🎧 ${AUDIO_MODES[audioModeIndex]} <kbd>⌥A</kbd>`;
  badge.classList.toggle('playing', audioModeIndex !== 0);
  badge.setAttribute('aria-pressed', String(audioModeIndex !== 0));
}

export { AUDIO_MODES };