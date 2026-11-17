/**
 * Overlay Module - Cheat overlay management
 */

import { copyText } from './core.js';

let activeCheatKey = null;

export function showOverlay(title, content, cheatKey = null) {
  const overlay = document.getElementById('cheat-overlay');
  const contentEl = document.getElementById('overlay-content');
  const titleEl = document.getElementById('overlay-title');
  const editBtn = document.getElementById('edit-cheat-btn');
  if (!overlay || !contentEl) return;

  closeOmniSuggestions();
  activeCheatKey = cheatKey;

  if (titleEl) titleEl.textContent = title;
  if (editBtn) editBtn.style.display = cheatKey ? 'inline-block' : 'none';
  contentEl.textContent = content == null ? '' : String(content);
  overlay.style.display = 'block';
}

export function closeCheatOverlay() {
  const overlay = document.getElementById('cheat-overlay');
  if (overlay) overlay.style.display = 'none';
  activeCheatKey = null;
}

export function copyOverlayText() {
  const contentEl = document.getElementById('overlay-content');
  const text = contentEl ? contentEl.textContent : '';
  if (text) copyText(text, "Output copied");
}

/**
 * Omni suggestion dropdown is owned by search.js. To avoid a circular import
 * (search -> overlay -> search) we delegate through the window bridge that
 * search.js installs at init time, falling back to a direct DOM hide.
 */
export function closeOmniSuggestions() {
  if (typeof window.closeOmniSuggestions === 'function') {
    window.closeOmniSuggestions();
    return;
  }
  const box = document.getElementById('omni-suggestions');
  if (box) box.classList.remove('show');
}

export function getActiveCheatKey() {
  return activeCheatKey;
}