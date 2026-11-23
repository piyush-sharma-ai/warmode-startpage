/**
 * Shortcuts Module - Keyboard shortcuts modal
 */

import { prepareModal, restoreModal, focusFirst } from './modal.js';

export function toggleShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (!modal) return;
  if (modal.classList.contains('show')) {
    modal.classList.remove('show');
    restoreModal('shortcuts-modal');
  } else {
    prepareModal('shortcuts-modal');
    modal.classList.add('show');
    focusFirst('shortcuts-modal');
  }
}

export function closeShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) {
    modal.classList.remove('show');
    restoreModal('shortcuts-modal');
  }
}
