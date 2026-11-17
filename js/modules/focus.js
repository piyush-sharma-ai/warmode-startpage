/**
 * Focus Module - Mission focus anchor
 */

import { store } from './storage.js';
import { showToast } from './core.js';

export function setFocus(text) {
  const value = String(text ?? '').trim();
  if (!value) {
    showToast('Enter a mission to focus on');
    return;
  }
  store.set('FOCUS', value);
  renderFocus();
  showToast('🎯 Mission Locked');
}

export function clearFocus() {
  store.set('FOCUS', '');
  renderFocus();
  const q = document.getElementById('q');
  if (q) q.focus();
  showToast('Mission Cleared');
}

export function renderFocus() {
  const f = store.get('FOCUS');
  const el = document.getElementById('focus-anchor');
  if (!el) return;
  if (f) {
    el.innerText = `🎯 CURRENT MISSION: ${f}`;
    el.classList.add('active');
  } else {
    el.innerText = '';
    el.classList.remove('active');
  }
}