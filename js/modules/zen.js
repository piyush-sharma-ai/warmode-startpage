/**
 * Zen Mode Module - Hide/show panels for distraction-free focus
 */

const ZEN_KEY = 'warmode_zen';

function isZenActive() {
  return document.body.classList.contains('zen-active');
}

export function setZenMode(active, announce = true) {
  document.body.classList.toggle('zen-active', active);
  document.querySelectorAll('.zen-target').forEach(el => {
    el.classList.toggle('zen-hidden', active);
  });
  localStorage.setItem(ZEN_KEY, active ? '1' : '0');

  const btn = document.querySelector('#hint button[onclick*="toggleZenMode"]');
  if (btn) btn.setAttribute('aria-pressed', String(active));

  if (announce) {
    if (typeof window.showToast === 'function') {
      window.showToast(active ? '🧘 Zen Mode — clutter hidden' : 'Zen Mode off — panels restored');
    }
  }
}

export function toggleZenMode() {
  setZenMode(!isZenActive());
}

export function initZen() {
  const saved = localStorage.getItem(ZEN_KEY) === '1';
  if (saved) setZenMode(true, false);
}

export { isZenActive };