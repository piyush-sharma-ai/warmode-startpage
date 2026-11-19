/**
 * Keyboard Module - Global keyboard shortcuts
 */

import { toggleZenMode } from './zen.js';
import { togglePomodoro } from './timer.js';
import { toggleGmailMenu, closeGmailMenu, closeGmailModal } from './gmail.js';
import { toggleScratchpad, closeScratchpad } from './scratchpad.js';
import { cycleAudio } from './audio.js';
import { toggleBreathing } from './breathing.js';
import { cycleTheme, toggleDarkMode } from './theme.js';
import { toggleEditMode } from './edit.js';
import { toggleShortcutsModal, closeShortcutsModal } from './shortcuts.js';
import { closeCheatOverlay, closeOmniSuggestions } from './overlay.js';
import { closeSiteModal } from './bookmarks.js';
import { closeDockModal } from './dock.js';
import { closeToolModal } from './tools.js';

const MODAL_IDS = ['site-modal', 'dock-modal', 'gmail-modal', 'tool-modal', 'shortcuts-modal'];

export function initKeyboard() {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', handleClick);
}

function focusSearch(select = true) {
  const q = document.getElementById('q');
  if (!q) return;
  q.focus();
  if (select && typeof q.select === 'function') q.select();
}

function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && (e.code === 'KeyK' || e.key === 'k')) {
    e.preventDefault();
    focusSearch();
    return;
  }

  if (e.altKey && !e.metaKey && !e.ctrlKey) {
    const handlers = {
      KeyZ: toggleZenMode,
      KeyP: togglePomodoro,
      KeyM: () => toggleGmailMenu(e),
      KeyS: toggleScratchpad,
      KeyA: cycleAudio,
      KeyB: toggleBreathing,
      KeyT: cycleTheme,
      KeyD: toggleDarkMode,
      KeyE: toggleEditMode,
      KeyK: toggleShortcutsModal,
    };
    const handler = handlers[e.code];
    if (handler) {
      e.preventDefault();
      handler();
      return;
    }
  }

  if (e.key === 'Escape') {
    closeGmailMenu();
    closeCheatOverlay();
    closeOmniSuggestions();
    closeSiteModal();
    closeDockModal();
    closeGmailModal();
    closeToolModal();
    closeShortcutsModal();
    closeScratchpad();
  }

  const active = document.activeElement;
  const tag = active ? active.tagName : '';
  const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (active && active.isContentEditable);
  if (e.key === '/' && !isTyping) {
    e.preventDefault();
    focusSearch(false);
  }
}

function handleClick(e) {
  const target = e.target;
  if (!target || !(target instanceof Node)) return;

  const dockWrap = document.getElementById('dock-wrap');
  const gmailModal = document.getElementById('gmail-modal');
  const insideDock = dockWrap && dockWrap.contains(target);
  const insideGmailModal = gmailModal && gmailModal.contains(target);
  if (!insideDock && !insideGmailModal) closeGmailMenu();

  const searchArea = document.getElementById('search-area');
  if (!searchArea || !searchArea.contains(target)) {
    closeCheatOverlay();
    closeOmniSuggestions();
  }

  const closeModalById = {
    'site-modal': closeSiteModal,
    'dock-modal': closeDockModal,
    'gmail-modal': closeGmailModal,
    'tool-modal': closeToolModal,
    'shortcuts-modal': closeShortcutsModal,
  };
  const id = target.id;
  if (id && Object.prototype.hasOwnProperty.call(closeModalById, id)) {
    closeModalById[id]();
  }
}

export { focusSearch };