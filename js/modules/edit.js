/**
 * Edit Mode Module - Toggle edit mode for all editable elements
 */

import { showToast } from './core.js';
import { saveHeroText } from './hero.js';
import { renderDock } from './dock.js';
import { renderBookmarks } from './bookmarks.js';
import { renderGmails } from './gmail.js';
import { renderQuickTools } from './tools.js';

let isEditMode = false;

const EDITABLE_IDS = ['greeting', 'subline-text', 'prompt-user', 'prompt-path', 'prompt-hash'];

export function initEditMode() {
  window.isEditMode = false;
}

function renderAll() {
  renderBookmarks();
  renderDock();
  renderGmails();
  renderQuickTools();
}

export function toggleEditMode() {
  isEditMode = !isEditMode;
  window.isEditMode = isEditMode;
  document.body.classList.toggle('edit-mode', isEditMode);

  const btn = document.getElementById('edit-mode-btn');

  if (isEditMode) {
    if (btn) {
      btn.classList.add('active');
      btn.innerHTML = '💾';
      btn.title = 'Save Changes (⌥E)';
    }
    EDITABLE_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('contenteditable', 'true');
    });
    showToast('Edit Mode ON — Click any Site, Dock App, Email, Tool or Text to Edit!');
  } else {
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '✏️';
      btn.title = 'Enter Edit Mode (⌥E)';
    }
    EDITABLE_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.removeAttribute('contenteditable');
    });
    saveHeroText();
    showToast('✔ All Customizations Saved');
  }

  renderAll();
}