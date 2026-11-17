/**
 * Main Entry Point - Initialize all modules
 */

import { store, restoreDefaultSites } from './modules/storage.js';

import { initDock, openDockModal, closeDockModal, saveDockSite } from './modules/dock.js';
import { initBookmarks, openSiteModal, closeSiteModal, saveNewSite } from './modules/bookmarks.js';
import { initGmail, openGmailModal, closeGmailModal, saveGmailAccount, closeGmailMenu, toggleGmailMenu } from './modules/gmail.js';
import {
  initTools, openToolModal, closeToolModal, saveCustomTool,
  runQuickCmd, fillQuickCmd, editCurrentCheatSheet, setToolModalMode,
} from './modules/tools.js';
import { initWidget, initWidgetEvents, switchWidgetTab, clearDoneTodos, addTodo, addHabit, addSnippet } from './modules/widget.js';
import { initSearch, handleSearch } from './modules/search.js';
import { initTimer, startCustomPomodoro, togglePomodoro, resetStatus } from './modules/timer.js';
import { initAudio, cycleAudio } from './modules/audio.js';
import {
  initScratchpad, toggleScratchpad, downloadScratchpad,
  exportAllData, triggerImportData, importAllData, renderPomoChart,
} from './modules/scratchpad.js';
import { initTheme, cycleTheme, toggleDarkMode, THEMES, getThemeIndex, getActiveTheme } from './modules/theme.js';
import { initHero, saveHeroText } from './modules/hero.js';
import { initEditMode, toggleEditMode } from './modules/edit.js';
import { initKeyboard } from './modules/keyboard.js';
import { toggleShortcutsModal, closeShortcutsModal } from './modules/shortcuts.js';
import { toggleZenMode, initZen } from './modules/zen.js';
import { toggleBreathing } from './modules/breathing.js';
import { setFocus, clearFocus, renderFocus } from './modules/focus.js';
import { showToast } from './modules/core.js';
import { closeCheatOverlay, closeOmniSuggestions, copyOverlayText } from './modules/overlay.js';

/* ------------------------------------------------------------------
 * Global bridge for inline HTML event handlers (onclick="...").
 * Inline attributes resolve against `window`, so every handler used in
 * index.html must be published here.
 * ------------------------------------------------------------------ */
const GLOBAL_HANDLERS = {
  // Dock
  openDockModal, closeDockModal, saveDockSite,
  // Bookmarks
  openSiteModal, closeSiteModal, saveNewSite,
  // Gmail
  openGmailModal, closeGmailModal, saveGmailAccount, closeGmailMenu, toggleGmailMenu,
  // Tools / cheat-sheets
  openToolModal, closeToolModal, saveCustomTool, runQuickCmd, fillQuickCmd,
  editCurrentCheatSheet, setToolModalMode,
  // Search / overlay
  handleSearch, closeCheatOverlay, closeOmniSuggestions, copyOverlayText,
  // Widget (tasks / habits / snippets)
  switchWidgetTab, clearDoneTodos, addTodo, addHabit, addSnippet,
  // Timer
  startCustomPomodoro, togglePomodoro, resetStatus,
  // Audio / scratchpad / theme
  cycleAudio, toggleScratchpad, downloadScratchpad,
  exportAllData, triggerImportData, importAllData,
  cycleTheme,
  // Hero / edit / zen / breathing
  saveHeroText, toggleEditMode, toggleZenMode, toggleBreathing,
  // Shortcuts modal
  toggleShortcutsModal, closeShortcutsModal,
  // Focus
  setFocus, clearFocus, renderFocus,
  // Toasts + reset
  showToast, restoreDefaultSites,
  // Appearance
  cycleTheme, toggleDarkMode,
};

Object.entries(GLOBAL_HANDLERS).forEach(([name, fn]) => {
  window[name] = fn;
});

// Expose store for debugging / power users.
window.store = store;

function updateKeyboardHints() {
  document.querySelectorAll('kbd[data-k]').forEach(k => {
    k.textContent = '⌥' + k.dataset.k;
  });
}

function init() {
  initTheme();
  initHero();
  initEditMode();
  initDock();
  initBookmarks();
  initGmail();
  initTools();
  initWidget();
  initWidgetEvents();
  initSearch();
  initTimer();
  initAudio();
  initScratchpad();
  initKeyboard();
  initZen();

  renderFocus();
  renderPomoChart();
  updateKeyboardHints();

  // initTheme() already painted the correct label; re-assert it in case the
  // badge element was not present during that call.
  const themeNameEl = document.getElementById('theme-name');
  const activeTheme = getActiveTheme();
  if (themeNameEl && activeTheme) themeNameEl.textContent = activeTheme.name;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}